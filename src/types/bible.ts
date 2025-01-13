export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  category?: string;
  favorite?: boolean;
  lastAccessed?: string;
}

export interface BibleApiResponse {
  verses: BibleVerse[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string;
}