import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Database } from '@/database.types';

type Player = Database["public"]["Tables"]["player"]["Row"] & {
  ratingslipId?: string | null;
};

interface CasinoState {
  selectedCasino: string;
  mode: 'seat' | 'visit';
  selectedPlayer: Player | null;
  setSelectedCasino: (casino: string) => void;
  setMode: (mode: 'seat' | 'visit') => void;
  setSelectedPlayer: (player: Player | null) => void;
}

export const useCasinoStore = create<CasinoState>()(
  devtools(
    (set) => ({
      selectedCasino: '',
      mode: 'seat',
      selectedPlayer: null,
      setSelectedCasino: (casino) => set({ selectedCasino: casino }, false, 'setSelectedCasino'),
      setMode: (mode) => set({ mode }, false, 'setMode'),
      setSelectedPlayer: (player) => set({ selectedPlayer: player }, false, 'setSelectedPlayer'),
    }),
    {
      name: 'Casino Store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
); 