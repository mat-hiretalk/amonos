import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TableData } from '@/components/casino-table';
import type { RatingSlipWithPlayer } from '@/app/actions/casino';
import { createRatingSlip } from '@/app/actions/casino';

interface TableState {
  tables: TableData[];
  activeRatingSlips: RatingSlipWithPlayer[];
  selectedTableId: string | null;
  selectedSeat: number | null;
  isLoading: boolean;
  setTables: (tables: TableData[]) => void;
  setActiveRatingSlips: (slips: RatingSlipWithPlayer[]) => void;
  setSelectedTable: (tableId: string | null) => void;
  setSelectedSeat: (seatNumber: number | null) => void;
  setIsLoading: (loading: boolean) => void;
  updateTable: (tableId: string, updates: Partial<TableData>) => void;
  seatPlayer: (player: any, casinoId: string) => Promise<{ tableName: string; seatNumber: number }>;
  getSelectedTableDetails: () => { table: TableData | null; seatNumber: number | null };
}

export const useTableStore = create<TableState>()(
  devtools(
    (set, get) => ({
      tables: [],
      activeRatingSlips: [],
      selectedTableId: null,
      selectedSeat: null,
      isLoading: false,
      setTables: (tables) => set({ tables }, false, 'setTables'),
      setActiveRatingSlips: (slips) => set({ activeRatingSlips: slips }, false, 'setActiveRatingSlips'),
      setSelectedTable: (tableId) => set({ selectedTableId: tableId }, false, 'setSelectedTable'),
      setSelectedSeat: (seatNumber) => set({ selectedSeat: seatNumber }, false, 'setSelectedSeat'),
      setIsLoading: (loading) => set({ isLoading: loading }, false, 'setIsLoading'),
      updateTable: (tableId, updates) =>
        set(
          (state) => ({
            tables: state.tables.map((table) =>
              table.id === tableId ? { ...table, ...updates } : table
            ),
          }),
          false,
          'updateTable'
        ),
      getSelectedTableDetails: () => {
        const state = get();
        const selectedTable = state.tables.find(t => t.id === state.selectedTableId);
        return {
          table: selectedTable || null,
          seatNumber: state.selectedSeat
        };
      },
      seatPlayer: async (player: any, casinoId: string) => {
        const state = get();
        if (!state.selectedTableId || state.selectedSeat === null) {
          throw new Error('No table or seat selected');
        }

        const currentTable = state.tables.find(t => t.id === state.selectedTableId);
        if (!currentTable) {
          throw new Error('Selected table not found');
        }

        try {
          set({ isLoading: true }, false, 'setLoading');
          await createRatingSlip(
            state.selectedTableId,
            player.id,
            state.selectedSeat,
            casinoId
          );

          // Update the table state with full player information
          const updatedSeats = [...currentTable.seats];
          updatedSeats[state.selectedSeat - 1] = player;
            
          set(
            (state) => ({
              tables: state.tables.map((table) =>
                table.id === state.selectedTableId
                  ? {
                      ...table,
                      seats: updatedSeats,
                      status: 'active',
                    }
                  : table
              ),
            }),
            false,
            'updateTableSeats'
          );

          return {
            tableName: currentTable.name,
            seatNumber: state.selectedSeat
          };
        } finally {
          set({ isLoading: false, selectedSeat: null }, false, 'clearSelection');
        }
      },
    }),
    {
      name: 'Table Store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 