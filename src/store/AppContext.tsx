/**
 * App Context Provider for Sparkly Store
 */

import React, { createContext, useReducer, useEffect } from 'react';
import { AppState, reducer, initialState } from './reducer';
import { AppAction, actions } from './actions';
import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_WALLPAPER_SETTINGS,
  DEFAULT_APPEARANCE_SETTINGS,
} from '../types/settings.types';

// Context type
type AppContextType = [AppState, React.Dispatch<AppAction>];

// Create context
export const AppContext = createContext<AppContextType | null>(null);

// Provider props
interface AppProviderProps {
  children: React.ReactNode;
}

// Simple storage helper functions
const saveToStorage = (key: string, value: unknown): void => {
  try {
    chrome.storage.local.set({ [key]: value });
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
};

const loadFromStorage = (key: string): Promise<unknown> => {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] ?? null);
      });
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      resolve(null);
    }
  });
};

/**
 * App Provider Component
 * Provides global state management with persistence
 */
export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load initial state from storage, migrating legacy keys if needed
  useEffect(() => {
    let mounted = true;

    const loadInitialState = async (): Promise<void> => {
      try {
        const [
          generalSettings,
          wallpaperSettings,
          appearanceSettings,
          enabledPlugins,
          widgetPlacements,
          pluginSettings,
          openApps,
          // Legacy keys for migration
          legacySearchEngine,
          legacyWallpaperConfig,
        ] = await Promise.all([
          loadFromStorage('sparkly_settings_general'),
          loadFromStorage('sparkly_settings_wallpaper'),
          loadFromStorage('sparkly_settings_appearance'),
          loadFromStorage('sparkly_plugins_enabled'),
          loadFromStorage('sparkly_widgets_placements'),
          loadFromStorage('sparkly_plugins_settings'),
          loadFromStorage('sparkly_open_apps'),
          // Load legacy keys for first-time migration
          loadFromStorage('searchEngineId'),
          loadFromStorage('wallpaperConfigType'),
        ]);

        if (!mounted) return;

        // Build general settings, migrating legacy searchEngineId if no new settings exist
        const mergedGeneral = {
          ...DEFAULT_GENERAL_SETTINGS,
          ...(generalSettings ? (generalSettings as object) : {}),
        };
        if (!generalSettings && legacySearchEngine) {
          mergedGeneral.searchEngine = legacySearchEngine as typeof mergedGeneral.searchEngine;
        }
        dispatch(actions.setGeneralSettings(mergedGeneral));

        // Build wallpaper settings, migrating legacy wallpaperConfigType
        const mergedWallpaper = {
          ...DEFAULT_WALLPAPER_SETTINGS,
          ...(wallpaperSettings ? (wallpaperSettings as object) : {}),
        };
        if (!wallpaperSettings && legacyWallpaperConfig) {
          mergedWallpaper.source = legacyWallpaperConfig as typeof mergedWallpaper.source;
        }
        dispatch(actions.setWallpaperSettings(mergedWallpaper));

        if (appearanceSettings) {
          dispatch(actions.setAppearanceSettings({
            ...DEFAULT_APPEARANCE_SETTINGS,
            ...(appearanceSettings as object)
          }));
        }

        // Load enabled plugins
        if (enabledPlugins && Array.isArray(enabledPlugins)) {
          enabledPlugins.forEach((pluginId: string) => {
            dispatch(actions.enablePlugin(pluginId));
          });
        }

        // Load widget placements
        if (widgetPlacements && Array.isArray(widgetPlacements)) {
          dispatch(actions.setWidgetPlacements(widgetPlacements));
        }

        // Load plugin settings
        if (pluginSettings && typeof pluginSettings === 'object') {
          Object.entries(pluginSettings as Record<string, Record<string, unknown>>).forEach(([pluginId, settings]) => {
            dispatch(actions.updatePluginSettings(pluginId, settings));
          });
        }

        // Load open apps
        if (openApps && Array.isArray(openApps)) {
          dispatch(actions.setOpenApps(openApps));
        }

        dispatch(actions.setInitialized(true));
      } catch (error) {
        console.error('Failed to load initial state:', error);
        dispatch(actions.setInitialized(true));
      }
    };

    loadInitialState();

    return () => {
      mounted = false;
    };
  }, []);

  // Persist settings changes to storage + sync legacy keys
  useEffect(() => {
    if (!state.initialized) return;

    saveToStorage('sparkly_settings_general', state.settings.general);
    saveToStorage('sparkly_settings_wallpaper', state.settings.wallpaper);
    saveToStorage('sparkly_settings_appearance', state.settings.appearance);

    // Sync legacy keys so older components/boot logic can read them
    saveToStorage('searchEngineId', state.settings.general.searchEngine);
    saveToStorage('wallpaperConfigType', state.settings.wallpaper.source);
  }, [state.initialized, state.settings]);

  // Persist plugin state changes
  useEffect(() => {
    if (!state.initialized) return;

    saveToStorage('sparkly_plugins_enabled', state.plugins.enabledIds);
    saveToStorage('sparkly_plugins_settings', state.plugins.settings);
  }, [state.initialized, state.plugins.enabledIds, state.plugins.settings]);

  // Persist widget placements
  useEffect(() => {
    if (!state.initialized) return;

    saveToStorage('sparkly_widgets_placements', state.widgets.placements);
  }, [state.initialized, state.widgets.placements]);

  // Persist open apps state
  useEffect(() => {
    if (!state.initialized) return;

    saveToStorage('sparkly_open_apps', state.ui.openApps);
  }, [state.initialized, state.ui.openApps]);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
