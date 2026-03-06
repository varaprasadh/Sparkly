/**
 * Common utility types used across the application
 */

// Generic async state type
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic action type for reducers
export interface Action<T = string, P = unknown> {
  type: T;
  payload?: P;
}

// Timestamp type for consistency
export type Timestamp = string; // ISO 8601 format

// ID type for entities
export type EntityId = string;

// Position for draggable elements
export interface Position {
  x: number;
  y: number;
}

// Size for resizable elements
export interface Size {
  width: number;
  height: number;
}

// Rectangle for bounded elements
export interface Rectangle extends Position, Size {}

// Color types
export type HexColor = `#${string}`;
export type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;
export type Color = HexColor | RGBAColor | string;

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';

// Font size options
export type FontSize = 'small' | 'medium' | 'large';

// Layout density options
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

// Search engine types
export type SearchEngineId = 'google' | 'bing' | 'yahoo' | 'duckduckgo' | 'chatgpt' | 'claude';

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  url: string;
  icon: string;
}

// Wallpaper source types
export type WallpaperSource = 'random' | 'search' | 'history' | 'color' | 'upload';

// Wallpaper refresh frequency
export type WallpaperRefreshFrequency = 'never' | 'every-tab' | 'hourly' | 'daily';

// Wallpaper info from Unsplash
export interface WallpaperInfo {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl: string;
  downloadUrl?: string;
  color?: string;
}

// Bookmark type
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  createdAt: Timestamp;
}

// Top site from Chrome API
export interface TopSite {
  title: string;
  url: string;
  favicon?: string;
}

// Chrome tab type (subset of chrome.tabs.Tab)
export interface ChromeTab {
  id?: number;
  windowId: number;
  title?: string;
  url?: string;
  favIconUrl?: string;
  active: boolean;
  pinned: boolean;
  status?: string;
}

// Chrome window type (subset of chrome.windows.Window)
export interface ChromeWindow {
  id?: number;
  tabs?: ChromeTab[];
  focused: boolean;
  state?: string;
}

// Window group for tab manager
export interface WindowGroup {
  windowId: number;
  color: string;
  tabs: ChromeTab[];
  isFocused: boolean;
}

// Notification type for tiles
export interface TileNotification {
  count: number;
  label: string;
}

// Error boundary fallback props
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Generic callback types
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;
export type ValueCallback<T> = (value: T) => void;
export type AsyncValueCallback<T> = (value: T) => Promise<void>;
