"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { switchCasinos } from "@/app/actions/switch-casinos";
import { useRouter } from "next/navigation";

interface Casino {
  id: string;
  name: string;
  company_id: string | null;
  location: string;
}

interface CasinoSelectionPageProps {}

export function CasinoSelectionPage({}: CasinoSelectionPageProps) {
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    const fetchCasinos = async () => {
      const { data, error } = await supabase
        .from("casino")
        .select("id, name, company_id, location")
        .order("name");

      if (error) {
        console.error("Error fetching casinos:", error);
        return;
      }

      setCasinos(data || []);
    };

    fetchCasinos();
  }, []);

  const handleCasinoSelect = async (casinoId: string) => {
    await switchCasinos(casinoId);

    router.push(`/pit/${casinoId}`);
  };

  return (
    <div className="casino-selection-page">
      <h1>Select a Casino</h1>
      <div className="casino-list">
        {casinos.map((casino) => (
          <div key={casino.id}>
            <button onClick={() => handleCasinoSelect(casino.id)}>
              {casino.name} - {casino.location}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
