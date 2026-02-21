/**
 * Plugin Registry - Manages plugin registration and lifecycle
 */

import { PluginManifest, PluginInstance } from '../types/plugin.types';
import { createPluginAPI, PluginAPI } from './core/PluginAPI';

export interface RegisteredPlugin {
  manifest: PluginManifest;
  instance: PluginInstance;
  api: PluginAPI;
}

type PluginEventHandler = (pluginId: string, plugin: RegisteredPlugin) => void;

class PluginRegistry {
  private plugins: Map<string, RegisteredPlugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private eventHandlers: {
    onRegister: PluginEventHandler[];
    onEnable: PluginEventHandler[];
    onDisable: PluginEventHandler[];
    onUnregister: PluginEventHandler[];
  } = {
    onRegister: [],
    onEnable: [],
    onDisable: [],
    onUnregister: [],
  };

  /**
   * Register a new plugin
   */
  register(manifest: PluginManifest, instance: PluginInstance): void {
    if (this.plugins.has(manifest.id)) {
      console.warn(`Plugin ${manifest.id} is already registered`);
      return;
    }

    const api = createPluginAPI(manifest.id);
    const plugin: RegisteredPlugin = { manifest, instance, api };

    this.plugins.set(manifest.id, plugin);

    // Call register handlers
    this.eventHandlers.onRegister.forEach((handler) => handler(manifest.id, plugin));
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} is not registered`);
      return;
    }

    // Disable first if enabled
    if (this.enabledPlugins.has(pluginId)) {
      this.disable(pluginId);
    }

    // Call unregister handlers
    this.eventHandlers.onUnregister.forEach((handler) => handler(pluginId, plugin));

    this.plugins.delete(pluginId);
  }

  /**
   * Enable a plugin
   */
  enable(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} is not registered`);
      return false;
    }

    if (this.enabledPlugins.has(pluginId)) {
      return true; // Already enabled
    }

    // Call plugin's onEnable if exists
    if (plugin.instance.onEnable) {
      try {
        plugin.instance.onEnable(plugin.api);
      } catch (error) {
        console.error(`Failed to enable plugin ${pluginId}:`, error);
        return false;
      }
    }

    this.enabledPlugins.add(pluginId);

    // Call enable handlers
    this.eventHandlers.onEnable.forEach((handler) => handler(pluginId, plugin));

    return true;
  }

  /**
   * Disable a plugin
   */
  disable(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} is not registered`);
      return false;
    }

    if (!this.enabledPlugins.has(pluginId)) {
      return true; // Already disabled
    }

    // Call plugin's onDisable if exists
    if (plugin.instance.onDisable) {
      try {
        plugin.instance.onDisable(plugin.api);
      } catch (error) {
        console.error(`Failed to disable plugin ${pluginId}:`, error);
        // Continue with disable anyway
      }
    }

    this.enabledPlugins.delete(pluginId);

    // Call disable handlers
    this.eventHandlers.onDisable.forEach((handler) => handler(pluginId, plugin));

    return true;
  }

  /**
   * Check if a plugin is enabled
   */
  isEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  /**
   * Get a registered plugin
   */
  get(pluginId: string): RegisteredPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAll(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all enabled plugins
   */
  getEnabled(): RegisteredPlugin[] {
    return Array.from(this.plugins.values()).filter((plugin) =>
      this.enabledPlugins.has(plugin.manifest.id)
    );
  }

  /**
   * Get plugin manifest by ID
   */
  getManifest(pluginId: string): PluginManifest | undefined {
    return this.plugins.get(pluginId)?.manifest;
  }

  /**
   * Get plugin API by ID
   */
  getAPI(pluginId: string): PluginAPI | undefined {
    return this.plugins.get(pluginId)?.api;
  }

  /**
   * Add event handler
   */
  on(
    event: 'register' | 'enable' | 'disable' | 'unregister',
    handler: PluginEventHandler
  ): () => void {
    const eventKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}` as keyof typeof this.eventHandlers;
    this.eventHandlers[eventKey].push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.eventHandlers[eventKey].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[eventKey].splice(index, 1);
      }
    };
  }

  /**
   * Get plugin count
   */
  get count(): number {
    return this.plugins.size;
  }

  /**
   * Get enabled plugin count
   */
  get enabledCount(): number {
    return this.enabledPlugins.size;
  }
}

// Export singleton instance
export const pluginRegistry = new PluginRegistry();

// Export class for testing
export { PluginRegistry };
