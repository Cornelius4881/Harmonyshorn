import { BibleApiResponse, BibleVerse } from '../types/bible';

const API_URL = 'https://bible-api.com';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const cache = new Map<string, { data: any; timestamp: number }>();

export const bibleApi = {
  async searchVerses(query: string, translation: string = 'kjv'): Promise<BibleApiResponse> {
    try {
      const cacheKey = `${query}-${translation}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return this.formatResponse(cached.data);
      }

      const formattedQuery = encodeURIComponent(query.trim());
      const response = await fetch(`${API_URL}/${formattedQuery}?translation=${translation}`);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch verses: ${response.statusText}`);
      }

      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return this.formatResponse(data);
    } catch (error) {
      console.error('Error fetching verses:', error);
      throw error;
    }
  },

  // ... rest of the file remains unchanged
}