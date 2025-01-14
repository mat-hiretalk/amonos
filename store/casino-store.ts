import { create } from 'zustand';
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

export const useCasinoStore = create<CasinoState>((set) => ({
  selectedCasino: '',
  mode: 'seat',
  selectedPlayer: null,
  setSelectedCasino: (casino) => set({ selectedCasino: casino }),
  setMode: (mode) => set({ mode }),
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),
})); 