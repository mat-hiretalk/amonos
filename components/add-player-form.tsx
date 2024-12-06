'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function AddPlayerForm({ selectedCasino }: { selectedCasino: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const dob = formData.get('dob') as string

    try {
      // Insert player
      const { data: playerData, error: playerError } = await supabase
        .from('player')
        .insert({
          name,
          email,
          phone_number: phoneNumber,
          dob: dob || null,
        })
        .select()
        .single()

      if (playerError) throw playerError

      // Link player to casino
      if (selectedCasino && playerData) {
        const { error: casinoError } = await supabase
          .from('playercasino')
          .insert({
            player_id: playerData.id,
            casino_id: selectedCasino,
          })

        if (casinoError) throw casinoError
      }

      toast({
        title: "Success",
        description: "Player added successfully",
      })

     
    } catch (error) {
      console.error('Error adding player:', error)
      toast({
        title: "Error",
        description: "Failed to add player. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Enter player name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter email address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          name="dob"
          type="date"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Player"}
      </Button>
    </form>
  )
} 