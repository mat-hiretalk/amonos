import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from "@/utils/supabase/client";
import { updateRatingSlipDetails } from '@/app/actions/casino';

interface UpdateRatingSlipParams {
  ratingSlipId: string;
  newTableId: string;
  newSeatNumber: number;
}

interface UpdateDetailsParams {
  ratingSlipId: string;
  averageBet: number;
  cashIn: number;
  startTime: string;
}

export function useRatingSlips() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const updateRatingSlipMutation = useMutation({
    mutationFn: async ({ ratingSlipId, newTableId, newSeatNumber }: UpdateRatingSlipParams) => {
      console.log("Updating rating slip:", { ratingSlipId, newTableId, newSeatNumber });
      const { error } = await supabase
        .from("ratingslip")
        .update({
          gaming_table_id: newTableId,
          seat_number: newSeatNumber,
        })
        .eq("id", ratingSlipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const updateDetailsMutation = useMutation({
    mutationFn: async ({ ratingSlipId, averageBet, cashIn, startTime }: UpdateDetailsParams) => {
      console.log("Updating rating slip details:", {
        ratingSlipId,
        averageBet,
        cashIn,
        startTime,
      });
      await updateRatingSlipDetails(ratingSlipId, {
        averageBet,
        cashIn,
        startTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  return {
    updateRatingSlip: updateRatingSlipMutation.mutate,
    updateDetails: updateDetailsMutation.mutate,
    isUpdating: updateRatingSlipMutation.isPending,
    isUpdatingDetails: updateDetailsMutation.isPending,
  };
} 