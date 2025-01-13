import { create } from 'zustand';
import { BibleVerse } from '../types/bible';
import { analytics } from '../lib/analytics';

interface BibleState {
  selectedVerse: BibleVerse | null;
  searchResults: BibleVerse[];
  loading: boolean;
  error: string | null;
  searchVerses: (query: string, translation: string) => Promise<void>;
  setSelectedVerse: (verse: BibleVerse) => void;
  clearSelectedVerse: () => void;
  clearError: () => void;
}

export const useBibleStore = create<BibleState>((set) => ({
  selectedVerse: null,
  searchResults: [],
  loading: false,
  error: null,
  
  searchVerses: async (query: string, translation: string) => {
    set({ loading: true, error: null });
    try {
      // Simulated API response for now
      const mockVerses: BibleVerse[] = [
        {
          id: '1',
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
          translation: 'KJV'
        },
        {
          id: '2',
          book: 'Psalm',
          chapter: 23,
          verse: 1,
          text: 'The Lord is my shepherd; I shall not want.',
          translation: 'KJV'
        }
      ];
      
      set({ searchResults: mockVerses });
      analytics.trackEvent('bible_verses_searched', { query, translation });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search verses';
      set({ error: message });
      analytics.trackError(error as Error);
    } finally {
      set({ loading: false });
    }
  },
  
  setSelectedVerse: (verse) => {
    set({ selectedVerse: verse });
    analytics.trackEvent('bible_verse_selected', { verse: `${verse.book} ${verse.chapter}:${verse.verse}` });
  },

  clearSelectedVerse: () => set({ selectedVerse: null }),
  
  clearError: () => set({ error: null })
}));