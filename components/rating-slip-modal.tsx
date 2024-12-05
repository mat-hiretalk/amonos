import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { createClient } from '@/utils/supabase/client'
import { Plus, Minus } from "lucide-react"

type RatingSlip = Database['public']['Tables']['ratingslip']['Row'] & {
  visit?: {
    player?: {
      name: string
    }
  }
}

interface RatingSlipModalProps {
  ratingSlip: RatingSlip
  isOpen: boolean
  onClose: () => void
}

export function RatingSlipModal({ ratingSlip, isOpen, onClose }: RatingSlipModalProps) {
  const [averageBet, setAverageBet] = useState(ratingSlip.average_bet.toString())
  const [startTime, setStartTime] = useState(ratingSlip.start_time || "")
  const [cashIn, setCashIn] = useState(ratingSlip.cash_in?.toString() || "0")
  const [seatNumber, setSeatNumber] = useState(ratingSlip.seat_number?.toString() || "")
  const supabase = createClient()

  const handleSave = async () => {
    const { error } = await supabase
      .from('ratingslip')
      .update({
        average_bet: Number(averageBet),
        start_time: startTime,
        seat_number: Number(seatNumber),
        cash_in: Number(cashIn)
      })
      .eq('id', ratingSlip.id)

    if (error) {
      console.error('Error updating rating slip:', error)
      return
    }

    onClose()
  }

  const handleCashInChange = (operation: 'add' | 'subtract', amount: number) => {
    const currentValue = Number(cashIn) || 0
    if (operation === 'add') {
      setCashIn((currentValue + amount).toString())
    } else {
      const newValue = Math.max(0, currentValue - amount)
      setCashIn(newValue.toString())
    }
  }

  const handleStartTimeChange = (operation: 'add' | 'subtract', minutes: number) => {
    const [datePart, timePart] = startTime.split('T')
    const [hours, mins] = timePart.split(':').map(Number)
    
    const currentDate = new Date(
      parseInt(datePart.split('-')[0]),
      parseInt(datePart.split('-')[1]) - 1,
      parseInt(datePart.split('-')[2]),
      hours,
      mins
    )

    if (operation === 'add') {
      currentDate.setMinutes(currentDate.getMinutes() + minutes)
    } else {
      currentDate.setMinutes(currentDate.getMinutes() - minutes)
    }

    const newDateTime = `${currentDate.getFullYear()}-${
      String(currentDate.getMonth() + 1).padStart(2, '0')}-${
      String(currentDate.getDate()).padStart(2, '0')}T${
      String(currentDate.getHours()).padStart(2, '0')}:${
      String(currentDate.getMinutes()).padStart(2, '0')}`

    setStartTime(newDateTime)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rating Slip - {ratingSlip.visit?.player?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">Average Bet</label>
            <Input
              type="number"
              value={averageBet}
              onChange={(e) => setAverageBet(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Buy Ins</label>
            <div className="flex items-center space-x-2 mt-1">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => handleCashInChange('subtract', 1)}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Input
                type="number"
                value={cashIn}
                onChange={(e) => setCashIn(e.target.value)}
                className="h-12 text-lg text-center"
              />
              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => handleCashInChange('add', 1)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[1, 5, 20, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  className="h-12 text-lg"
                  onClick={() => handleCashInChange('add', amount)}
                >
                  +{amount}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Start Time</label>
            <div className="flex items-center space-x-2 mt-1">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => handleStartTimeChange('subtract', 15)}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 text-lg text-center"
              />
              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => handleStartTimeChange('add', 15)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Seats</label>
            <Input
              type="number"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <Button onClick={handleSave} className="h-12 text-lg">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 