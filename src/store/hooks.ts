/**
 * Custom Hooks for Sparkly Store
 */

import { useContext, useCallback, useMemo } from 'react';
import { AppContext } from './AppContext';
import { AppState } from './reducer';
import { AppAction, actions } from './actions';
import { WidgetZone } from '../types/widget.types';

// Main hook to access store
export function useStore(): [AppState, React.Dispatch<AppAction>] {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
}

// Hook for accessing state only
export function useAppState(): AppState {
  const [state] = useStore();
  return state;
}

// Hook for accessing dispatch only
export function useAppDispatch(): React.Dispatch<AppAction> {
  const [, dispatch] = useStore();
  return dispatch;
}

// Settings Hooks
export function useSettings() {
  const [state, dispatch] = useStore();

  return {
    general: state.settings.general,
    wallpaper: state.settings.wallpaper,
    appearance: state.settings.appearance,

    updateGeneral: useCallback(
      (updates: Partial<typeof state.settings.general>) => {
        dispatch(actions.updateGeneralSettings(updates));
      },
      [dispatch]
    ),

    updateWallpaper: useCallback(
      (updates: Partial<typeof state.settings.wallpaper>) => {
        dispatch(actions.updateWallpaperSettings(updates));
      },
      [dispatch]
    ),

    updateAppearance: useCallback(
      (updates: Partial<typeof state.settings.appearance>) => {
        dispatch(actions.updateAppearanceSettings(updates));
      },
      [dispatch]
    ),
  };
}

// Plugins Hooks
export function usePlugins() {
  const [state, dispatch] = useStore();

  const enabledPlugins = useMemo(
    () =>
      state.plugins.enabledIds
        .map((id) => state.plugins.registered[id])
        .filter(Boolean),
    [state.plugins.enabledIds, state.plugins.registered]
  );

  const allPlugins = useMemo(
    () => Object.values(state.plugins.registered),
    [state.plugins.registered]
  );

  return {
    plugins: allPlugins,
    enabledPlugins,
    pluginSettings: state.plugins.settings,

    isEnabled: useCallback(
      (pluginId: string) => state.plugins.enabledIds.includes(pluginId),
      [state.plugins.enabledIds]
    ),

    getPluginSettings: useCallback(
      (pluginId: string) => state.plugins.settings[pluginId] || {},
      [state.plugins.settings]
    ),

    enablePlugin: useCallback(
      (pluginId: string) => {
        dispatch(actions.enablePlugin(pluginId));
      },
      [dispatch]
    ),

    disablePlugin: useCallback(
      (pluginId: string) => {
        dispatch(actions.disablePlugin(pluginId));
      },
      [dispatch]
    ),

    togglePlugin: useCallback(
      (pluginId: string) => {
        if (state.plugins.enabledIds.includes(pluginId)) {
          dispatch(actions.disablePlugin(pluginId));
        } else {
          dispatch(actions.enablePlugin(pluginId));
        }
      },
      [dispatch, state.plugins.enabledIds]
    ),

    updatePluginSettings: useCallback(
      (pluginId: string, settings: Record<string, unknown>) => {
        dispatch(actions.updatePluginSettings(pluginId, settings));
      },
      [dispatch]
    ),
  };
}

// Widgets Hooks
export function useWidgets() {
  const [state, dispatch] = useStore();

  return {
    placements: state.widgets.placements,
    zones: state.widgets.zones,

    getZonePlacements: useCallback(
      (zone: WidgetZone) =>
        state.widgets.placements
          .filter((p) => p.zone === zone && p.isVisible)
          .sort((a, b) => a.order - b.order),
      [state.widgets.placements]
    ),

    isZoneCollapsed: useCallback(
      (zone: WidgetZone) => state.widgets.zones[zone]?.collapsed ?? false,
      [state.widgets.zones]
    ),

    addWidget: useCallback(
      (pluginId: string, zone: WidgetZone) => {
        dispatch(actions.addWidget(pluginId, zone));
      },
      [dispatch]
    ),

    removeWidget: useCallback(
      (placementId: string) => {
        dispatch(actions.removeWidget(placementId));
      },
      [dispatch]
    ),

    moveWidget: useCallback(
      (placementId: string, targetZone: WidgetZone) => {
        dispatch(actions.moveWidget(placementId, targetZone));
      },
      [dispatch]
    ),

    toggleZoneCollapsed: useCallback(
      (zone: WidgetZone) => {
        const currentState = state.widgets.zones[zone]?.collapsed ?? false;
        dispatch(actions.setZoneCollapsed(zone, !currentState));
      },
      [dispatch, state.widgets.zones]
    ),

    toggleWidgetMinimized: useCallback(
      (placementId: string) => {
        dispatch(actions.toggleWidgetMinimized(placementId));
      },
      [dispatch]
    ),
  };
}

