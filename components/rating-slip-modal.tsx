"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/database.types";
import { useRatingSlips } from "@/hooks/useRatingSlips";

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
  const { updateRatingSlip, isUpdating } = useRatingSlips();

  const handleMove = async (newTableId: string) => {
    try {
      await updateRatingSlip({
        ratingSlipId: ratingSlip.id,
        newTableId,
        newSeatNumber: ratingSlip.seat_number || 1,
      });
      onClose();
    } catch (error) {
      console.error("Error moving player:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Rating Slip -{" "}
            {ratingSlip.visit?.player?.firstName || "Unknown Player"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Average Bet</Label>
              <div className="mt-1">${ratingSlip.average_bet}</div>
            </div>
            <div>
              <Label>Cash In</Label>
              <div className="mt-1">${ratingSlip.cash_in || 0}</div>
            </div>
          </div>

          <div>
            <Label>Move to Table</Label>
            <Select onValueChange={handleMove}>
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
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button disabled={isUpdating}>
            {isUpdating ? "Moving..." : "Move"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
