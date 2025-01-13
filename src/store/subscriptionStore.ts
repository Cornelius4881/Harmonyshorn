import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';

interface Subscription {
  id: string;
  planType: string;
  active: boolean;
  expiresAt: string;
  notificationPreferences?: {
    sound: string;
    schedule: {
      times: string[];
      timezone: string;
    };
    type: 'push' | 'sms' | 'both';
  };
}

interface PremiumContent {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  category: 'template' | 'sound' | 'theme';
}

interface Message {
  id: string;
  content: string;
  scheduledFor: string;
  type: 'affirmation' | 'verse' | 'devotional';
  sound?: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  premiumContent: PremiumContent[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  streak: number;
  points: number;
  language: string;
  fetchSubscription: () => Promise<void>;
  fetchPremiumContent: () => Promise<void>;
  subscribe: (planType: string) => Promise<void>;
  purchaseContent: (contentId: string) => Promise<void>;
  updateNotificationPreferences: (preferences: Subscription['notificationPreferences']) => Promise<void>;
  scheduleMessage: (message: Omit<Message, 'id'>) => Promise<void>;
  setLanguage: (lang: string) => void;
  incrementStreak: () => void;
  addPoints: (amount: number) => void;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  premiumContent: [],
  messages: [],
  loading: false,
  error: null,
  streak: 0,
  points: 0,
  language: 'en',

  fetchSubscription: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .maybeSingle(); // Using maybeSingle instead of single to handle no results gracefully

      if (error) throw error;
      set({ subscription: data });
      analytics.trackEvent('subscription_fetched');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
      set({ error: message });
      analytics.trackError(error as Error);
    } finally {
      set({ loading: false });
    }
  },

  fetchPremiumContent: async () => {
    set({ error: null });
    try {
      const { data, error } = await supabase
        .from('premium_content')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      set({ premiumContent: data });
      analytics.trackEvent('premium_content_fetched');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch premium content';
      set({ error: message });
      analytics.trackError(error as Error);
    }
  },

  subscribe: async (planType: string) => {
    set({ loading: true, error: null });
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          plan_type: planType,
          expires_at: expiresAt.toISOString(),
          active: true,
        });

      if (error) throw error;
      await get().fetchSubscription();
      analytics.trackEvent('subscription_created', { planType });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create subscription';
      set({ error: message });
      analytics.trackError(error as Error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateNotificationPreferences: async (preferences) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      await get().fetchSubscription();
      analytics.trackEvent('notification_preferences_updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update preferences';
      set({ error: message });
      analytics.trackError(error as Error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  scheduleMessage: async (message) => {
    set({ error: null });
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          ...message,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      analytics.trackEvent('message_scheduled');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to schedule message';
      set({ error: message });
      analytics.trackError(error as Error);
      throw error;
    }
  },

  setLanguage: (lang) => {
    set({ language: lang });
    analytics.trackEvent('language_changed', { language: lang });
  },

  incrementStreak: () => {
    set((state) => ({ streak: state.streak + 1 }));
    analytics.trackEvent('streak_incremented');
  },

  addPoints: (amount) => {
    set((state) => ({ points: state.points + amount }));
    analytics.trackEvent('points_added', { amount });
  },

  purchaseContent: async (contentId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_content')
        .insert([{
          content_id: contentId,
          purchased_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      analytics.trackEvent('content_purchased', { contentId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to purchase content';
      set({ error: message });
      analytics.trackError(error as Error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));