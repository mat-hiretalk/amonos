import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchActiveRatingSlips, 
  movePlayer,
  updateRatingSlipDetails,
  type RatingSlipWithPlayer 
} from '@/app/actions/casino';

export function useRatingSlips() {
  const queryClient = useQueryClient();

  const { data: ratingSlips = [], isLoading, error } = useQuery({
    queryKey: ['ratingSlips'],
    queryFn: fetchActiveRatingSlips,
  });

  const updateRatingSlip = useMutation({
    mutationFn: async ({ 
      ratingSlipId, 
      newTableId, 
      newSeatNumber 
    }: { 
      ratingSlipId: string; 
      newTableId: string; 
      newSeatNumber: number; 
    }) => {
      const updatedSlip = await movePlayer(ratingSlipId, newTableId, newSeatNumber);
      return {
        ...updatedSlip,
        playerName: updatedSlip.visit?.player 
          ? `${updatedSlip.visit.player.firstName} ${updatedSlip.visit.player.lastName}`
          : "Unknown Player",
        playerId: ratingSlipId,
      } as RatingSlipWithPlayer;
    },
    onSuccess: (updatedSlip) => {
      queryClient.setQueryData<RatingSlipWithPlayer[]>(['ratingSlips'], (old = []) => 
        old.map(slip => slip.id === updatedSlip.id ? updatedSlip : slip)
      );
    },
  });

  const updateDetails = useMutation({
    mutationFn: async ({
      ratingSlipId,
      averageBet,
      cashIn,
      startTime,
    }: {
      ratingSlipId: string;
      averageBet: number;
      cashIn: number;
      startTime: string;
    }) => {
      const updatedSlip = await updateRatingSlipDetails(ratingSlipId, {
        averageBet,
        cashIn,
        startTime,
      });
      return {
        ...updatedSlip,
        playerName: updatedSlip.visit?.player 
          ? `${updatedSlip.visit.player.firstName} ${updatedSlip.visit.player.lastName}`
          : "Unknown Player",
        playerId: ratingSlipId,
      } as RatingSlipWithPlayer;
    },
    onSuccess: (updatedSlip) => {
      queryClient.setQueryData<RatingSlipWithPlayer[]>(['ratingSlips'], (old = []) => 
        old.map(slip => slip.id === updatedSlip.id ? updatedSlip : slip)
      );
    },
  });

  return {
    ratingSlips,
    isLoading,
    error,
    updateRatingSlip: updateRatingSlip.mutate,
    isUpdating: updateRatingSlip.isPending,
    updateDetails: updateDetails.mutate,
    isUpdatingDetails: updateDetails.isPending,
  };
} 