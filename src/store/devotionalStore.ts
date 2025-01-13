import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { nlp } from '../lib/nlp';
import { analytics } from '../lib/analytics';

interface Devotional {
  id: string;
  scripture: string;
  content: string;
  reflection: string;
  createdAt: string;
}

interface DevotionalState {
  devotionals: Devotional[];
  loading: boolean;
  error: string | null;
  generateDevotional: (scripture: string) => Promise<void>;
  fetchDevotionals: () => Promise<void>;
  saveDevotional: (devotional: Omit<Devotional, 'id' | 'createdAt'>) => Promise<void>;
  clearError: () => void;
}

export const useDevotionalStore = create<DevotionalState>((set, get) => ({
  devotionals: [],
  loading: false,
  error: null,

  generateDevotional: async (scripture: string) => {
    set({ loading: true, error: null });
    try {
      const content = await nlp.generateDevotional(scripture);
      const reflection = "Take a moment to reflect on how this scripture applies to your life today.";
      
      await get().saveDevotional({ scripture, content, reflection });
      analytics.trackEvent('devotional_generated', { scripture });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate devotional';
      set({ error: message });
      analytics.trackError(error as Error);
    } finally {
      set({ loading: false });
    }
  },

  fetchDevotionals: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ devotionals: data });
      analytics.trackEvent('devotionals_fetched');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch devotionals';
      set({ error: message });
      analytics.trackError(error as Error);
    } finally {
      set({ loading: false });
    }
  },

  saveDevotional: async (devotional) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('devotionals')
        .insert([{
          ...devotional,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      await get().fetchDevotionals();
      analytics.trackEvent('devotional_saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save devotional';
      set({ error: message });
      analytics.trackError(error as Error);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));