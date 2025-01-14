import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Database } from '@/database.types';

type Player = Database["public"]["Tables"]["player"]["Row"] & {
  ratingslipId?: string | null;
};

interface PlayerState {
  players: Player[];
  selectedPlayer: Player | null;
  searchTerm: string;
  searchResults: Player[];
  isSearching: boolean;
  setSelectedPlayer: (player: Player | null) => void;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: Player[]) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearch: () => void;
  setPlayers: (players: Player[]) => void;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    (set) => ({
      players: [],
      selectedPlayer: null,
      searchTerm: '',
      searchResults: [],
      isSearching: false,
      setSelectedPlayer: (player) => set({ selectedPlayer: player }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (searching) => set({ isSearching: searching }),
      clearSearch: () => 
        set(
          { 
            searchTerm: '', 
            searchResults: [], 
            isSearching: false 
          }, 
          false, 
          'clearSearch'
        ),
      setPlayers: (players) => set({ players }),
    }),
    {
      name: 'Player Store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 