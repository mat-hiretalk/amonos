import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Star, Users } from 'lucide-react'
import { TableSeat } from "./table-seat"

interface Player {
  name: string
  balance: number
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
}

export function CasinoTable({ table, onUpdateTable }: CasinoTableProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerBalance, setNewPlayerBalance] = useState("")

  const handleSeatPlayer = (seatNumber: number) => {
    setSelectedSeat(seatNumber)
  }

  const handleConfirmSeatPlayer = () => {
    if (selectedSeat !== null && newPlayerName && newPlayerBalance) {
      const updatedSeats = [...table.seats]
      updatedSeats[selectedSeat - 1] = { name: newPlayerName, balance: parseInt(newPlayerBalance) }
      
      const updatedTable: TableData = {
        ...table,
        seats: updatedSeats,
        status: "active"
      }
      
      onUpdateTable(updatedTable)
      setSelectedSeat(null)
      setNewPlayerName("")
      setNewPlayerBalance("")
    }
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
              player={player || undefined}
              onSeatPlayer={handleSeatPlayer}
            />
          ))}
        </div>
      </CardContent>

      <Dialog open={selectedSeat !== null} onOpenChange={() => setSelectedSeat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat New Player at {table.id}, Seat {selectedSeat}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Balance
              </Label>
              <Input
                id="balance"
                type="number"
                value={newPlayerBalance}
                onChange={(e) => setNewPlayerBalance(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmSeatPlayer}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

