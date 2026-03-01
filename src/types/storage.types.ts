/**
 * Storage schema type definitions
 */

import { GeneralSettings, WallpaperSettings, AppearanceSettings, WidgetSettings } from './settings.types';
import { WallpaperInfo, Bookmark } from './common.types';
import { WidgetPlacement, WidgetZone } from './widget.types';
import { PluginState } from './plugin.types';

// Current schema version for migrations
export const STORAGE_SCHEMA_VERSION = 1;

// Storage key prefixes for namespacing
export const STORAGE_PREFIXES = {
  SETTINGS: 'settings:',
  PLUGIN: 'plugin:',
  CACHE: 'cache:',
  UI: 'ui:',
  LEGACY: '', // For backward compatibility
} as const;

// Settings storage keys
export interface SettingsStorageSchema {
  'settings:general': GeneralSettings;
  'settings:wallpaper': WallpaperSettings;
  'settings:appearance': AppearanceSettings;
  'settings:widgets': WidgetSettings;
}

// Plugin data storage keys (dynamic based on plugin ID)
export interface PluginStorageSchema {
  // Todo plugin
  'plugin:todo:items': TodoStorageItem[];
  'plugin:todo:categories': TodoCategoryStorage[];

  // Sticky notes plugin
  'plugin:sticky-notes:notes': StickyNoteStorage[];

}

// Cached data storage keys
export interface CacheStorageSchema {
  'cache:bufferedImage': string; // Base64 data URI
  'cache:bufferedImageMetadata': string; // JSON string of WallpaperInfo
  'cache:wallpapersTrail': WallpaperInfo[];
  'cache:topSites': Array<{ title: string; url: string }>;
  'cache:lastFetch': string; // ISO timestamp
}

// UI state storage keys
export interface UIStorageSchema {
  'ui:tabManagerCollapsed': boolean;
  'ui:rightSidebarCollapsed': boolean;
  'ui:lastActiveSettingsTab': string;
  'ui:zoneWidths': Record<WidgetZone, number>;
  'ui:onboardingComplete': boolean;
  'ui:lastVersion': string;
}

// Plugins and widgets storage keys
export interface PluginsWidgetsStorageSchema {
  'plugins:enabled': string[];
  'plugins:settings': Record<string, Record<string, unknown>>;
  'widgets:placements': WidgetPlacement[];
}

// Legacy storage keys (for migration)
export interface LegacyStorageSchema {
  wallpaperConfigType: 'random' | 'custom' | 'history';
  bufferedImage: string;
  bufferedImageMetadata: string;
  wallpapersTrail: string; // JSON string
  userBookmarks: Bookmark[];
  searchEngineId: string;
  tabManagerCollapsed: boolean;
}

// Combined storage schema
export interface SparklyStorageSchema extends
  SettingsStorageSchema,
  PluginStorageSchema,
  CacheStorageSchema,
  UIStorageSchema,
  PluginsWidgetsStorageSchema {
  schemaVersion: number;
}

// Plugin-specific storage types

// Todo plugin storage
export interface TodoStorageItem {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string | null;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt: string | null;
  order: number;
}

export interface TodoCategoryStorage {
  id: string;
  name: string;
  color: string;
  order: number;
}

// Sticky notes plugin storage
export interface StickyNoteStorage {
  id: string;
  content: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  zIndex: number;
}

// Storage service interface
export interface IStorageService {
  // Basic operations
  get<K extends keyof SparklyStorageSchema>(key: K): Promise<SparklyStorageSchema[K] | null>;
  set<K extends keyof SparklyStorageSchema>(key: K, value: SparklyStorageSchema[K]): Promise<void>;
  remove<K extends keyof SparklyStorageSchema>(key: K): Promise<void>;

  // Bulk operations
  getMultiple<K extends keyof SparklyStorageSchema>(keys: K[]): Promise<Partial<Pick<SparklyStorageSchema, K>>>;
  setMultiple(items: Partial<SparklyStorageSchema>): Promise<void>;

  // Namespaced operations (for plugins)
  getNamespaced<T>(namespace: string, key: string): Promise<T | null>;
  setNamespaced<T>(namespace: string, key: string, value: T): Promise<void>;
  removeNamespaced(namespace: string, key: string): Promise<void>;
  clearNamespace(namespace: string): Promise<void>;

  // Subscriptions
  subscribe<K extends keyof SparklyStorageSchema>(
    key: K,
    callback: (newValue: SparklyStorageSchema[K] | null, oldValue: SparklyStorageSchema[K] | null) => void
  ): () => void;

  // Migration
  getSchemaVersion(): Promise<number>;
  setSchemaVersion(version: number): Promise<void>;

  // Utilities
  clear(): Promise<void>;
  getUsage(): Promise<{ bytesInUse: number; quota: number }>;
}

// Storage change event
export interface StorageChangeEvent<T = unknown> {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  area: 'local' | 'sync';
}

// Migration types
export interface Migration {
  version: number;
  name: string;
  up: (storage: IStorageService) => Promise<void>;
  down?: (storage: IStorageService) => Promise<void>;
}

export interface MigrationState {
  currentVersion: number;
  appliedMigrations: Array<{
    version: number;
    name: string;
    appliedAt: string;
  }>;
}
