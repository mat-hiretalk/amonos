'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function stopRating(ratingSlipId: string) {
  const supabase = await createClient()

  const { error, data } = await supabase
    .from('ratingslip')
    .update({ end_time: new Date().toISOString() })
    .eq('id', ratingSlipId)
    .select("*")

  if (error) {
    throw new Error(`Error stopping rating: ${error.message}`)
  }
  console.log("stop rating data", data)
  return { success: true, oldSlip: data[0] }
} 