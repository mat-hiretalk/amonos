"use server";
import { createClient } from "@/utils/supabase/server";
import { Json } from "@/database.types";

export async function startRating(
  playerId: string,
  casinoId: string,
  tableId: string,
  seatNumber: number,
  averageBet: number = 0,
  gameSettings: Json
) {
  const supabase = await createClient();

  const { data: visitData, error: visitError } = await supabase
    .from("visit")
    .select("id")
    .eq("player_id", playerId)
    .is("check_out_date", null)
    .single();
  let visitId = visitData?.id;
  if (!visitId) {
    const newVisit = await createVisit(playerId, casinoId);
    visitId = newVisit.id;
  }

  const { data, error } = await supabase
    .from("ratingslip")
    .insert([
      {
        visit_id: visitId,
        gaming_table_id: tableId,
        seat_number: seatNumber,
        start_time: new Date().toISOString(),
        average_bet: averageBet,
        game_settings: gameSettings,
      },
    ])
    .select();

  if (error) throw new Error(`Error creating rating slip: ${error.message}`);
  return { success: true, ratingSlip: data ? data[0] : null };
}

export async function createVisit(playerId: string, casinoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
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
}
