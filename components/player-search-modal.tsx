"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPlayers } from "@/app/actions/player";
import { usePlayerStore } from "@/store/player-store";
import { useCasinoStore } from "@/store/casino-store";
import { useTableStore } from "@/store/table-store";
import { useClientToast } from "@/providers/toast-context";

export function PlayerSearchModal() {
  const [isMounted, setIsMounted] = useState(false);
  const {
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm,
    setSearchResults,
    setIsSearching,
    setSelectedPlayer,
    clearSearch,
  } = usePlayerStore();

  const { selectedCasino, mode } = useCasinoStore();
  const {
    seatPlayer,
    isLoading: isSeating,
    getSelectedTableDetails,
  } = useTableStore();
  const { toast } = useClientToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const players = await searchPlayers(searchTerm);
      setSearchResults(players);
    } catch (error) {
      console.error("Error searching players:", error);
      if (isMounted) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to search for players",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayerSelect = async (player: any) => {
    try {
      if (mode === "seat") {
        const { tableName, seatNumber } = await seatPlayer(
          player,
          selectedCasino
        );
        if (isMounted) {
          toast({
            title: "Player Seated Successfully",
            description: `${player.firstName} ${player.lastName} has been seated at ${tableName}, Seat ${seatNumber}`,
          });
        }
      }
      setSelectedPlayer(player);
      clearSearch();
    } catch (error) {
      console.error("Error handling player selection:", error);
      if (isMounted) {
        const { table, seatNumber } = getSelectedTableDetails();
        toast({
          variant: "destructive",
          title: "Seating Failed",
          description: `Failed to seat ${player.firstName} ${player.lastName} at ${
            table?.name || "table"
          }, Seat ${seatNumber}. Please try again.`,
        });
      }
    }
  };

  if (!isMounted) {
    return null;
  }

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
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {searchResults.map((player) => (
          <div
            key={player.id}
            className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
            onClick={() => handlePlayerSelect(player)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-lg">
                  {player.firstName} {player.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {player.phone_number} • {player.email}
                </div>
              </div>
              <Button variant="secondary" size="sm" disabled={isSeating}>
                {isSeating
                  ? "Seating..."
                  : mode === "seat"
                    ? "Seat Player"
                    : "Start Visit"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
