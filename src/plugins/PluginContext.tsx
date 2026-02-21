/**
 * Plugin Context - React context for plugin system
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { pluginRegistry, RegisteredPlugin } from './PluginRegistry';
import { PluginManifest, PluginInstance } from '../types/plugin.types';
import { usePlugins } from '../store/hooks';

// Context types
interface PluginContextValue {
  plugins: RegisteredPlugin[];
  enabledPlugins: RegisteredPlugin[];
  isPluginEnabled: (pluginId: string) => boolean;
  enablePlugin: (pluginId: string) => void;
  disablePlugin: (pluginId: string) => void;
  togglePlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => RegisteredPlugin | undefined;
  registerPlugin: (manifest: PluginManifest, instance: PluginInstance) => void;
}

// Create context
const PluginContext = createContext<PluginContextValue | null>(null);

// Provider props
interface PluginProviderProps {
  children: React.ReactNode;
}

/**
 * Plugin Provider Component
 */
export function PluginProvider({ children }: PluginProviderProps): JSX.Element {
  const [plugins, setPlugins] = useState<RegisteredPlugin[]>([]);
  const [enabledPlugins, setEnabledPlugins] = useState<RegisteredPlugin[]>([]);
  const storePlugins = usePlugins();

  // Sync state from registry
  const syncFromRegistry = useCallback(() => {
    setPlugins(pluginRegistry.getAll());
    setEnabledPlugins(pluginRegistry.getEnabled());
  }, []);

  // Subscribe to registry events
  useEffect(() => {
    const unsubRegister = pluginRegistry.on('register', syncFromRegistry);
    const unsubEnable = pluginRegistry.on('enable', syncFromRegistry);
    const unsubDisable = pluginRegistry.on('disable', syncFromRegistry);
    const unsubUnregister = pluginRegistry.on('unregister', syncFromRegistry);

    // Initial sync
    syncFromRegistry();

    return () => {
      unsubRegister();
      unsubEnable();
      unsubDisable();
      unsubUnregister();
    };
  }, [syncFromRegistry]);

  // Check if plugin is enabled
  const isPluginEnabled = useCallback((pluginId: string): boolean => {
    return pluginRegistry.isEnabled(pluginId);
  }, []);

  // Enable plugin
  const enablePlugin = useCallback(
    (pluginId: string): void => {
      if (pluginRegistry.enable(pluginId)) {
        storePlugins.enablePlugin(pluginId);
        syncFromRegistry();
      }
    },
    [storePlugins, syncFromRegistry]
  );

  // Disable plugin
  const disablePlugin = useCallback(
    (pluginId: string): void => {
      if (pluginRegistry.disable(pluginId)) {
        storePlugins.disablePlugin(pluginId);
        syncFromRegistry();
      }
    },
    [storePlugins, syncFromRegistry]
  );

  // Toggle plugin
  const togglePlugin = useCallback(
    (pluginId: string): void => {
      if (pluginRegistry.isEnabled(pluginId)) {
        disablePlugin(pluginId);
      } else {
        enablePlugin(pluginId);
      }
    },
    [enablePlugin, disablePlugin]
  );

  // Get plugin by ID
  const getPlugin = useCallback((pluginId: string): RegisteredPlugin | undefined => {
    return pluginRegistry.get(pluginId);
  }, []);

  // Register plugin
  const registerPlugin = useCallback(
    (manifest: PluginManifest, instance: PluginInstance): void => {
      pluginRegistry.register(manifest, instance);
      syncFromRegistry();
    },
    [syncFromRegistry]
  );

  const value: PluginContextValue = {
    plugins,
    enabledPlugins,
    isPluginEnabled,
    enablePlugin,
    disablePlugin,
    togglePlugin,
    getPlugin,
    registerPlugin,
  };

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}

/**
 * Hook to access plugin context
 */
export function usePluginContext(): PluginContextValue {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePluginContext must be used within a PluginProvider');
  }
  return context;
}

/**
 * Hook to get a specific plugin
 */
export function usePlugin(pluginId: string): RegisteredPlugin | undefined {
  const { getPlugin } = usePluginContext();
  return getPlugin(pluginId);
}

/**
 * Hook to check if a plugin is enabled
 */
export function useIsPluginEnabled(pluginId: string): boolean {
  const { isPluginEnabled } = usePluginContext();
  return isPluginEnabled(pluginId);
}

export default PluginProvider;
