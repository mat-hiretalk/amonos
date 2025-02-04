import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Star, Users, Clock } from "lucide-react";
import { TableSeat } from "./table-seat";
import { PlayerSearchModal } from "./player-search-modal";
import { Database } from "@/database.types";
import { GameSettings } from "@/utils/points";

type RatingSlip = Database["public"]["Tables"]["ratingslip"]["Row"] & {
  visit?: {
    player?: {
      points: number;
      name: string;
      id: string;
    };
  };
};
type Player = Database["public"]["Tables"]["player"]["Row"];

export interface TableData {
  id: string;
  name: string;
  seats: (Player | null)[];
  averageBet: number;
  status: "active" | "inactive";
  hasVIP: boolean;
  ratingSlips: RatingSlip[];
}

interface CasinoTableProps {
  table: TableData;
  gameSettings: GameSettings;
  onUpdateTable: (
    updatedTable: TableData,
    playerId: string,
    seatNumber: number
  ) => void;
  selectedCasino: string | null;
  onMovePlayer: (
    ratingSlipId: string,
    playerId: string,
    newTableId: string,
    newSeatNumber: number
  ) => void;
}

export function CasinoTable({
  table,
  onUpdateTable,
  selectedCasino,
  onMovePlayer,
  gameSettings,
}: CasinoTableProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const handleSeatPlayer = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
  };

  const handlePlayerSelected = (player: Player) => {
    if (selectedSeat === null) return;

    const updatedSeats = [...table.seats];
    updatedSeats[selectedSeat - 1] = player;

    const updatedTable: TableData = {
      ...table,
      seats: updatedSeats,
      status: "active",
    };

    onUpdateTable(updatedTable, player.id, selectedSeat);
    setSelectedSeat(null);
  };

  const handleMovePlayer = (
    ratingSlipId: string,
    newSeatNumber: number,
    playerId: string
  ) => {
    onMovePlayer(ratingSlipId, playerId, table.id, newSeatNumber);
  };

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60)); // minutes
    return diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <Card
      className={
        table.status === "active" ? "border-green-500" : "border-red-500"
      }
    >
      <CardHeader className="flex flex-row items-center justify-between  pb-2">
        <CardTitle className="text-lg font-medium">{table.name}</CardTitle>
        {table.hasVIP && <Star className=" fill-yellow-400 text-yellow-400" />}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">
              {table.ratingSlips.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">
              {table.averageBet.toFixed(2)}
            </span>
          </div>
          <Badge variant={table.status === "active" ? "default" : "secondary"}>
            {table.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {table.seats.map((player, index) => {
            const seatNumber = index + 1;

            return (
              <TableSeat
                key={index}
                seatNumber={seatNumber}
                player={player}
                occupiedBy={table.ratingSlips.find((slip) => {
                  return slip.seat_number === seatNumber;
                })}
                onSeatPlayer={handleSeatPlayer}
                onMovePlayer={handleMovePlayer}
                tableId={table.id}
                gameSettings={gameSettings}
              />
            );
          })}
        </div>
      </CardContent>

      <Dialog
        open={selectedSeat !== null}
        onOpenChange={() => setSelectedSeat(null)}
      >
        <DialogContent className="sm:max-w-[768px]">
          <DialogHeader>
            <DialogTitle>Select Player for Seat {selectedSeat}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <PlayerSearchModal
              selectedCasino={selectedCasino}
              preSelectedSeat={
                selectedSeat
                  ? {
                      table_id: table.id,
                      seat_number: selectedSeat,
                      table_name: table.name,
                    }
                  : undefined
              }
              onPlayerSelected={handlePlayerSelected}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
