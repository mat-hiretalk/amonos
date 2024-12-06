'use client'

import { useEffect, useState } from "react"
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
import { PlayerSearchModal } from "@/components/player-search-modal"
import { CasinoSelector } from "@/components/casino-selector"
import { createClient } from '@/utils/supabase/client'
import { CasinoFloorView } from "./casino-floor-view"
import { AddPlayerModal } from "@/components/add-player-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type TableSeat } from "./casino-floor-view"

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

interface Visit {
  id: string
  player_id: string | null
  check_in_date: string
  check_out_date: string | null
  player: {
    name: string | null
  }
}

export default function PitStation() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedCasino, setSelectedCasino] = useState<string>('')
  const [activeVisits, setActiveVisits] = useState<Visit[]>([])
  const [activeTab, setActiveTab] = useState('floor')
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<TableSeat | undefined>(undefined)
  const supabase = createClient()

  // Fetch active visits when casino changes
  useEffect(() => {
    if (!selectedCasino) return

    const fetchActiveVisits = async () => {
      const { data, error } = await supabase
        .from('visit')
        .select(`
          id,
          player_id,
          check_in_date,
          check_out_date,
          player:player!player_id(name)
        `)
        .eq('casino_id', selectedCasino)
        .is('check_out_date', null)
        .order('check_in_date', { ascending: false })
      console.log(data)
      if (error) {
        console.error('Error fetching visits:', error)
        return
      }

      const formattedData = data.map(visit => ({
        ...visit,
        player: Array.isArray(visit.player) ? visit.player[0] : visit.player
      }))

      setActiveVisits(formattedData)
    }

    fetchActiveVisits()

    // Subscribe to changes in visits
    const channel = supabase
      .channel('visits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visits',
          filter: `casino_id=eq.${selectedCasino}`,
        },
        () => {
          fetchActiveVisits()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedCasino])

  const handleCasinoChange = (casinoId: string) => {
    setSelectedCasino(casinoId)
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background">
      <div className="flex-1 flex flex-col">
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
                    <Button variant="ghost" className="justify-start text-red-500">
                      Log Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">Pit Station</h1>
            </div>
            <div className="flex items-center gap-4">
              <CasinoSelector onCasinoChange={handleCasinoChange} />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <UserCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-4">
            <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search Players
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Search Players</DialogTitle>
                </DialogHeader>
                <PlayerSearchModal 
                  selectedCasino={selectedCasino} 
                  preSelectedSeat={selectedSeat}
                  onPlayerSelected={(player, action, seatInfo) => {
                    if (action === "visit") {
                      // Handle visit action if needed
                      console.log('Player visit:', player)
                    } else if (action === "seat" && seatInfo) {
                      // Handle seating the player
                      setActiveTab('floor')
                      setSelectedSeat(undefined)
                      // You might want to add additional logic here to update the floor view
                    }
                    setSearchDialogOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>
            {selectedCasino && <AddPlayerModal selectedCasino={selectedCasino} />}
          </div>
        </header>

        <div className="flex-1 p-4 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="floor">Casino Floor</TabsTrigger>
              <TabsTrigger value="visitors">Visitor View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visitors">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Check In Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeVisits.map((visit) => {
                    const duration = new Date().getTime() - new Date(visit.check_in_date).getTime()
                    const hours = Math.floor(duration / (1000 * 60 * 60))
                    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
                    
                    return (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.player.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(visit.check_in_date).toLocaleTimeString()}</TableCell>
                        <TableCell>{`${hours}:${minutes.toString().padStart(2, '0')}`}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="floor">
              <CasinoFloorView 
                onSeatSelect={(seat) => {
                  setSelectedSeat(seat)
                  setSearchDialogOpen(true)
                }}
              />
            </TabsContent>
          </Tabs>
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

