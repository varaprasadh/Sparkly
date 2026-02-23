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

export const FEED_STORAGE_KEY = 'sparkly_feedhub_enabled';
export const FEED_CACHE_KEY = 'sparkly_feedhub_cache';
