/**
 * Plugin API - Interface exposed to plugins for interacting with Sparkly
 */

import { storageService } from '../../services/storage.service';

export interface PluginStorageAPI {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PluginAPI {
  pluginId: string;
  storage: PluginStorageAPI;
}

/**
 * Create a namespaced Plugin API for a specific plugin
 */
export function createPluginAPI(pluginId: string): PluginAPI {
  // Storage API with namespace isolation
  const storage: PluginStorageAPI = {
    async get<T>(key: string): Promise<T | null> {
      return storageService.getNamespaced<T>(pluginId, key);
    },

    async set<T>(key: string, value: T): Promise<void> {
      return storageService.setNamespaced(pluginId, key, value);
    },

    async remove(key: string): Promise<void> {
      return storageService.removeNamespaced(pluginId, key);
    },

    async clear(): Promise<void> {
      return storageService.clearNamespace(pluginId);
    },
  };

  return {
    pluginId,
    storage,
  };
}
