import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Database } from '@/database.types';

type Player = Database["public"]["Tables"]["player"]["Row"] & {
  ratingslipId?: string | null;
};

interface PlayerState {
  selectedPlayer: Player | null;
  searchTerm: string;
  searchResults: Player[];
  isSearching: boolean;
  setSelectedPlayer: (player: Player | null) => void;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: Player[]) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearch: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    (set) => ({
      selectedPlayer: null,
      searchTerm: '',
      searchResults: [],
      isSearching: false,
      setSelectedPlayer: (player) => set({ selectedPlayer: player }, false, 'setSelectedPlayer'),
      setSearchTerm: (term) => set({ searchTerm: term }, false, 'setSearchTerm'),
      setSearchResults: (results) => set({ searchResults: results }, false, 'setSearchResults'),
      setIsSearching: (searching) => set({ isSearching: searching }, false, 'setIsSearching'),
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
    }),
    {
      name: 'Player Store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 