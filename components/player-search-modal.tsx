"use client";

import { useAtom } from "jotai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPlayers } from "@/app/actions/player";
import {
  searchTermAtom,
  searchResultsAtom,
  isSearchLoadingAtom,
} from "@/store/atoms";
import { useCasinoStore } from "@/store/casino-store";

export function PlayerSearchModal() {
  // Local state with Jotai
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [searchResults, setSearchResults] = useAtom(searchResultsAtom);
  const [isLoading, setIsLoading] = useAtom(isSearchLoadingAtom);

  // Global state with Zustand
  const { setSelectedPlayer } = useCasinoStore();

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
            onClick={() => setSelectedPlayer(player)}
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
