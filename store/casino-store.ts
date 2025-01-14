import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Database } from '@/database.types';

type Casino = {
  id: string;
  name: string;
};

interface CasinoState {
  casinos: Casino[];
  selectedCasino: string;
  mode: 'seat' | 'visit';
  isLoading: boolean;
  setCasinos: (casinos: Casino[]) => void;
  setSelectedCasino: (casino: string) => void;
  setMode: (mode: 'seat' | 'visit') => void;
  setIsLoading: (loading: boolean) => void;
}

export const useCasinoStore = create<CasinoState>()(
  devtools(
    (set) => ({
      casinos: [],
      selectedCasino: '',
      mode: 'seat',
      isLoading: false,
      setCasinos: (casinos) => set({ casinos }, false, 'setCasinos'),
      setSelectedCasino: (casino) => set({ selectedCasino: casino }, false, 'setSelectedCasino'),
      setMode: (mode) => set({ mode }, false, 'setMode'),
      setIsLoading: (loading) => set({ isLoading: loading }, false, 'setIsLoading'),
    }),
    {
      name: 'Casino Store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
); 