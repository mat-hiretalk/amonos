"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Casino {
  id: string;
  name: string;
}

interface CasinoSelectorProps {
  onCasinoChange: (casinoId: string) => void;
  selectedCasino: string;
}

export function CasinoSelector({ onCasinoChange }: CasinoSelectorProps) {
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [selectedCasino, setSelectedCasino] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const fetchCasinos = async () => {
      const { data, error } = await supabase
        .from("casino")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error fetching casinos:", error);
        return;
      }

      setCasinos(data || []);
      if (data && data.length > 0) {
        setSelectedCasino(data[0].id);
        onCasinoChange(data[0].id);
      }
    };

    fetchCasinos();
  }, [onCasinoChange]);

  const handleCasinoChange = (value: string) => {
    setSelectedCasino(value);
    onCasinoChange(value);
  };

  return (
    <Select value={selectedCasino} onValueChange={handleCasinoChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a casino" />
      </SelectTrigger>
      <SelectContent>
        {casinos.map((casino) => (
          <SelectItem key={casino.id} value={casino.id}>
            {casino.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