// UI Hooks
export function useUI() {
  const [state, dispatch] = useStore();

  return {
    settingsOpen: state.ui.settingsOpen,
    activeSettingsTab: state.ui.activeSettingsTab,
    loading: state.ui.loading,
    errors: state.ui.errors,

    isLoading: useCallback(
      (key: string) => state.ui.loading[key] ?? false,
      [state.ui.loading]
    ),

    getError: useCallback(
      (key: string) => state.ui.errors[key] ?? null,
      [state.ui.errors]
    ),

    openSettings: useCallback(
      (tab?: string) => {
        if (tab) {
          dispatch(actions.setActiveSettingsTab(tab));
        }
        dispatch(actions.setSettingsOpen(true));
      },
      [dispatch]
    ),

    closeSettings: useCallback(() => {
      dispatch(actions.setSettingsOpen(false));
    }, [dispatch]),

    setActiveTab: useCallback(
      (tab: string) => {
        dispatch(actions.setActiveSettingsTab(tab));
      },
      [dispatch]
    ),

    setLoading: useCallback(
      (key: string, loading: boolean) => {
        dispatch(actions.setLoading(key, loading));
      },
      [dispatch]
    ),

    setError: useCallback(
      (key: string, error: string) => {
        dispatch(actions.setError(key, error));
      },
      [dispatch]
    ),

    clearError: useCallback(
      (key: string) => {
        dispatch(actions.clearError(key));
      },
      [dispatch]
    ),
  };
}

// OS-like Apps Hooks
export function useApps() {
  const [state, dispatch] = useStore();

  return {
    openApps: state.ui.openApps,

    isAppOpen: useCallback(
      (pluginId: string) => state.ui.openApps.some((a) => a.pluginId === pluginId),
      [state.ui.openApps]
    ),

    isAppMinimized: useCallback(
      (pluginId: string) => {
        const app = state.ui.openApps.find((a) => a.pluginId === pluginId);
        return app?.isMinimized ?? false;
      },
      [state.ui.openApps]
    ),

    getAppZIndex: useCallback(
      (pluginId: string) => {
        const app = state.ui.openApps.find((a) => a.pluginId === pluginId);
        return app?.zIndex ?? 0;
      },
      [state.ui.openApps]
    ),

    openApp: useCallback(
      (pluginId: string) => {
        dispatch(actions.openApp(pluginId));
      },
      [dispatch]
    ),

    closeApp: useCallback(
      (pluginId: string) => {
        dispatch(actions.closeApp(pluginId));
      },
      [dispatch]
    ),

    minimizeApp: useCallback(
      (pluginId: string) => {
        dispatch(actions.minimizeApp(pluginId));
      },
      [dispatch]
    ),

    restoreApp: useCallback(
      (pluginId: string) => {
        dispatch(actions.restoreApp(pluginId));
      },
      [dispatch]
    ),

    toggleApp: useCallback(
      (pluginId: string) => {
        const app = state.ui.openApps.find((a) => a.pluginId === pluginId);
        if (!app) {
          dispatch(actions.openApp(pluginId));
        } else if (app.isMinimized) {
          dispatch(actions.restoreApp(pluginId));
        } else {
          dispatch(actions.minimizeApp(pluginId));
        }
      },
      [dispatch, state.ui.openApps]
    ),
  };
}

// Initialization Hook
export function useInitialization() {
  const [state, dispatch] = useStore();

  return {
    initialized: state.initialized,

    setInitialized: useCallback(
      (value: boolean) => {
        dispatch(actions.setInitialized(value));
      },
      [dispatch]
    ),
  };
}
