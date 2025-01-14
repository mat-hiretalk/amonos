"use client";

import React, { useEffect, useState } from "react";
import CasinoTable from "./casino-table";
import {
  fetchCasinoTables,
  fetchActiveRatingSlips,
} from "@/app/actions/casino";
import { useTableStore } from "@/store/table-store";
import type { TableData } from "./casino-table";

interface CasinoFloorViewProps {
  casinoId: string;
}

export function CasinoFloorView({ casinoId }: CasinoFloorViewProps) {
  const { tables, setTables, setIsLoading } = useTableStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [tablesData, activeRatingSlips] = await Promise.all([
          fetchCasinoTables(casinoId),
          fetchActiveRatingSlips(),
        ]);

        if (isCancelled) return;

        // Transform the data to match TableData type
        const transformedTables: TableData[] = tablesData.map((table) => {
          const tableRatingSlips = activeRatingSlips.filter(
            (slip) => slip.gaming_table_id === table.gaming_table_id
          );

          // Create seats array with players from rating slips
          const seats = Array.from(
            { length: Number(table.seats_available ?? 0) },
            (_, index) => {
              const seatNumber = index + 1;
              const ratingSlip = tableRatingSlips.find(
                (slip) => slip.seat_number === seatNumber
              );
              if (ratingSlip?.visit?.player) {
                return {
                  id: ratingSlip.playerId,
                  firstName: ratingSlip.visit.player.firstName,
                  lastName: ratingSlip.visit.player.lastName,
                  email: "",
                  company_id: null,
                  dob: null,
                  phone_number: null,
                };
              }
              return null;
            }
          );

          return {
            id: table.gaming_table_id,
            name: `${table.table_name ?? ""} - ${table.settings_name ?? ""}`,
            seats,
            averageBet: tableRatingSlips.reduce(
              (sum, slip) => sum + slip.average_bet,
              0
            ),
            status: "active",
            hasVIP: false,
            ratingSlips: tableRatingSlips,
          };
        });

        setTables(transformedTables);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (isMounted && casinoId) {
      fetchInitialData();
    }

    return () => {
      isCancelled = true;
    };
  }, [casinoId, setTables, setIsLoading, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[2048px] mx-auto">
      {tables.map((table) => (
        <div key={table.id} className="w-full">
          <CasinoTable
            key={table.id}
            table={table}
            selectedCasino={casinoId}
            tables={tables.map((t) => ({
              id: t.id,
              name: t.name,
            }))}
          />
        </div>
      ))}
    </div>
  );
}
