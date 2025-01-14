"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPlayers } from "@/app/actions/player";
import { usePlayerStore } from "@/store/player-store";

export function PlayerSearchModal() {
  const {
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm,
    setSearchResults,
    setIsSearching,
    setSelectedPlayer,
  } = usePlayerStore();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const players = await searchPlayers(searchTerm);
      setSearchResults(players);
    } catch (error) {
      console.error("Error searching players:", error);
    } finally {
      setIsSearching(false);
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
        <Button onClick={handleSearch} disabled={isSearching}>
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
