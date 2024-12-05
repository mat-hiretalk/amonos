'use client'

import { useState } from "react"
import { Bell, History, Menu, Search, User, UserCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Player {
  id: string
  name: string
  type: string
  table: string
  seat: number
  avgBet: number
  cashIn: number
  startTime: string
  duration: string
  status: "active" | "inactive" | "warning"
}

export default function PitStation() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const players: Player[] = [
    {
      id: "1",
      name: "Johnson, A",
      type: "A",
      table: "TS-1",
      seat: 1,
      avgBet: 10,
      cashIn: 200,
      startTime: "15:04",
      duration: "0:33",
      status: "active",
    },
    {
      id: "2",
      name: "Crafton, R",
      type: "M(M)",
      table: "LLBJ-2",
      seat: 2,
      avgBet: 50,
      cashIn: 500,
      startTime: "15:25",
      duration: "0:12",
      status: "active",
    },
    {
      id: "3",
      name: "Kitchen, G",
      type: "F(M)",
      table: "LLBJ-2",
      seat: 4,
      avgBet: 20,
      cashIn: 250,
      startTime: "15:06",
      duration: "0:31",
      status: "warning",
    },
    {
      id: "4",
      name: "Walker, R",
      type: "N(M)",
      table: "LLBJ-3",
      seat: 4,
      avgBet: 100,
      cashIn: 1000,
      startTime: "15:27",
      duration: "0:10",
      status: "active",
    },
  ]

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Pit Station Menu</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <Button variant="ghost" className="justify-start">
                      Main Menu
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      All Tables
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      Find Player
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      Issue Reward
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-red-500"
                    >
                      Log Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">Pit Station</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <UserCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 p-4">
            <Input
              placeholder="Search players..."
              className="max-w-sm"
              type="search"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Table View */}
        <div className="flex-1 p-4 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Seat</TableHead>
                <TableHead>Avg Bet</TableHead>
                <TableHead>Cash In</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow
                  key={player.id}
                  className={
                    player.status === "warning"
                      ? "bg-red-50 dark:bg-red-950"
                      : undefined
                  }
                  onClick={() => setSelectedPlayer(player)}
                >
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.table}</TableCell>
                  <TableCell>{player.seat}</TableCell>
                  <TableCell>{player.avgBet}</TableCell>
                  <TableCell>{player.cashIn}</TableCell>
                  <TableCell>{player.startTime}</TableCell>
                  <TableCell>{player.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Right Sidebar - Player Details */}
      <Sheet open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Player Details</SheetTitle>
          </SheetHeader>
          {selectedPlayer && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rating Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="rating">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="rating">Rating</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                      <TabsTrigger value="traits">Traits</TabsTrigger>
                      <TabsTrigger value="denoms">Denoms</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rating" className="space-y-4">
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Table</label>
                            <div className="mt-1">{selectedPlayer.table}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Seat</label>
                            <div className="mt-1">{selectedPlayer.seat}</div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Average Bet</label>
                          <div className="mt-1">${selectedPlayer.avgBet}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Cash In</label>
                          <div className="mt-1">${selectedPlayer.cashIn}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Start Time</label>
                            <div className="mt-1">{selectedPlayer.startTime}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Duration</label>
                            <div className="mt-1">{selectedPlayer.duration}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Close Rating</Button>
                        <Button>Move</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

