import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RatingSlipModal } from "./rating-slip-modal";
import { Database } from "@/database.types";
import { User, DollarSign } from "lucide-react";

type RatingSlip = Database["public"]["Tables"]["ratingslip"]["Row"] & {
  visit?: {
    player?: {
      firstName: string;
      lastName: string;
    };
  };
};

type Player = Database["public"]["Tables"]["player"]["Row"];

interface TableSeatProps {
  seatNumber: number;
  player: Player | null;
  occupiedBy: RatingSlip | undefined;
  onSeatPlayer: (seatNumber: number) => void;
  tables: { id: string; name: string }[];
}

export function TableSeat({
  seatNumber,
  player,
  occupiedBy,
  onSeatPlayer,
  tables,
}: TableSeatProps) {
  const [isRatingSlipOpen, setIsRatingSlipOpen] = useState(false);

  useEffect(() => {
    console.log(
      `TableSeat ${seatNumber} rendered with occupiedBy:`,
      JSON.stringify(occupiedBy, null, 2)
    );
  }, [seatNumber, occupiedBy]);

  const handleClick = () => {
    if (occupiedBy) {
      setIsRatingSlipOpen(true);
    } else {
      onSeatPlayer(seatNumber);
    }
  };

  return (
    <div>
      <Button
        variant={occupiedBy ? "default" : "outline"}
        className="w-full h-24 relative"
        onClick={handleClick}
      >
        <div className="absolute top-1 left-2 text-xs opacity-50">
          Seat {seatNumber}
        </div>
        <div className="flex flex-col items-center justify-center">
          {occupiedBy ? (
            <>
              <span className="font-bold">
                {occupiedBy.visit?.player?.firstName || "Unknown"}
              </span>
              <span className="text-xs opacity-70">
                ${occupiedBy.average_bet}
              </span>
              <span className="text-xs opacity-70">
                Cash In: ${occupiedBy.cash_in || 0}
              </span>
            </>
          ) : (
            <span className="opacity-50">Empty</span>
          )}
        </div>
      </Button>

      {occupiedBy && (
        <RatingSlipModal
          ratingSlip={occupiedBy}
          isOpen={isRatingSlipOpen}
          onClose={() => setIsRatingSlipOpen(false)}
          tables={tables}
        />
      )}
    </div>
  );
}
