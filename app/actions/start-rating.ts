"use server";
import { createClient } from "@/utils/supabase/server";
import { Json } from "@/database.types";

export async function startRating(
  visitId: string,
  tableId: string,
  seatNumber: number,
  averageBet: number = 0,
  gameSettings: Json
) {
  const supabase = await createClient();
  console.log(
    "starting rating slip",
    visitId,
    tableId,
    seatNumber,
    averageBet,
    (gameSettings = {})
  );
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
  console.log("new rating slip", data);
  if (error) throw new Error(`Error creating rating slip: ${error.message}`);
  return { success: true, ratingSlip: data ? data[0] : null };
}
