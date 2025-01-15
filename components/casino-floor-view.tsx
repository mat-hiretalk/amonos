"use client";

import React from "react";
import { useTables } from "@/hooks/useTables";
import CasinoTable from "./casino-table";
import type { TableData } from "./casino-table";
import { Database } from "@/database.types";

type GamingTable = Database["public"]["Tables"]["gamingtable"]["Row"] & {
  gamingtablesettings?: Array<{
    gamesettings?: Database["public"]["Tables"]["gamesettings"]["Row"] | null;
  }> | null;
};

interface CasinoFloorViewProps {
  casinoId: string;
}

export function CasinoFloorView({ casinoId }: CasinoFloorViewProps) {
  const { tables, isLoading } = useTables(casinoId);

  if (isLoading) {
    return <div>Loading tables...</div>;
  }

  const convertToTableData = (table: GamingTable): TableData => ({
    id: table.id,
    name: table.name,
    seats: Array.from({ length: 6 }, () => null),
    averageBet: 0,
    status: "active",
    hasVIP: false,
    ratingSlips: [],
  });

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[2048px] mx-auto">
      {tables.map((table: GamingTable) => (
        <CasinoTable
          key={table.id}
          table={convertToTableData(table)}
          tables={tables.map((t: GamingTable) => ({ id: t.id, name: t.name }))}
          selectedCasino={casinoId}
        />
      ))}
    </div>
  );
}
