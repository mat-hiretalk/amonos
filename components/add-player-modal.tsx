'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AddPlayerForm } from "./add-player-form"
import { UserPlus } from "lucide-react"

interface AddPlayerModalProps {
  selectedCasino: string
  trigger?: React.ReactNode
}

export function AddPlayerModal({ selectedCasino, trigger }: AddPlayerModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>
        <AddPlayerForm selectedCasino={selectedCasino} />
      </DialogContent>
    </Dialog>
  )
} 