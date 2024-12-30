"use client";

import React, { useState, useEffect } from "react";
import { CasinoTable, TableData } from "./casino-table";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database.types";

type TableWithSettings = {
  gaming_table_id: string;
  casino_id: string;
  table_name: string;
  settings_name: string;
  seats_available: number;
};

export function CasinoFloorView() {
  const [tables, setTables] = useState<TableWithSettings[]>([]);
  const [ratingSlips, setRatingSlips] = useState<
    Database["public"]["Tables"]["ratingslip"]["Row"][]
  >([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch tables with settings
      const { data: tableData, error: tableError } = await supabase.from(
        "gamingtable"
      ).select(`
          id,
          casino_id,
          name,
          gamingtablesettings (
            gamesettings (
              name,
              seats_available
            )
          )
        `);

      if (tableError) {
        console.error("Error fetching tables:", tableError);
        return;
      }

      const formattedTables =
        tableData?.map((table) => ({
          gaming_table_id: table.id,
          casino_id: table.casino_id || "",
          table_name: table.name,
          settings_name:
            table.gamingtablesettings?.[0]?.gamesettings?.name || "",
          seats_available:
            table.gamingtablesettings?.[0]?.gamesettings?.seats_available || 0,
        })) || [];

      setTables(formattedTables);

      // Fetch active rating slips (where end_time is null)
      const { data: slipData, error: slipError } = await supabase
        .from("ratingslip")
        .select(
          `
          *,
          visit (
            player (
              firstName,
              lastName
            )
          )
        `
        )
        .is("end_time", null);
      console.log("slipData", slipData);
      if (slipError) {
        console.error("Error fetching rating slips:", slipError);
        return;
      }

      if (slipData) setRatingSlips(slipData);
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

  return (
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
                ) as (Database["public"]["Tables"]["player"]["Row"] | null)[],
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
            />
          </div>
        );
      })}
    </div>
  );
}
