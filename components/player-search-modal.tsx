'use client'

import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { Database } from '@/database.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Player = Database['public']['Tables']['player']['Row']
type TableSeat = {
  table_id: string
  seat_number: number
  table_name: string
}

interface PlayerSearchModalProps {
  selectedCasino: string
  onPlayerSelected: (player: Player, action: "visit" | "seat", seatInfo?: { table_id: string, seat_number: number }) => void
}

export function PlayerSearchModal({ selectedCasino, onPlayerSelected }: PlayerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showSeatSelector, setShowSeatSelector] = useState(false)
  const [availableSeats, setAvailableSeats] = useState<TableSeat[]>([])
  const supabase = createClient();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setIsLoading(true)
    const { data, error } = await supabase
      .from('player')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10)
    setIsLoading(false)
    
    if (error) {
      console.error('Error searching players:', error)
      return
    }

    setSearchResults(data || [])
  }

  const fetchAvailableSeats = async () => {
    const { data: openSeats, error } = await supabase
      .from('open_seats_by_table')
      .select('gaming_table_id, table_name, open_seat_numbers, casino_id')
      //.eq('casino_id', selectedCasino)

    console.log('Raw open seats data:', openSeats)

    if (error) {
      console.error('Error fetching available seats:', error)
      return
    }

    // Transform the data to match the TableSeat type
    const availableSeatsArray: TableSeat[] = openSeats
      .filter(table => {
        console.log('Filtering table:', table)
        return table.gaming_table_id && table.table_name && table.open_seat_numbers
      })
      .flatMap(table => {
        const seatNumbers = table.open_seat_numbers!
          .split(',')
          .map(num => parseInt(num.trim()))
        
        console.log('Seat numbers for table:', table.table_name, seatNumbers)

        return seatNumbers.map(seatNumber => ({
          table_id: table.gaming_table_id!,
          seat_number: seatNumber,
          table_name: table.table_name!
        }))
      })
    
    console.log('Transformed seats array:', availableSeatsArray)
    setAvailableSeats(availableSeatsArray)
  }

  const handleAction = async (player: Player, action: "visit" | "seat") => {
    if (action === "seat") {
      setSelectedPlayer(player)
      await fetchAvailableSeats()
      setShowSeatSelector(true)
      return
    }

    // Handle visit action as before
    const { error: visitError } = await supabase
      .from('visit')
      .insert([
        {
          player_id: player.id,
          casino_id: selectedCasino,
          check_in_date: new Date().toISOString(),
        }
      ])

    if (visitError) {
      console.error('Error creating visit:', visitError)
      return
    }

    onPlayerSelected(player, action)
  }

  const handleSeatSelection = async (seat: TableSeat) => {
    if (!selectedPlayer) return

    // Create visit first
    const { data: visitData, error: visitError } = await supabase
      .from('visit')
      .insert([
        {
          player_id: selectedPlayer.id,
          casino_id: selectedCasino,
          check_in_date: new Date().toISOString(),
        }
      ])
      .select()

    if (visitError) {
      console.error('Error creating visit:', visitError)
      return
    }

    // Create rating slip
    const { error: ratingError } = await supabase
      .from('ratingslip')
      .insert([
        {
          visit_id: visitData[0].id,
          gaming_table_id: seat.table_id,
          seat_number: seat.seat_number,
          start_time: new Date().toISOString(),
          average_bet: 0, // Required field, initialize with 0
          game_settings: {} // Required field, initialize with empty object
        }
      ])

    if (ratingError) {
      console.error('Error creating rating slip:', ratingError)
      return
    }

    setShowSeatSelector(false)
    onPlayerSelected(selectedPlayer, "seat", { table_id: seat.table_id, seat_number: seat.seat_number })
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2">
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>
      </div>

      <div className="space-y-2">
        {searchResults.map((player) => (
          <div
            key={player.id}
            className="p-3 border rounded-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-muted-foreground">
                  {player.phone_number} • {player.email}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleAction(player, "visit")}
                >
                  Make Visitor
                </Button>
                <Button
                  onClick={() => handleAction(player, "seat")}
                >
                  Select Seat
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showSeatSelector} onOpenChange={setShowSeatSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Available Seat</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {availableSeats.map((seat) => (
              <Button
                key={`${seat.table_id}-${seat.seat_number}`}
                variant="outline"
                onClick={() => handleSeatSelection(seat)}
                className="p-4"
              >
                {seat.table_name} - Seat {seat.seat_number}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

