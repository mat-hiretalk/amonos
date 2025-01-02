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

interface CasinoFloorViewProps {
  casinoId: string;
}

export function CasinoFloorView({ casinoId }: CasinoFloorViewProps) {
  const [tables, setTables] = useState<TableWithSettings[]>([]);
  const [ratingSlips, setRatingSlips] = useState<RatingSlipWithPlayer[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tablesData, slipsData] = await Promise.all([
          fetchCasinoTables(casinoId),
          fetchActiveRatingSlips(),
        ]);

        setTables(tablesData);
        setRatingSlips(slipsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

    // Set up polling for updates
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
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
      // Refresh data after creating a new rating slip
      const [tablesData, slipsData] = await Promise.all([
        fetchCasinoTables(casinoId),
        fetchActiveRatingSlips(),
      ]);
      setTables(tablesData);
      setRatingSlips(slipsData);
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
            />
          </div>
        );
      })}
    </div>
  );
}
