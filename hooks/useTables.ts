import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCasinoTables, fetchActiveRatingSlips, createRatingSlip } from '@/app/actions/casino';
import { useTableStore } from '@/store/table-store';
import type { TableData } from '@/components/casino-table';

export function useTables(casinoId: string) {
  const queryClient = useQueryClient();
  const { setTables, selectedTableId, selectedSeat } = useTableStore();

  // Query for fetching tables and rating slips
  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['tables', casinoId],
    queryFn: async () => {
      const [tables, activeRatingSlips] = await Promise.all([
        fetchCasinoTables(casinoId),
        fetchActiveRatingSlips()
      ]);

      const updatedTables: TableData[] = tables.map((table) => {
        const tableRatingSlips = activeRatingSlips.filter(
          (slip) => slip.gaming_table_id === table.gaming_table_id
        );

        const seats = Array.from(
          { length: Number(table.seats_available ?? 0) },
          (_, index) => {
            const seatNumber = index + 1;
            const ratingSlip = tableRatingSlips.find(
              (slip) => slip.seat_number === seatNumber
            );

            if (!ratingSlip?.visit?.player) {
              return null;
            }

            return {
              id: ratingSlip.playerId,
              firstName: ratingSlip.visit.player.firstName,
              lastName: ratingSlip.visit.player.lastName,
              email: "",
              company_id: null,
              dob: null,
              phone_number: null,
            };
          }
        );

        return {
          id: table.gaming_table_id,
          name: `${table.table_name ?? ""} - ${table.settings_name ?? ""}`,
          seats,
          averageBet: tableRatingSlips.reduce(
            (sum, slip) => sum + Number(slip.average_bet),
            0
          ),
          status: "active",
          hasVIP: false,
          ratingSlips: tableRatingSlips,
        };
      });

      setTables(updatedTables);
      return updatedTables;
    },
    refetchInterval: 5000, // Refetch every 5 seconds to keep data fresh
  });

  // Mutation for seating a player
  const { mutate: seatPlayer } = useMutation({
    mutationFn: async ({ player }: { player: any }) => {
      if (!selectedTableId || selectedSeat === null) {
        throw new Error('No table or seat selected');
      }

      const currentTable = tablesData?.find(t => t.id === selectedTableId);
      if (!currentTable) {
        throw new Error('Selected table not found');
      }

      return await createRatingSlip(
        selectedTableId,
        player.id,
        selectedSeat,
        casinoId
      );
    },
    onSuccess: () => {
      // Invalidate and refetch tables data
      queryClient.invalidateQueries({ queryKey: ['tables', casinoId] });
    },
  });

  return {
    tables: tablesData || [],
    isLoading,
    seatPlayer,
  };
} 