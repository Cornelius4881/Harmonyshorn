import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { nlp } from '../lib/nlp';
import { analytics } from '../lib/analytics';

interface PrayerRequest {
  id: string;
  content: string;
  userId: string;
  isAnonymous: boolean;
  sentiment?: {
    score: number;
    magnitude: number;
  };
  recommendedScriptures?: string[];
  createdAt: string;
}

interface PrayerState {
  requests: PrayerRequest[];
  loading: boolean;
  error: string | null;
  submitRequest: (content: string, isAnonymous: boolean) => Promise<void>;
  fetchRequests: () => Promise<void>;
  analyzeSentiment: (content: string) => Promise<void>;
  clearError: () => void;
}

export const usePrayerStore = create<PrayerState>((set, get) => ({
  requests: [],
  loading: false,
  error: null,

  submitRequest: async (content: string, isAnonymous: boolean) => {
    set({ loading: true, error: null });
    try {
      // First moderate the content
      if (!nlp.moderateContent(content)) {
        throw new Error('Prayer request contains inappropriate content');
      }

      // Analyze sentiment and get recommended scriptures
      const sentiment = await nlp.analyzeSentiment(content);
      const recommendedScriptures = await nlp.recommendScriptures(content);

      const { error } = await supabase
        .from('prayer_requests')
        .insert([{
          content,
          is_anonymous: isAnonymous,
          sentiment,
          recommended_scriptures: recommendedScriptures,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      await get().fetchRequests();
      analytics.trackEvent('prayer_request_submitted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit prayer request';
      set({ error: message });
      analytics.trackError(error as Error);
    } finally {
      set({ loading: false });
    }
  },

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ requests: data });
      analytics.trackEvent('prayer_requests_fetched');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch prayer requests';
      set({ error: message });
      analytics.trackError(error as Error);
    } finally {
      set({ loading: false });
    }
  },

  analyzeSentiment: async (content: string) => {
    try {
      const sentiment = await nlp.analyzeSentiment(content);
      analytics.trackEvent('sentiment_analyzed', { sentiment });
      return sentiment;
    } catch (error) {
      analytics.trackError(error as Error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));