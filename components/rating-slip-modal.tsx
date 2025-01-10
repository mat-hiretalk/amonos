"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { Plus, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { movePlayer } from "@/app/actions/casino";

type RatingSlip = Database["public"]["Tables"]["ratingslip"]["Row"] & {
  visit?: {
    player?: {
      firstName: string;
      lastName: string;
    };
  };
};

interface RatingSlipModalProps {
  ratingSlip: RatingSlip;
  isOpen: boolean;
  onClose: () => void;
  tables: { id: string; name: string }[];
}

export function RatingSlipModal({
  ratingSlip,
  isOpen,
  onClose,
  tables,
}: RatingSlipModalProps) {
  const [averageBet, setAverageBet] = useState(
    ratingSlip.average_bet.toString()
  );
  const [startTime, setStartTime] = useState(ratingSlip.start_time || "");
  const [cashIn, setCashIn] = useState(ratingSlip.cash_in?.toString() || "0");
  const [seatNumber, setSeatNumber] = useState(
    ratingSlip.seat_number?.toString() || ""
  );
  const [newTableId, setNewTableId] = useState("");
  const [newSeatNumber, setNewSeatNumber] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const supabase = createClient();

  const initialCashIn = Number(ratingSlip.cash_in) || 0;
  const initialStartTime = ratingSlip.start_time || "";
  const initialAverageBet = Number(ratingSlip.average_bet) || 0;

  const getTotalCashInChange = () => {
    const currentCashIn = Number(cashIn) || 0;
    return currentCashIn - initialCashIn;
  };

  const getTotalTimeChange = () => {
    if (!startTime || !initialStartTime) return 0;
    const current = new Date(startTime);
    const initial = new Date(initialStartTime);
    return Math.round((current.getTime() - initial.getTime()) / (1000 * 60)); // Convert to minutes
  };

  const getTotalAverageBetChange = () => {
    const currentAverageBet = Number(averageBet) || 0;
    return currentAverageBet - initialAverageBet;
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("ratingslip")
      .update({
        average_bet: Number(averageBet),
        start_time: startTime,
        seat_number: Number(seatNumber),
        cash_in: Number(cashIn),
      })
      .eq("id", ratingSlip.id);

    if (error) {
      console.error("Error updating rating slip:", error);
      return;
    }

    onClose();
  };

  const handleCashInChange = (
    operation: "add" | "subtract",
    amount: number
  ) => {
    const currentValue = Number(cashIn) || 0;
    let newValue;
    if (operation === "add") {
      newValue = currentValue + amount;
    } else {
      newValue = Math.max(0, currentValue - amount);
    }
    setCashIn(newValue.toString());
  };

  const handleStartTimeChange = (
    operation: "add" | "subtract",
    minutes: number
  ) => {
    const [datePart, timePart] = startTime.split("T");
    const [hours, mins] = timePart.split(":").map(Number);

    const currentDate = new Date(
      parseInt(datePart.split("-")[0]),
      parseInt(datePart.split("-")[1]) - 1,
      parseInt(datePart.split("-")[2]),
      hours,
      mins
    );

    if (operation === "add") {
      currentDate.setMinutes(currentDate.getMinutes() + minutes);
    } else {
      currentDate.setMinutes(currentDate.getMinutes() - minutes);
    }

    const newDateTime = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
      2,
      "0"
    )}T${String(currentDate.getHours()).padStart(2, "0")}:${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}`;

    setStartTime(newDateTime);
  };

  const handleMovePlayer = async () => {
    if (!newTableId || !newSeatNumber) return;

    setIsMoving(true);
    try {
      await movePlayer(ratingSlip.id, newTableId, parseInt(newSeatNumber));
      onClose();
    } catch (error) {
      console.error("Error moving player:", error);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Rating Slip -{" "}
            {ratingSlip.visit?.player
              ? `${ratingSlip.visit.player.firstName} ${ratingSlip.visit.player.lastName}`
              : "Unknown Player"}
          </DialogTitle>
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
                onClick={() =>
                  setAverageBet((prev) =>
                    Math.max(0, Number(prev) - 1).toString()
                  )
                }
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
                onClick={() =>
                  setAverageBet((prev) => (Number(prev) + 1).toString())
                }
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="text-sm mt-1">
              Total Change: {getTotalAverageBetChange() > 0 ? "+" : ""}
              {getTotalAverageBetChange()}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[5, 25, 100, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  className="h-12 text-lg"
                  onClick={() =>
                    setAverageBet((prev) => (Number(prev) + amount).toString())
                  }
                >
                  +{amount}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Cash In</label>
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
                onClick={() => handleCashInChange("subtract", 1)}
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
                onClick={() => handleCashInChange("add", 1)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="text-sm mt-1">
              Total Change: {getTotalCashInChange() > 0 ? "+" : ""}
              {getTotalCashInChange()}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[5, 25, 100, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  className="h-12 text-lg"
                  onClick={() => handleCashInChange("add", amount)}
                >
                  +{amount}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Start Time</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStartTime(initialStartTime)}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => handleStartTimeChange("subtract", 5)}
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
                onClick={() => handleStartTimeChange("add", 5)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="text-sm mt-1">
              Total Change: {getTotalTimeChange() > 0 ? "+" : ""}
              {getTotalTimeChange()} minutes
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[5, 15, 30, 60, 120].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant="outline"
                  className="h-12 text-lg"
                  onClick={() => handleStartTimeChange("add", minutes)}
                >
                  +{minutes}m
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Move Player</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Select onValueChange={setNewTableId} value={newTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="New Seat Number"
                value={newSeatNumber}
                onChange={(e) => setNewSeatNumber(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
          <Button
            onClick={handleMovePlayer}
            disabled={isMoving || !newTableId || !newSeatNumber}
          >
            {isMoving ? "Moving..." : "Move Player"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
