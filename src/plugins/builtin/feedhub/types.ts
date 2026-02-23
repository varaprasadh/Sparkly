/**
 * FeedHub Types
 */

export interface FeedItem {
  id: string;
  title: string;
  url: string;
  author?: string;
  score?: number;
  comments?: number;
  tags?: string[];
  description?: string;
  avatarUrl?: string;
  meta?: string;
  time?: string; // ISO date string or unix timestamp for relative time display
}

export interface FeedSource {
  id: string;
  name: string;
  icon: string;
  color: string;
  fetcher: () => Promise<FeedItem[]>;
}

export interface FeedState {
  items: FeedItem[];
  loading: boolean;
  error: string | null;
}

export interface CustomFeed {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

// Storage keys
export const FEED_STORAGE_KEY = 'sparkly_feedhub_enabled';
export const FEED_CACHE_KEY = 'sparkly_feedhub_cache';
export const TOPIC_STORAGE_KEY = 'sparkly_feedhub_topics';
export const CUSTOM_FEEDS_KEY = 'sparkly_feedhub_custom';
export const LAYOUT_MODE_KEY = 'sparkly_feedhub_layout';

// Predefined topics for filtering
export const TOPIC_LIST = [
  'JavaScript',
  'Python',
  'TypeScript',
  'React',
  'AI',
  'DevOps',
  'Go',
  'Rust',
  'Mobile',
  'Data Science',
  'CSS',
  'Security',
] as const;
