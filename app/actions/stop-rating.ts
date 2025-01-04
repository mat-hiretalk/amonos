"use server";

import {
  activeTableSettingsToGameSettings,
  calculatePoints,
} from "@/utils/points";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function stopRating(ratingSlipId: string) {
  const supabase = await createClient();

  const { data: ratingSlip } = await supabase
    .from("ratingslip")
    .select("*")
    .eq("id", ratingSlipId)
    .single();
  if (!ratingSlip || !ratingSlip.gaming_table_id) {
    throw new Error("Rating slip or gaming table ID not found");
  }
  const { data: tableSettings } = await supabase
    .from("activetablesandsettings")
    .select("*")
    .eq("gaming_table_id", ratingSlip.gaming_table_id)
    .single();
  if (!tableSettings) {
    throw new Error("Table settings not found");
  }

  const gameSettings = activeTableSettingsToGameSettings(tableSettings);
  const points = calculatePoints(
    gameSettings,
    ratingSlip.average_bet,
    ratingSlip.start_time,
    new Date().toISOString()
  );
  const { error, data: closedRatingSlip } = await supabase
    .from("ratingslip")
    .update({
      end_time: new Date().toISOString(),
      points_earned: points,
    })
    .eq("id", ratingSlipId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Error stopping rating: ${error.message}`);
  }

  return { success: true, oldSlip: closedRatingSlip };
}

export const stopRatingByVisitId = async (visitId: string) => {
  const supabase = await createClient();

  // First update any open rating slips
  await supabase
    .from("ratingslip")
    .update({ end_time: new Date().toISOString() })
    .eq("visit_id", visitId)
    .is("end_time", null);
};

export async function endVisit(visitId: string) {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("visit")
    .update({ check_out_date: new Date().toISOString() })
    .eq("id", visitId)
    .select("*");
  await stopRatingByVisitId(visitId);
}
