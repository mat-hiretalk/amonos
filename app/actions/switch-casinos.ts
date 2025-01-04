"use server";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const switchCasinos = async (casinoId: string) => {
  const cookieStore = await cookies();

  cookieStore.set("casinoId", casinoId);
};

export const getSelectedCasinoId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("casinoId")?.value;
};

export type Casino = {
  id: string;
  name: string;
  company_id: string | null;
  location: string;
};

export const getCasinoData = async (
  casinoId: string
): Promise<Casino | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("casino")
    .select("id, name, company_id, location")
    .eq("id", casinoId)
    .single();

  if (error) {
    console.error("Error fetching casino data:", error);
    return null;
  }

  return data;
};
