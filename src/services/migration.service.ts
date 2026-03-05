/**
 * Storage Migration Service
 * Handles migrating data from old storage schema to new namespaced format
 */

import { storageService } from './storage.service';
import {
  STORAGE_SCHEMA_VERSION,
  LegacyStorageSchema,
  SparklyStorageSchema,
  Migration,
  MigrationState,
} from '../types/storage.types';
import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_WALLPAPER_SETTINGS,
  DEFAULT_WIDGET_SETTINGS,
} from '../types/settings.types';

/**
 * Migration definitions
 */
const migrations: Migration[] = [
  {
    version: 1,
    name: 'Initial migration from legacy storage',
    up: async (storage) => {
      // Get all legacy data
      const legacyData = await getLegacyData();

      // Migrate wallpaper settings
      // Map legacy 'custom' source to 'random' since custom URL option was removed
      const legacySource = legacyData.wallpaperConfigType || 'random';
      const migratedSource = legacySource === 'custom' ? 'random' : legacySource;
      const wallpaperSettings = {
        ...DEFAULT_WALLPAPER_SETTINGS,
        source: migratedSource as typeof DEFAULT_WALLPAPER_SETTINGS.source,
        history: parseLegacyWallpapersTrail(legacyData.wallpapersTrail),
      };

      // Migrate general settings
      const generalSettings = {
        ...DEFAULT_GENERAL_SETTINGS,
        searchEngine: (legacyData.searchEngineId as 'google' | 'bing' | 'yahoo' | 'duckduckgo') || 'google',
      };

      // Migrate UI state
      const tabManagerCollapsed = legacyData.tabManagerCollapsed ?? false;

      // Set new namespaced keys
      await storage.set('settings:wallpaper', wallpaperSettings);
      await storage.set('settings:general', generalSettings);
      await storage.set('settings:widgets', DEFAULT_WIDGET_SETTINGS);
      await storage.set('ui:tabManagerCollapsed', tabManagerCollapsed);

      // Migrate cached image data
      if (legacyData.bufferedImage) {
        await storage.set('cache:bufferedImage', legacyData.bufferedImage);
      }
      if (legacyData.bufferedImageMetadata) {
        await storage.set('cache:bufferedImageMetadata', legacyData.bufferedImageMetadata);
      }

      // Migrate user bookmarks to plugin storage if they exist
      if (legacyData.userBookmarks && legacyData.userBookmarks.length > 0) {
        await storage.setNamespaced('bookmarks', 'items', legacyData.userBookmarks);
      }

      console.log('Migration v1 completed: Legacy data migrated to new schema');
    },
  },
];

/**
 * Get legacy data from storage
 */
async function getLegacyData(): Promise<Partial<LegacyStorageSchema>> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(
        [
          'wallpaperConfigType',
          'bufferedImage',
          'bufferedImageMetadata',
          'wallpapersTrail',
          'userBookmarks',
          'searchEngineId',
          'tabManagerCollapsed',
        ],
        (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(result as Partial<LegacyStorageSchema>);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Parse legacy wallpapers trail (stored as JSON string)
 */
function parseLegacyWallpapersTrail(trail: string | undefined): Array<{
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl: string;
}> {
  if (!trail) return [];

  try {
    const parsed = JSON.parse(trail);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        id: item.id || '',
        url: item.urls?.full || item.url || '',
        thumbnailUrl: item.urls?.thumb || item.thumbnailUrl || '',
        photographer: item.user?.name || item.photographer || 'Unknown',
        photographerUrl: item.user?.links?.html || item.photographerUrl || '',
      }));
    }
  } catch (error) {
    console.error('Failed to parse legacy wallpapers trail:', error);
  }

  return [];
}

/**
 * Migration Service Class
 */
class MigrationService {
  private static instance: MigrationService;

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    const currentVersion = await storageService.getSchemaVersion();

    if (currentVersion >= STORAGE_SCHEMA_VERSION) {
      console.log(`Storage schema is up to date (v${currentVersion})`);
      return;
    }

    console.log(`Migrating storage from v${currentVersion} to v${STORAGE_SCHEMA_VERSION}`);

    // Get migrations that need to be run
    const pendingMigrations = migrations.filter(
      (m) => m.version > currentVersion && m.version <= STORAGE_SCHEMA_VERSION
    );

    // Run each migration in order
    for (const migration of pendingMigrations) {
      try {
        console.log(`Running migration v${migration.version}: ${migration.name}`);
        await migration.up(storageService);
        await storageService.setSchemaVersion(migration.version);
      } catch (error) {
        console.error(`Migration v${migration.version} failed:`, error);
        throw new Error(
          `Migration v${migration.version} (${migration.name}) failed: ${error}`
        );
      }
    }

    console.log(`Migration complete. Schema version: ${STORAGE_SCHEMA_VERSION}`);
  }

  /**
   * Check if migration is needed
   */
  async needsMigration(): Promise<boolean> {
    const currentVersion = await storageService.getSchemaVersion();
    return currentVersion < STORAGE_SCHEMA_VERSION;
  }

  /**
   * Get current schema version
   */
  async getCurrentVersion(): Promise<number> {
    return storageService.getSchemaVersion();
  }

  /**
   * Reset storage to initial state (for testing/development)
   */
  async reset(): Promise<void> {
    await storageService.clear();
    await this.initializeDefaults();
  }

  /**
   * Initialize default settings for fresh install
   */
  async initializeDefaults(): Promise<void> {
    await storageService.setMultiple({
      schemaVersion: STORAGE_SCHEMA_VERSION,
      'settings:general': DEFAULT_GENERAL_SETTINGS,
      'settings:wallpaper': DEFAULT_WALLPAPER_SETTINGS,
      'settings:widgets': DEFAULT_WIDGET_SETTINGS,
      'ui:tabManagerCollapsed': false,
      'ui:rightSidebarCollapsed': false,
      'ui:onboardingComplete': false,
    });
  }

  /**
   * Check if this is a fresh install (no existing data)
   */
  async isFreshInstall(): Promise<boolean> {
    const version = await storageService.getSchemaVersion();
    if (version > 0) return false;

    // Check for legacy data
    const legacyData = await getLegacyData();
    const hasLegacyData = Object.values(legacyData).some(
      (value) => value !== undefined && value !== null
    );

    return !hasLegacyData;
  }
}

// Export singleton instance
export const migrationService = MigrationService.getInstance();

// Export class for testing
export { MigrationService };
