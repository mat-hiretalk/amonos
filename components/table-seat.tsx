import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { User, UserPlus, DollarSign } from "lucide-react";
import { useState } from "react";
import { RatingSlipModal } from "./rating-slip-modal";
import { useDrag, useDrop } from "react-dnd";

type Player = Database["public"]["Tables"]["player"]["Row"];
type RatingSlip = Database["public"]["Tables"]["ratingslip"]["Row"] & {
  visit?: {
    player?: {
      name: string;
    };
  };
};

interface SeatProps {
  seatNumber: number;
  player: Player | null;
  occupiedBy?: RatingSlip;
  onSeatPlayer: (seatNumber: number) => void;
  onMovePlayer?: (ratingSlipId: string, newSeatNumber: number) => void;
  tableId: string;
}

interface DragItem {
  type: "PLAYER";
  ratingSlipId: string;
  tableId: string;
  seatNumber: number;
}

export function TableSeat({
  seatNumber,
  player,
  occupiedBy,
  onSeatPlayer,
  onMovePlayer,
  tableId,
}: SeatProps) {
  const [isRatingSlipOpen, setIsRatingSlipOpen] = useState(false);

  // Set up drag source for occupied seats
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "PLAYER",
      item: occupiedBy
        ? {
            type: "PLAYER",
            ratingSlipId: occupiedBy.id,
            tableId: tableId,
            seatNumber: seatNumber,
          }
        : null,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: !!occupiedBy,
    }),
    [occupiedBy, tableId, seatNumber]
  );

  // Set up drop target for empty seats
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "PLAYER",
      canDrop: (item: DragItem) => !occupiedBy && item.tableId === tableId,
      drop: (item: DragItem) => {
        if (onMovePlayer) {
          onMovePlayer(item.ratingSlipId, seatNumber);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver() && monitor.canDrop(),
      }),
    }),
    [occupiedBy, onMovePlayer, seatNumber, tableId]
  );

  if (occupiedBy) {
    return (
      <>
        <div
          ref={(node) => drag(drop(node))}
          className={`flex items-center justify-between p-2 bg-secondary rounded-md cursor-move hover:bg-secondary/80 ${
            isDragging ? "opacity-50" : ""
          }`}
          onClick={() => setIsRatingSlipOpen(true)}
        >
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <div className="text-sm">
              <p className="font-medium">{occupiedBy?.visit?.player?.name}</p>
              <p className="text-muted-foreground text-xs">Active Player</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">
              {occupiedBy.average_bet.toFixed(2)}
            </span>
          </div>
        </div>

        {occupiedBy && (
          <RatingSlipModal
            ratingSlip={occupiedBy}
            isOpen={isRatingSlipOpen}
            onClose={() => setIsRatingSlipOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div
      ref={drop}
      onClick={() => onSeatPlayer(seatNumber)}
      className={`${isOver ? "bg-secondary/50" : ""}`}
    >
      <Button variant="outline" size="sm" className="w-full">
        <UserPlus className="h-4 w-4 mr-2" />
        Seat {seatNumber}
      </Button>
    </div>
  );
}
