"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function stopRating(ratingSlipId: string) {
  const supabase = await createClient();

  const { error, data } = await supabase
    .from("ratingslip")
    .update({ end_time: new Date().toISOString() })
    .eq("id", ratingSlipId)
    .select("*");

  if (error) {
    throw new Error(`Error stopping rating: ${error.message}`);
  }

  return { success: true, oldSlip: data[0] };
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
