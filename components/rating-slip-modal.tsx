import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { createClient } from '@/utils/supabase/client'
import { Plus, Minus } from "lucide-react"
import { stopRating } from "@/app/actions/stop-rating"

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
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const initialCashIn = Number(ratingSlip.cash_in) || 0
  const initialStartTime = ratingSlip.start_time || ""
  const initialAverageBet = Number(ratingSlip.average_bet) || 0

  const getTotalCashInChange = () => {
    const currentCashIn = Number(cashIn) || 0
    return currentCashIn - initialCashIn
  }

  const getTotalTimeChange = () => {
    if (!startTime || !initialStartTime) return 0
    const current = new Date(startTime)
    const initial = new Date(initialStartTime)
    return Math.round((current.getTime() - initial.getTime()) / (1000 * 60)) // Convert to minutes
  }

  const getTotalAverageBetChange = () => {
    const currentAverageBet = Number(averageBet) || 0
    return currentAverageBet - initialAverageBet
  }

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

  const handleStopRating = async () => {
    try {
      setIsLoading(true)
      await stopRating(ratingSlip.id)
      onClose()
    } catch (error) {
      console.error('Error stopping rating:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCashInChange = (operation: 'add' | 'subtract', amount: number) => {
    const currentValue = Number(cashIn) || 0
    let newValue
    if (operation === 'add') {
      newValue = currentValue + amount
    } else {
      newValue = Math.max(0, currentValue - amount)
    }
    setCashIn(newValue.toString())
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
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Average Bet</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAverageBet(initialAverageBet.toString())}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => setAverageBet((prev) => Math.max(0, Number(prev) - 1).toString())}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Input
                type="number"
                value={averageBet}
                onChange={(e) => setAverageBet(e.target.value)}
                className="h-12 text-lg text-center"
              />
              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => setAverageBet((prev) => (Number(prev) + 1).toString())}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="text-sm mt-1">
              Total Change: {getTotalAverageBetChange() > 0 ? '+' : ''}{getTotalAverageBetChange()}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[5, 25, 100, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  className="h-12 text-lg"
                  onClick={() => setAverageBet((prev) => (Number(prev) + amount).toString())}
                >
                  +{amount}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Buy Ins</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCashIn(initialCashIn.toString())}
              >
                Reset
              </Button>
            </div>
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
            <div className="text-sm mt-1">
              Total Change: {getTotalCashInChange() > 0 ? '+' : ''}{getTotalCashInChange()}
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
            <div className="text-sm mt-1">
              Total Change: {getTotalTimeChange() > 0 ? '+' : ''}{getTotalTimeChange()} minutes
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
          <div className="flex justify-between gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button 
              onClick={handleStopRating} 
              variant="destructive"
              disabled={isLoading}
              className="flex-1"
            >
              Stop Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 