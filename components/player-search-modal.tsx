'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Player {
  id: string
  name: string
  cardNumber: string
  age: number
  language: string
  typicalGames: string[]
  points: number
}

const mockPlayers: Player[] = [
  { id: '1', name: 'John Doe', cardNumber: '123456', age: 35, language: 'English', typicalGames: ['Blackjack', 'Poker'], points: 1000 },
  { id: '2', name: 'Jane Smith', cardNumber: '234567', age: 42, language: 'Spanish', typicalGames: ['Roulette', 'Slots'], points: 1500 },
  { id: '3', name: 'Bob Johnson', cardNumber: '345678', age: 28, language: 'English', typicalGames: ['Poker', 'Craps'], points: 750 },
  { id: '4', name: 'Alice Brown', cardNumber: '456789', age: 55, language: 'French', typicalGames: ['Baccarat', 'Blackjack'], points: 2000 },
]

const languages = ['English', 'Spanish', 'French', 'Mandarin', 'Japanese']
const games = ['Blackjack', 'Poker', 'Roulette', 'Slots', 'Craps', 'Baccarat']

export function PlayerSearchModal() {
  const [searchTerm, setSearchTerm] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [language, setLanguage] = useState('')
  const [game, setGame] = useState('')
  const [searchResults, setSearchResults] = useState<Player[]>([])

  const handleSearch = () => {
    // Mock API call - replace with actual API call in production
    const results = mockPlayers.filter(player => 
      (player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       player.cardNumber.includes(searchTerm)) &&
      (!minAge || player.age >= parseInt(minAge)) &&
      (!maxAge || player.age <= parseInt(maxAge)) &&
      (!language || player.language === language) &&
      (!game || player.typicalGames.includes(game))
    )
    setSearchResults(results)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Advanced Player Search</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Advanced Player Search</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name/Card
            </Label>
            <Input
              id="name"
              placeholder="Search by name or card number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">
              Age Range
            </Label>
            <Input
              id="minAge"
              placeholder="Min"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="col-span-1"
            />
            <Input
              id="maxAge"
              placeholder="Max"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              className="col-span-1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="game" className="text-right">
              Typical Game
            </Label>
            <Select value={game} onValueChange={setGame}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {games.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        {searchResults.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Card Number</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Typical Games</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.cardNumber}</TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>{player.language}</TableCell>
                  <TableCell>{player.typicalGames.join(', ')}</TableCell>
                  <TableCell>{player.points}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Select</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}

