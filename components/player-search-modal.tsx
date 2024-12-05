'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from '@/utils/supabase/client'
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
  name: string | null
  email: string | null
  phone_number: string | null
  company_id: string | null
  dob: string | null
}

export function PlayerSearchModal() {
  const [searchTerm, setSearchTerm] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [searchResults, setSearchResults] = useState<Player[]>([])

  const handleSearch = async () => {
    const supabase = createClient()
    
    // Calculate date ranges based on age inputs
    const now = new Date()
    const maxDate = minAge ? 
      new Date(now.getFullYear() - parseInt(minAge), now.getMonth(), now.getDate()) : null
    const minDate = maxAge ? 
      new Date(now.getFullYear() - parseInt(maxAge), now.getMonth(), now.getDate()) : null

    let query = supabase
      .from('player')
      .select('*')
      
    // Add name search if provided
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }
    
    // Add age range filters if provided
    if (maxDate) {
      query = query.lte('dob', maxDate.toISOString().split('T')[0])
    }
    if (minDate) {
      query = query.gte('dob', minDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching players:', error)
      return
    }

    setSearchResults(data || [])
  }

  const calculateAge = (dob: string | null) => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
              Name
            </Label>
            <Input
              id="name"
              placeholder="Search by name"
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
                <TableHead>Age</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.name || 'N/A'}</TableCell>
                  <TableCell>{calculateAge(player.dob)}</TableCell>
                  <TableCell>{player.email || 'N/A'}</TableCell>
                  <TableCell>{player.phone_number || 'N/A'}</TableCell>
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

