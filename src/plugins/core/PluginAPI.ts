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

export interface PluginNotificationAPI {
  show(options: {
    title: string;
    message: string;
    iconUrl?: string;
    buttons?: Array<{ title: string }>;
  }): Promise<string>;
  clear(notificationId: string): Promise<void>;
}

export interface PluginAlarmAPI {
  create(name: string, alarmInfo: chrome.alarms.AlarmCreateInfo): Promise<void>;
  clear(name: string): Promise<void>;
  get(name: string): Promise<chrome.alarms.Alarm | undefined>;
  getAll(): Promise<chrome.alarms.Alarm[]>;
}

export interface PluginAPI {
  pluginId: string;
  storage: PluginStorageAPI;
  notifications: PluginNotificationAPI;
  alarms: PluginAlarmAPI;
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

  // Notifications API with plugin prefix
  const notifications: PluginNotificationAPI = {
    async show(options): Promise<string> {
      return new Promise((resolve, reject) => {
        const notificationId = `${pluginId}-${Date.now()}`;
        const notificationOptions: chrome.notifications.NotificationOptions = {
          type: 'basic',
          title: options.title,
          message: options.message,
          iconUrl: options.iconUrl || '/icons/icon128.png',
          buttons: options.buttons,
        };

        chrome.notifications.create(notificationId, notificationOptions, (id) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(id);
          }
        });
      });
    },

    async clear(notificationId: string): Promise<void> {
      return new Promise((resolve, reject) => {
        chrome.notifications.clear(notificationId, (wasCleared) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    },
  };

  // Alarms API with plugin prefix
  const alarms: PluginAlarmAPI = {
    async create(name: string, alarmInfo: chrome.alarms.AlarmCreateInfo): Promise<void> {
      const prefixedName = `${pluginId}:${name}`;
      // Chrome MV3 - alarms.create returns a promise
      try {
        await chrome.alarms.create(prefixedName, alarmInfo);
      } catch (e) {
        // Fallback for callback-style API
        chrome.alarms.create(prefixedName, alarmInfo);
      }
    },

    async clear(name: string): Promise<void> {
      const prefixedName = `${pluginId}:${name}`;
      return new Promise((resolve, reject) => {
        chrome.alarms.clear(prefixedName, (wasCleared) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    },

    async get(name: string): Promise<chrome.alarms.Alarm | undefined> {
      const prefixedName = `${pluginId}:${name}`;
      return new Promise((resolve, reject) => {
        chrome.alarms.get(prefixedName, (alarm) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(alarm);
          }
        });
      });
    },

    async getAll(): Promise<chrome.alarms.Alarm[]> {
      const prefix = `${pluginId}:`;
      return new Promise((resolve, reject) => {
        chrome.alarms.getAll((alarms) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            // Filter to only this plugin's alarms
            const pluginAlarms = alarms.filter((alarm) => alarm.name.startsWith(prefix));
            resolve(pluginAlarms);
          }
        });
      });
    },
  };

  return {
    pluginId,
    storage,
    notifications,
    alarms,
  };
}
