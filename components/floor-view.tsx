"use client"

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Player {
  id: number
  name: string
  position: { x: number; y: number }
  avatar: string
}

const players: Player[] = [
  { id: 1, name: "John Doe", position: { x: 20, y: 30 }, avatar: "/placeholder.svg?height=32&width=32" },
  { id: 2, name: "Jane Smith", position: { x: 70, y: 50 }, avatar: "/placeholder.svg?height=32&width=32" },
  { id: 3, name: "Mike Johnson", position: { x: 40, y: 70 }, avatar: "/placeholder.svg?height=32&width=32" },
]

export function FloorView() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Floor View</h2>
      <div className="relative bg-gray-200 aspect-video rounded-lg overflow-hidden">
        {/* Floor layout */}
        <div className="absolute inset-4 border-2 border-dashed border-gray-400"></div>
        
        {/* Players */}
        <TooltipProvider>
          {players.map((player) => (
            <Tooltip key={player.id}>
              <TooltipTrigger asChild>
                <button
                  className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 hover:ring-2 hover:ring-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ left: `${player.position.x}%`, top: `${player.position.y}%` }}
                  onClick={() => setSelectedPlayer(player)}
                  aria-label={`Select ${player.name}`}
                ></button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{player.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Player</span>
          </div>
        </div>
      </div>

      {/* Selected player info */}
      {selectedPlayer && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={selectedPlayer.avatar} alt={selectedPlayer.name} />
              <AvatarFallback>{selectedPlayer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{selectedPlayer.name}</h3>
              <p className="text-sm text-gray-500">
                Position: {selectedPlayer.position.x}%, {selectedPlayer.position.y}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

