import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { User, UserPlus } from 'lucide-react'

type Player = Database['public']['Tables']['player']['Row']

interface SeatProps {
  seatNumber: number
  player: Player | null
  onSeatPlayer: (seatNumber: number) => void
}

export function TableSeat({ seatNumber, player, onSeatPlayer }: SeatProps) {
  if (player) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-secondary rounded-md">
        <User className="h-4 w-4" />
        <div className="text-sm">
          <p className="font-medium">{player.name}</p>
          <p className="text-muted-foreground text-xs">{player.email}</p>
        </div>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => onSeatPlayer(seatNumber)}>
      <UserPlus className="h-4 w-4 mr-2" />
      Seat {seatNumber}
    </Button>
  )
}

