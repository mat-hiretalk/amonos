"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCasinoStore } from "@/store/casino-store";

export function CasinoSelector() {
  const {
    casinos,
    selectedCasino,
    isLoading,
    setCasinos,
    setSelectedCasino,
    setIsLoading,
  } = useCasinoStore();

  const supabase = createClient();

  useEffect(() => {
    const fetchCasinos = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("casino")
          .select("id, name")
          .order("name");

        if (error) {
          console.error("Error fetching casinos:", error);
          return;
        }

        setCasinos(data || []);
        if (data && data.length > 0 && !selectedCasino) {
          setSelectedCasino(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching casinos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCasinos();
  }, []);

  return (
    <Select
      value={selectedCasino}
      onValueChange={setSelectedCasino}
      disabled={isLoading}
    >
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
