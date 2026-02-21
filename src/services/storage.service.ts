/**
 * Enhanced Storage Service
 * Provides type-safe access to Chrome storage with namespacing and subscriptions
 */

import {
  IStorageService,
  SparklyStorageSchema,
  STORAGE_SCHEMA_VERSION,
  STORAGE_PREFIXES,
  StorageChangeEvent,
} from '../types/storage.types';

type StorageArea = 'local' | 'sync';

class StorageService implements IStorageService {
  private listeners: Map<string, Set<(newValue: unknown, oldValue: unknown) => void>> = new Map();
  private initialized = false;

  constructor() {
    this.setupChangeListener();
  }

  private setupChangeListener(): void {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        Object.entries(changes).forEach(([key, { newValue, oldValue }]) => {
          const callbacks = this.listeners.get(key);
          if (callbacks) {
            callbacks.forEach((callback) => {
              try {
                callback(newValue, oldValue);
              } catch (error) {
                console.error(`Storage listener error for key "${key}":`, error);
              }
            });
          }
        });
      });
      this.initialized = true;
    }
  }

  /**
   * Get a value from storage
   */
  async get<K extends keyof SparklyStorageSchema>(
    key: K
  ): Promise<SparklyStorageSchema[K] | null> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(result[key] ?? null);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Set a value in storage
   */
  async set<K extends keyof SparklyStorageSchema>(
    key: K,
    value: SparklyStorageSchema[K]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Remove a value from storage
   */
  async remove<K extends keyof SparklyStorageSchema>(key: K): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.remove(key, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get multiple values from storage
   */
  async getMultiple<K extends keyof SparklyStorageSchema>(
    keys: K[]
  ): Promise<Partial<Pick<SparklyStorageSchema, K>>> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(result as Partial<Pick<SparklyStorageSchema, K>>);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Set multiple values in storage
   */
  async setMultiple(items: Partial<SparklyStorageSchema>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get a namespaced value (for plugins)
   */
  async getNamespaced<T>(namespace: string, key: string): Promise<T | null> {
    const fullKey = `${STORAGE_PREFIXES.PLUGIN}${namespace}:${key}`;
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([fullKey], (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(result[fullKey] ?? null);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Set a namespaced value (for plugins)
   */
  async setNamespaced<T>(namespace: string, key: string, value: T): Promise<void> {
    const fullKey = `${STORAGE_PREFIXES.PLUGIN}${namespace}:${key}`;
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [fullKey]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Remove a namespaced value
   */
  async removeNamespaced(namespace: string, key: string): Promise<void> {
    const fullKey = `${STORAGE_PREFIXES.PLUGIN}${namespace}:${key}`;
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.remove(fullKey, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clear all values in a namespace
   */
  async clearNamespace(namespace: string): Promise<void> {
    const prefix = `${STORAGE_PREFIXES.PLUGIN}${namespace}:`;
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(null, (items) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const keysToRemove = Object.keys(items).filter((key) =>
            key.startsWith(prefix)
          );

          if (keysToRemove.length === 0) {
            resolve();
            return;
          }

          chrome.storage.local.remove(keysToRemove, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve();
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to changes for a specific key
   */
  subscribe<K extends keyof SparklyStorageSchema>(
    key: K,
    callback: (
      newValue: SparklyStorageSchema[K] | null,
      oldValue: SparklyStorageSchema[K] | null
    ) => void
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const callbacks = this.listeners.get(key)!;
    callbacks.add(callback as (newValue: unknown, oldValue: unknown) => void);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback as (newValue: unknown, oldValue: unknown) => void);
      if (callbacks.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  /**
   * Get the current schema version
   */
  async getSchemaVersion(): Promise<number> {
    const version = await this.get('schemaVersion');
    return version ?? 0;
  }

  /**
   * Set the schema version
   */
  async setSchemaVersion(version: number): Promise<void> {
    await this.set('schemaVersion', version);
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get storage usage information
   */
  async getUsage(): Promise<{ bytesInUse: number; quota: number }> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          // Chrome's unlimitedStorage gives effectively unlimited quota
          // but we can provide a reference point
          resolve({
            bytesInUse,
            quota: chrome.storage.local.QUOTA_BYTES || 5242880, // 5MB default
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing
export { StorageService };

// Helper functions for common operations

/**
 * Get settings from storage with defaults
 */
export async function getSettingsWithDefaults<T>(
  key: string,
  defaults: T
): Promise<T> {
  const stored = await storageService.get(key as keyof SparklyStorageSchema);
  if (stored === null) {
    return defaults;
  }
  return { ...defaults, ...(stored as T) };
}

/**
 * Update partial settings
 */
export async function updateSettings<T extends Record<string, unknown>>(
  key: string,
  updates: Partial<T>
): Promise<void> {
  const current = await storageService.get(key as keyof SparklyStorageSchema);
  const updated = { ...(current as T), ...updates };
  await storageService.set(key as keyof SparklyStorageSchema, updated as unknown as SparklyStorageSchema[keyof SparklyStorageSchema]);
}
