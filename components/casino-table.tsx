import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, Star, Users } from 'lucide-react'
import { TableSeat } from "./table-seat"
import { PlayerSearchModal } from "./player-search-modal"

interface Player {
  id: string
  name: string | null
  email: string | null
  phone_number: string | null
  company_id: string | null
  dob: string | null
}

export interface TableData {
  id: string
  seats: (Player | null)[]
  averageBet: number
  status: "active" | "inactive"
  hasVIP: boolean
}

interface CasinoTableProps {
  table: TableData
  onUpdateTable: (updatedTable: TableData) => void
  selectedCasino: string
}

export function CasinoTable({ table, onUpdateTable, selectedCasino }: CasinoTableProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  const handleSeatPlayer = (seatNumber: number) => {
    setSelectedSeat(seatNumber)
  }

  const handlePlayerSelected = (player: Player) => {
    if (selectedSeat === null) return

    const updatedSeats = [...table.seats]
    updatedSeats[selectedSeat - 1] = {
      id: player.id,
      name: player.name,
      email: player.email,
      phone_number: player.phone_number,
      company_id: player.company_id,
      dob: player.dob
    }
    
    const updatedTable: TableData = {
      ...table,
      seats: updatedSeats,
      status: "active"
    }
    
    onUpdateTable(updatedTable)
    setSelectedSeat(null)
  }

  return (
    <Card className={table.status === "active" ? "border-green-500" : "border-red-500"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{table.id}</CardTitle>
        {table.hasVIP && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">{table.seats.filter(Boolean).length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">{table.averageBet}</span>
          </div>
          <Badge variant={table.status === "active" ? "default" : "secondary"}>
            {table.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {table.seats.map((player, index) => (
            <TableSeat
              key={index}
              seatNumber={index + 1}
              player={player || null}
              onSeatPlayer={handleSeatPlayer}
            />
          ))}
        </div>
      </CardContent>

      <Dialog open={selectedSeat !== null} onOpenChange={() => setSelectedSeat(null)}>
        <DialogContent className="sm:max-w-[768px]">
          <DialogHeader>
            <DialogTitle>Select Player for Seat {selectedSeat}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <PlayerSearchModal 
              selectedCasino={selectedCasino} 
              mode="seat"
              onPlayerSelected={handlePlayerSelected}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

