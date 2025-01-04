"use client";

import React, { useState, useEffect } from "react";
import { CasinoTable, TableData } from "./casino-table";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/database.types";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { stopRating } from "@/app/actions/stop-rating";
import { startRating } from "@/app/actions/start-rating";

type GamingTable =
  Database["public"]["Views"]["activetablesandsettings"]["Row"];
type RatingSlip = Database["public"]["Tables"]["ratingslip"]["Row"];
type Player = Database["public"]["Tables"]["player"]["Row"];

export type TableSeat = {
  table_id: string;
  seat_number: number;
  table_name: string;
};

interface CasinoFloorViewProps {
  onSeatSelect: (seat: TableSeat) => void;
}

export function CasinoFloorView({
  onSeatSelect,
}: CasinoFloorViewProps): JSX.Element {
  const [tables, setTables] = useState<GamingTable[]>([]);
  const [ratingSlips, setRatingSlips] = useState<RatingSlip[]>([]);
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch tables
        const { data: tableData, error: tableError } = await supabase
          .from("activetablesandsettings")
          .select("*");

        if (tableError) {
          console.error("Error fetching tables:", tableError);
          return;
        }

        // Fetch active rating slips (where end_time is null)
        const { data: slipData, error: slipError } = await supabase
          .from("ratingslip")
          .select(
            `
            *,
            visit:visit_id (
              player:player_id (
                name
              )
            )
          `
          )
          .is("end_time", null);

        if (slipError) {
          console.error("Error fetching rating slips:", slipError);
          return;
        }

        if (tableData) setTables(tableData);
        if (slipData) setRatingSlips(slipData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Set up real-time subscriptions
    const tableChannel = supabase
      .channel("table_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activetablesandsettings",
        },
        () => fetchData()
      )
      .subscribe();

    const ratingSlipChannel = supabase
      .channel("rating_slip_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ratingslip",
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tableChannel);
      supabase.removeChannel(ratingSlipChannel);
    };
  }, []);

  const handleUpdateTable = async (
    updatedTable: TableData,
    playerId: string,
    seatNumber: number
  ) => {
    const { data: visitData, error: visitError } = await supabase
      .from("visit")
      .select("id")
      .eq("player_id", playerId)
      .is("check_out_date", null)
      .single();

    if (visitError) {
      console.error("Error finding active visit:", visitError);
      return;
    }

    const { error: ratingError } = await supabase.from("ratingslip").insert({
      gaming_table_id: updatedTable.id,
      visit_id: visitData.id,
      start_time: new Date().toISOString(),
      average_bet: 0,
      seat_number: seatNumber,
      game_settings: {},
    });

    if (ratingError) {
      console.error("Error creating rating slip:", ratingError);
    }
  };

  const handleMovePlayer = async (
    ratingSlipId: string,
    newTableId: string,
    newSeatNumber: number
  ) => {
    // End the current rating slip
    const stoppedRatingSlip = await stopRating(ratingSlipId);

    if (!stoppedRatingSlip.oldSlip || !stoppedRatingSlip.oldSlip.visit_id) {
      console.error("Error stopping rating slip:", ratingSlipId);
      return;
    }

    // Create a new rating slip for the new position
    const newSlip = await startRating(
      stoppedRatingSlip.oldSlip.visit_id,
      newTableId,
      newSeatNumber,
      stoppedRatingSlip.oldSlip.average_bet,
      stoppedRatingSlip.oldSlip.game_settings
    );
    console.log("new slip", newSlip);
    if (!newSlip.ratingSlip) {
      console.error(
        "Error creating new rating slip:",
        stoppedRatingSlip.oldSlip
      );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[2048px] mx-auto">
        {tables.map((table) => {
          const tableRatingSlips = ratingSlips.filter(
            (slip) => slip.gaming_table_id === table.gaming_table_id
          );

          return (
            <div key={table.gaming_table_id} className="w-full">
              <CasinoTable
                key={table.gaming_table_id}
                table={{
                  name: `${table.table_name ?? ""} - ${table.settings_name ?? ""}`,
                  id: table.gaming_table_id ?? "",
                  seats: Array.from(
                    { length: Number(table.seats_available ?? 0) },
                    () => null
                  ) as (Player | null)[],
                  averageBet:
                    tableRatingSlips.reduce(
                      (sum, slip) => sum + slip.average_bet,
                      0
                    ) / (tableRatingSlips.length || 1),
                  status: "active",
                  hasVIP: false,
                  ratingSlips: tableRatingSlips,
                }}
                selectedCasino={table.casino_id}
                onUpdateTable={handleUpdateTable}
                onMovePlayer={handleMovePlayer}
              />
            </div>
          );
        })}
      </div>
    </DndProvider>
  );
}
