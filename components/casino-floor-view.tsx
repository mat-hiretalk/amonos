"use client";

import React, { useState, useEffect } from "react";
import CasinoTable from "./casino-table";
import type { TableData } from "./casino-table";
import {
  fetchCasinoTables,
  fetchActiveRatingSlips,
  createRatingSlip,
  type TableWithSettings,
  type RatingSlipWithPlayer,
} from "@/app/actions/casino";
import { createClient } from "@/utils/supabase/client";

interface CasinoFloorViewProps {
  casinoId: string;
}

export function CasinoFloorView({ casinoId }: CasinoFloorViewProps) {
  const [tables, setTables] = useState<TableWithSettings[]>([]);
  const [ratingSlips, setRatingSlips] = useState<RatingSlipWithPlayer[]>([]);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialData() {
      try {
        console.log("Fetching initial casino floor data...");
        const [tablesData, slipsData] = await Promise.all([
          fetchCasinoTables(casinoId),
          fetchActiveRatingSlips(),
        ]);

        if (!isMounted) return;

        console.log("Initial tables data:", tablesData);
        console.log("Initial rating slips:", slipsData);

        setTables(tablesData);
        setRatingSlips(slipsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    }

    // Set up Supabase real-time subscriptions
    const ratingSlipsSubscription = supabase
      .channel("rating-slips-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ratingslip",
        },
        async () => {
          console.log("Rating slip change detected, fetching latest data...");
          const newSlipsData = await fetchActiveRatingSlips();
          if (isMounted) {
            setRatingSlips(newSlipsData);
          }
        }
      )
      .subscribe();

    const tablesSubscription = supabase
      .channel("tables-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gamingtable",
        },
        async () => {
          console.log("Gaming table change detected, fetching latest data...");
          const newTablesData = await fetchCasinoTables(casinoId);
          if (isMounted) {
            setTables(newTablesData);
          }
        }
      )
      .subscribe();

    fetchInitialData();

    return () => {
      isMounted = false;
      ratingSlipsSubscription.unsubscribe();
      tablesSubscription.unsubscribe();
    };
  }, [casinoId]);

  const handleUpdateTable = async (
    updatedTable: TableData,
    playerId: string,
    seatNumber: number
  ) => {
    try {
      console.log("Creating rating slip with table:", {
        tableId: updatedTable.id,
        playerId,
        seatNumber,
        casinoId,
      });

      await createRatingSlip(updatedTable.id, playerId, seatNumber, casinoId);
      // No need to manually fetch data here as Supabase subscriptions will handle updates
    } catch (error) {
      console.error("Error updating table:", error);
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
                ),
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
              tables={tables.map((t) => ({
                id: t.gaming_table_id,
                name: t.table_name,
              }))}
            />
          </div>
        );
      })}
    </div>
  );
}
