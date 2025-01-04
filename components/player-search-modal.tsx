"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/database.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { startRating } from "@/app/actions/start-rating";

// Types
type Player = Database["public"]["Tables"]["player"]["Row"];
type TableSeat = {
  table_id: string;
  seat_number: number;
  table_name: string;
};

interface PlayerSearchModalProps {
  selectedCasino: string;
  onPlayerSelected: (
    player: Player,
    action: "visit" | "seat",
    seatInfo?: { table_id: string; seat_number: number }
  ) => void;
  preSelectedSeat?: TableSeat;
}

// API Service
const playerService = {
  supabase: createClient(),

  async searchPlayers(searchTerm: string): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from("player")
      .select("*")
      .or(
        `name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      )
      .limit(10);

    if (error) throw new Error(`Error searching players: ${error.message}`);
    return data || [];
  },

  async createVisit(playerId: string, casinoId: string) {
    const { data, error } = await this.supabase
      .from("visit")
      .insert([
        {
          player_id: playerId,
          casino_id: casinoId,
          check_in_date: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw new Error(`Error creating visit: ${error.message}`);
    return data[0];
  },

  async fetchAvailableSeats(): Promise<TableSeat[]> {
    const { data: openSeats, error } = await this.supabase
      .from("open_seats_by_table")
      .select("gaming_table_id, table_name, open_seat_numbers, casino_id");

    if (error)
      throw new Error(`Error fetching available seats: ${error.message}`);

    return openSeats
      .filter(
        (table) =>
          table.gaming_table_id && table.table_name && table.open_seat_numbers
      )
      .flatMap((table) => {
        const seatNumbers = table
          .open_seat_numbers!.split(",")
          .map((num) => parseInt(num.trim()));

        return seatNumbers.map((seatNumber) => ({
          table_id: table.gaming_table_id!,
          seat_number: seatNumber,
          table_name: table.table_name!,
        }));
      });
  },
};

// Sub-components
const PlayerCard = ({
  player,
  isSelected,
  onClick,
}: {
  player: Player;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`p-3 border rounded-lg cursor-pointer ${isSelected ? "bg-gray-200" : ""}`}
    onClick={onClick}
  >
    <div className="font-medium">{player.name}</div>
    <div className="text-sm text-muted-foreground">
      {player.phone_number} • {player.email}
    </div>
  </div>
);

const PlayerActions = ({
  player,
  preSelectedSeat,
  onVisit,
  onSeat,
  onDeselect,
}: {
  player: Player;
  preSelectedSeat?: TableSeat;
  onVisit: () => void;
  onSeat: () => void;
  onDeselect: () => void;
}) => (
  <div className="flex gap-2 mt-4">
    <Button variant="outline" onClick={onVisit}>
      Make Visitor
    </Button>
    {preSelectedSeat ? (
      <Button onClick={onSeat}>
        Seat at {preSelectedSeat.table_name} - Seat{" "}
        {preSelectedSeat.seat_number}
      </Button>
    ) : (
      <Button onClick={onSeat}>Select Seat</Button>
    )}
    <Button onClick={onDeselect}>Deselect</Button>
  </div>
);

// Main component
export function PlayerSearchModal({
  selectedCasino,
  onPlayerSelected,
  preSelectedSeat,
}: PlayerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showSeatSelector, setShowSeatSelector] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<TableSeat[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await playerService.searchPlayers(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while searching"
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (player: Player, action: "visit" | "seat") => {
    setError(null);

    try {
      if (action === "seat") {
        setSelectedPlayer(player);
        const seats = await playerService.fetchAvailableSeats();
        setAvailableSeats(seats);
        setShowSeatSelector(true);
        return;
      }

      await playerService.createVisit(player.id, selectedCasino);
      onPlayerSelected(player, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleSeatSelection = async (seat: TableSeat) => {
    if (!selectedPlayer) return;
    setError(null);

    try {
      const visit = await playerService.createVisit(
        selectedPlayer.id,
        selectedCasino
      );
      await startRating(visit.id, seat.table_id, seat.seat_number, 0, {});

      setShowSeatSelector(false);
      onPlayerSelected(selectedPlayer, "seat", {
        table_id: seat.table_id,
        seat_number: seat.seat_number,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while seating player"
      );
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2">
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-2">
        {searchResults.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isSelected={selectedPlayer?.id === player.id}
            onClick={() => setSelectedPlayer(player)}
          />
        ))}
      </div>

      {selectedPlayer && (
        <PlayerActions
          player={selectedPlayer}
          preSelectedSeat={preSelectedSeat}
          onVisit={() => handleAction(selectedPlayer, "visit")}
          onSeat={() =>
            preSelectedSeat
              ? handleSeatSelection(preSelectedSeat)
              : handleAction(selectedPlayer, "seat")
          }
          onDeselect={() => setSelectedPlayer(null)}
        />
      )}

      <Dialog open={showSeatSelector} onOpenChange={setShowSeatSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Available Seat</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {availableSeats.map((seat) => (
              <Button
                key={`${seat.table_id}-${seat.seat_number}`}
                variant="outline"
                onClick={() => handleSeatSelection(seat)}
                className="p-4"
              >
                {seat.table_name} - Seat {seat.seat_number}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
