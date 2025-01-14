import { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Users, UserX } from "lucide-react";
import { TableSeat } from "./table-seat";
import { PlayerSearchModal } from "./player-search-modal";
import { Database } from "@/database.types";
import { usePlayerStore } from "@/store/player-store";
import { useCasinoStore } from "@/store/casino-store";
import { useTableStore } from "@/store/table-store";

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
  selectedCasino: string | null;
  tables: { id: string; name: string }[];
}

export default function CasinoTable({
  table,
  selectedCasino,
  tables,
}: Omit<CasinoTableProps, "onUpdateTable">) {
  const { setMode } = useCasinoStore();
  const { setSelectedTable, setSelectedSeat, selectedSeat } = useTableStore();

  useEffect(() => {
    if (table.id) {
      setSelectedTable(table.id);
    }
    return () => {
      setSelectedTable(null);
    };
  }, [table.id, setSelectedTable]);

  const handleSeatPlayer = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
    setMode("seat");
  };

  // Memoize the rating slips mapping separately
  const seatRatingSlips = useMemo(() => {
    const ratingSlipMap = new Map<number, RatingSlip>();

    table.ratingSlips.forEach((slip) => {
      if (slip.seat_number) {
        ratingSlipMap.set(slip.seat_number, slip);
      }
    });

    return ratingSlipMap;
  }, [table.ratingSlips]);

  const tableSeats = useMemo(() => {
    return table.seats.map((player, index) => {
      const seatNumber = index + 1;
      const occupiedBy = seatRatingSlips.get(seatNumber);
      

      console.log(`Table ${table.id}, Seat ${seatNumber}:`, {
        player,
        occupiedBy,
        hasRatingSlip: seatRatingSlips.has(seatNumber),
        totalRatingSlips: table.ratingSlips.length,
      });

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
  }, [table.id, table.seats, seatRatingSlips, tables, handleSeatPlayer]);

  return (
    <Card
      className={
        table.status === "active" ? "border-green-500" : "border-red-500"
      }
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{table.name}</CardTitle>
        {table.hasVIP && <Star className="fill-yellow-400 text-yellow-400" />}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">
              {table.seats.filter((seat) => seat !== null).length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <UserX className="h-4 w-4 text-muted-foreground" />
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
        onOpenChange={(open) => !open && setSelectedSeat(null)}
      >
        <DialogContent className="sm:max-w-[768px]">
          <DialogHeader>
            <DialogTitle>Select Player for Seat {selectedSeat}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <PlayerSearchModal />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
