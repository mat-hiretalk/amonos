import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Player {
  id: string
  name: string
  avatar: string
  tableId: string
  seatNumber: number
}

interface BlackjackTableProps {
  id: string
  number: number
  players: Player[]
  onSelectPlayer: (player: Player) => void
}

export function BlackjackTable({ id, number, players, onSelectPlayer }: BlackjackTableProps) {
  const renderSeat = (seatNumber: number) => {
    const player = players.find(p => p.tableId === id && p.seatNumber === seatNumber)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 ${
                player ? 'bg-yellow-400 border-yellow-500' : 'bg-transparent border-yellow-300'
              } hover:ring-2 hover:ring-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              onClick={() => player && onSelectPlayer(player)}
              aria-label={player ? `Select ${player.name}` : `Empty seat ${seatNumber}`}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{player ? player.name : `Empty seat ${seatNumber}`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="relative w-48 h-24 md:w-64 md:h-32 mb-8 md:mb-16 mx-4 md:mx-8">
      {/* Table base */}
      <div className="absolute bottom-0 w-full h-full">
        {/* Semi-circular table */}
        <div className="absolute bottom-0 w-full h-[90%] bg-green-800 border-4 md:border-8 border-zinc-800 rounded-t-full">
          {/* Player positions */}
          <div className="absolute bottom-2 md:bottom-4 w-full flex justify-around px-2 md:px-4">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="relative">
                {renderSeat(index + 1)}
              </div>
            ))}
          </div>
        </div>
        {/* Table number */}
        <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
          Table {number}
        </div>
      </div>
    </div>
  )
}

