import { useState, useMemo } from "react";
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

type RatingSlip = Database["public"]["Tables"]["ratingslip"]["Row"] & {
  visit?: {
    player?: {
      firstName: string;
      lastName: string;
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
  onUpdateTable: (
    updatedTable: TableData,
    playerId: string,
    seatNumber: number
  ) => void;
  selectedCasino: string | null;
  tables: { id: string; name: string }[];
}

export default function CasinoTable({
  table,
  onUpdateTable,
  selectedCasino,
  tables,
}: CasinoTableProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const handleSeatPlayer = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
  };

  const handlePlayerSelected = (player: Player) => {
    if (selectedSeat === null) return;

    const updatedSeats = [...table.seats];
    updatedSeats[selectedSeat - 1] = player;
    console.log("player from casino table", player);
    const updatedTable: TableData = {
      ...table,
      seats: updatedSeats,
      status: "active",
    };

    onUpdateTable(updatedTable, player.id, selectedSeat);
    setSelectedSeat(null);
  };

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60)); // minutes
    return diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const tableSeats = useMemo(() => {
    return table.seats.map((player, index) => {
      const seatNumber = index + 1;
      const occupiedBy = table.ratingSlips.find(
        (slip) => slip.seat_number === seatNumber
      );

      return (
        <TableSeat
          key={`${table.id}-${seatNumber}`}
          seatNumber={seatNumber}
          player={player}
          occupiedBy={occupiedBy}
          onSeatPlayer={handleSeatPlayer}
          tables={tables}
        />
      );
    });
  }, [table.id, table.seats, table.ratingSlips, tables, handleSeatPlayer]);

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
            <span className="text-xl font-bold">{table.averageBet}</span>
          </div>
          <Badge variant={table.status === "active" ? "default" : "secondary"}>
            {table.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">{tableSeats}</div>
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
              selectedCasino={selectedCasino ?? ""}
              mode="seat"
              onPlayerSelected={handlePlayerSelected}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
