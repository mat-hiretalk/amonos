"use client"

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BlackjackTable } from "./blackjack-table"

interface Player {
  id: string
  name: string
  avatar: string
  tableId: string
  seatNumber: number
}

interface Table {
  id: string
  number: number
}

const tables: Table[] = [
  { id: "t1", number: 1 },
  { id: "t2", number: 2 },
  { id: "t3", number: 3 },
  { id: "t4", number: 4 },
  { id: "t5", number: 5 },
  { id: "t6", number: 6 },
]

const players: Player[] = [
  { id: "p1", name: "John Doe", avatar: "/placeholder.svg?height=32&width=32", tableId: "t1", seatNumber: 3 },
  { id: "p2", name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32", tableId: "t1", seatNumber: 5 },
  { id: "p3", name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32", tableId: "t2", seatNumber: 1 },
  { id: "p4", name: "Emily Brown", avatar: "/placeholder.svg?height=32&width=32", tableId: "t3", seatNumber: 4 },
]

export function CasinoFloorView() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isLandscape, setIsLandscape] = useState(true)

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  if (!isLandscape) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Please rotate your device</p>
          <p>This view is optimized for landscape mode</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen overflow-auto bg-gray-100 p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-8">Casino Floor View</h2>
      <div className="flex flex-wrap justify-center">
        {tables.map((table) => (
          <BlackjackTable
            key={table.id}
            id={table.id}
            number={table.number}
            players={players.filter(p => p.tableId === table.id)}
            onSelectPlayer={setSelectedPlayer}
          />
        ))}
      </div>
      {selectedPlayer && (
        <Card className="mt-4 md:mt-8 max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Selected Player</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={selectedPlayer.avatar} alt={selectedPlayer.name} />
                <AvatarFallback>{selectedPlayer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedPlayer.name}</h3>
                <p className="text-sm text-gray-500">
                  Table: {tables.find(t => t.id === selectedPlayer.tableId)?.number}, 
                  Position: {selectedPlayer.seatNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="mt-4 md:mt-8 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-500"></div>
          <span className="text-sm">Occupied Position</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-transparent border-2 border-yellow-300"></div>
          <span className="text-sm">Empty Position</span>
        </div>
      </div>
    </div>
  )
}

