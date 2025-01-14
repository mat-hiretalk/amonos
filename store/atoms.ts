import { atom } from 'jotai';
import { Database } from '@/database.types';

type Player = Database["public"]["Tables"]["player"]["Row"] & {
  ratingslipId?: string | null;
};

// Casino-related atoms
export const selectedCasinoAtom = atom<string>('');
export const casinoModeAtom = atom<'seat' | 'visit'>('seat');

// Player-related atoms
export const selectedPlayerAtom = atom<Player | null>(null);
export const searchTermAtom = atom<string>('');
export const searchResultsAtom = atom<Player[]>([]);
export const isSearchLoadingAtom = atom<boolean>(false);

// Computed atoms
export const hasActiveSearchAtom = atom(
  (get) => get(searchResultsAtom).length > 0
); 