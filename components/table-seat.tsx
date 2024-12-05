import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { User, UserPlus, DollarSign } from 'lucide-react'
import { useState } from "react"
import { RatingSlipModal } from "./rating-slip-modal"

type Player = Database['public']['Tables']['player']['Row']
type RatingSlip = Database['public']['Tables']['ratingslip']['Row'] & {
  visit?: {
    player?: {
      name: string
    }
  }
}

interface SeatProps {
  seatNumber: number
  player: Player | null
  occupiedBy?: RatingSlip
  onSeatPlayer: (seatNumber: number) => void
}

export function TableSeat({ seatNumber, player, occupiedBy, onSeatPlayer }: SeatProps) {
  const [isRatingSlipOpen, setIsRatingSlipOpen] = useState(false)

  if (occupiedBy) {
    return (
      <>
        <div 
          className="flex items-center justify-between p-2 bg-secondary rounded-md cursor-pointer hover:bg-secondary/80"
          onClick={() => setIsRatingSlipOpen(true)}
        >
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <div className="text-sm">
              <p className="font-medium">{occupiedBy?.visit?.player?.name}</p>
              <p className="text-muted-foreground text-xs">Active Player</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">${occupiedBy.average_bet}</span>
          </div>
        </div>

        {occupiedBy && (
          <RatingSlipModal
            ratingSlip={occupiedBy}
            isOpen={isRatingSlipOpen}
            onClose={() => setIsRatingSlipOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => onSeatPlayer(seatNumber)}>
      <UserPlus className="h-4 w-4 mr-2" />
      Seat {seatNumber}
    </Button>
  )
}

