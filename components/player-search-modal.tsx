"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/database.types";

type Player = Database["public"]["Tables"]["player"]["Row"];

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
  const supabase = createClient();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("player")
      .select("*")
      .or(
        `name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      )
      .limit(10);
    setIsLoading(false);

    if (error) {
      console.error("Error searching players:", error);
      return;
    }

    setSearchResults(data || []);
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
            <div className="font-medium">{player.firstName}</div>
            <div className="text-sm text-muted-foreground">
              {player.phone_number} • {player.email}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
