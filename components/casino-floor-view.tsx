"use client";

import React from "react";
import { useTables } from "@/hooks/useTables";
import CasinoTable from "./casino-table";
import type { TableData } from "./casino-table";

interface CasinoFloorViewProps {
  casinoId: string;
}

export function CasinoFloorView({ casinoId }: CasinoFloorViewProps) {
  const { tables, isLoading } = useTables(casinoId);

  if (isLoading) {
    return <div>Loading tables...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tables.map((table) => (
        <CasinoTable
          key={table.id}
          table={table}
          tables={tables.map((t) => ({ id: t.id, name: t.name }))}
          selectedCasino={casinoId}
        />
      ))}
    </div>
  );
}
