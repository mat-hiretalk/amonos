import { useState } from "react"
import { Users } from 'lucide-react'
import { CasinoTable, TableData } from "./casino-table"

// This would typically come from your backend or state management
const mockData: TableData[] = [
  { 
    id: "Table 1", 
    seats: [null, { name: "Alice", balance: 500 }, null, { name: "Bob", balance: 750 }, null, null],
    averageBet: 50, 
    status: "active", 
    hasVIP: true 
  },
  { 
    id: "Table 2", 
    seats: [null, null, { name: "Charlie", balance: 300 }, { name: "David", balance: 450 }, null, null],
    averageBet: 25, 
    status: "active", 
    hasVIP: false 
  },
  { 
    id: "Table 3", 
    seats: [null, null, null, null, null, null],
    averageBet: 0, 
    status: "inactive", 
    hasVIP: false 
  },
  { 
    id: "Table 4", 
    seats: [{ name: "Eve", balance: 1000 }, { name: "Frank", balance: 1200 }, { name: "Grace", balance: 800 }, { name: "Henry", balance: 900 }, { name: "Ivy", balance: 1100 }, null],
    averageBet: 100, 
    status: "active", 
    hasVIP: true 
  },
  { 
    id: "Table 5", 
    seats: [null, { name: "Jack", balance: 600 }, null, null, null, null],
    averageBet: 75, 
    status: "active", 
    hasVIP: false 
  },
]

export function PitOverview() {
  const [tables, setTables] = useState<TableData[]>(mockData)

  const totalPlayers = tables.reduce((sum, table) => sum + table.seats.filter(Boolean).length, 0)

  const handleUpdateTable = (updatedTable: TableData) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === updatedTable.id ? updatedTable : table
      )
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pit Overview</h1>
      <div className="flex items-center space-x-2">
        <Users className="h-5 w-5" />
        <span className="text-xl font-semibold">Total Players in Pit: {totalPlayers}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tables.map((table) => (
          <CasinoTable key={table.id} table={table} onUpdateTable={handleUpdateTable} />
        ))}
      </div>
    </div>
  )
}

