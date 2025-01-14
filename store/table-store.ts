import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TableData } from '@/components/casino-table';
import type { RatingSlipWithPlayer } from '@/app/actions/casino';

interface TableState {
  tables: TableData[];
  activeRatingSlips: RatingSlipWithPlayer[];
  selectedTableId: string | null;
  isLoading: boolean;
  setTables: (tables: TableData[]) => void;
  setActiveRatingSlips: (slips: RatingSlipWithPlayer[]) => void;
  setSelectedTable: (tableId: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  updateTable: (tableId: string, updates: Partial<TableData>) => void;
}

export const useTableStore = create<TableState>()(
  devtools(
    (set) => ({
      tables: [],
      activeRatingSlips: [],
      selectedTableId: null,
      isLoading: false,
      setTables: (tables) => set({ tables }, false, 'setTables'),
      setActiveRatingSlips: (slips) => set({ activeRatingSlips: slips }, false, 'setActiveRatingSlips'),
      setSelectedTable: (tableId) => set({ selectedTableId: tableId }, false, 'setSelectedTable'),
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
    }),
    {
      name: 'Table Store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 