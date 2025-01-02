"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { searchPlayers } from "@/app/actions/player";

type Player = Database["public"]["Tables"]["player"]["Row"] & {
  ratingslipId?: string | null;
};

interface PlayerSearchModalProps {
  selectedCasino: string;
  mode: "seat" | "visit";
  onPlayerSelected: (player: Player) => void;
}

export function PlayerSearchModal({
  selectedCasino,
  mode,
  onPlayerSelected,
}: PlayerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const players = await searchPlayers(searchTerm);
      setSearchResults(players);
    } catch (error) {
      console.error("Error searching players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-1/4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full border border-red-400"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>
      </div>

      <div className="space-y-2">
        {searchResults.map((player) => (
          <div
            key={player.id}
            className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
            onClick={() => onPlayerSelected(player)}
          >
            <div className="font-medium">
              {player.firstName} {player.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {player.phone_number} • {player.email}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
