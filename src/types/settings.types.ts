/**
 * Settings type definitions
 */

import {
  SearchEngineId,
  WallpaperSource,
  WallpaperRefreshFrequency,
  WallpaperInfo,
  ThemeMode,
  FontSize,
  LayoutDensity,
  Color,
} from './common.types';

// Re-export types needed by settings components
export type { ThemeMode, FontSize, LayoutDensity, SearchEngineId, WallpaperSource } from './common.types';

// Wallpaper frequency type alias
export type WallpaperFrequency = WallpaperRefreshFrequency;
import { WidgetPlacement, WidgetZone } from './widget.types';

// Settings tab identifiers
export type SettingsTab = 'general' | 'wallpaper' | 'widgets' | 'appearance';

// General settings
export interface GeneralSettings {
  searchEngine: SearchEngineId;
  openLinksInNewTab: boolean;
  showGreeting: boolean;
  userName: string;
  showTopSites: boolean;
  topSitesCount: number;
  showTabManager: boolean;
  showClock: boolean;
  showSearch: boolean;
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  showDate: boolean;
  dateFormat: 'short' | 'long' | 'full';
  showBookmarks: boolean;
  maxQuickLinks: number;
  showFeedHub: boolean;
  showWeather: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

// Wallpaper settings
export interface WallpaperSettings {
  source: WallpaperSource;
  refreshFrequency: WallpaperRefreshFrequency;
  categories: string[];
  solidColor: Color;
  favorites: WallpaperInfo[];
  history: WallpaperInfo[];
  historyLimit: number;
  showAttribution: boolean;
  overlayOpacity: number;
  overlayColor: Color;
  blurAmount: number;
  blur: boolean;
  dim: boolean;
}

// Appearance settings
export interface AppearanceSettings {
  theme: ThemeMode;
  accentColor: Color;
  fontFamily: string;
  fontSize: FontSize;
  layoutDensity: LayoutDensity;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  widgetBorderRadius: number;
  glassEffect: boolean;
  animations: boolean;
  enableAnimations: boolean;
  enableTransparency: boolean;
  reducedMotion: boolean;
}

// Widget settings
export interface WidgetSettings {
  enabledPlugins: string[];
  pluginSettings: Record<string, Record<string, unknown>>;
  zonePlacements: WidgetPlacement[];
  zoneStates: Record<WidgetZone, {
    isCollapsed: boolean;
    width?: number;
    height?: number;
  }>;
}

// Combined settings state
export interface SettingsState {
  general: GeneralSettings;
  wallpaper: WallpaperSettings;
  appearance: AppearanceSettings;
  widgets: WidgetSettings;
  lastSaved: string | null;
  isDirty: boolean;
}

// Settings update payload
export type SettingsUpdatePayload<K extends keyof SettingsState> = {
  section: K;
  values: Partial<SettingsState[K]>;
};

// Settings tab configuration
export interface SettingsTabConfig {
  id: SettingsTab;
  label: string;
  icon: string;
  description?: string;
}

// Default settings values
export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  searchEngine: 'google',
  openLinksInNewTab: true,
  showGreeting: true,
  userName: '',
  showTopSites: true,
  topSitesCount: 8,
  showTabManager: true,
  showClock: true,
  showSearch: true,
  clockFormat: '12h',
  showSeconds: false,
  showDate: true,
  dateFormat: 'long',
  showBookmarks: true,
  maxQuickLinks: 8,
  showFeedHub: true,
  showWeather: true,
  temperatureUnit: 'celsius',
};

export const DEFAULT_WALLPAPER_SETTINGS: WallpaperSettings = {
  source: 'random',
  refreshFrequency: 'every-tab',
  categories: ['nature', 'sky', 'cosmos'],
  solidColor: '#1a1a2e',
  favorites: [],
  history: [],
  historyLimit: 10,
  showAttribution: true,
  overlayOpacity: 0.3,
  overlayColor: 'rgba(0, 0, 0, 0.3)',
  blurAmount: 0,
  blur: false,
  dim: false,
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'dark',
  accentColor: '#6366f1',
  fontFamily: 'system-ui',
  fontSize: 'medium',
  layoutDensity: 'comfortable',
  borderRadius: 'medium',
  widgetBorderRadius: 12,
  glassEffect: true,
  animations: true,
  enableAnimations: true,
  enableTransparency: true,
  reducedMotion: false,
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  enabledPlugins: ['builtin-hackernews', 'builtin-github', 'builtin-devto'],
  pluginSettings: {},
  zonePlacements: [],
  zoneStates: {
    'left-sidebar': { isCollapsed: false },
    'top-bar': { isCollapsed: false },
    'center': { isCollapsed: false },
    'right-sidebar': { isCollapsed: false },
    'floating': { isCollapsed: false },
  },
};

// Settings tabs configuration
export const SETTINGS_TABS: SettingsTabConfig[] = [
  {
    id: 'general',
    label: 'General',
    icon: 'SettingOutlined',
    description: 'Basic preferences and behavior',
  },
  {
    id: 'wallpaper',
    label: 'Wallpaper',
    icon: 'PictureOutlined',
    description: 'Background image settings',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: 'BgColorsOutlined',
    description: 'Theme and visual preferences',
  },
];
