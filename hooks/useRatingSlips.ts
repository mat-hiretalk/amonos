import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchActiveRatingSlips, 
  movePlayer, 
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
      return movePlayer(ratingSlipId, newTableId, newSeatNumber);
    },
    onSuccess: (updatedSlip) => {
      // Update the cache optimistically
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
  };
} 