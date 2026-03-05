/**
 * Root Reducer for Sparkly Store
 */

import { AppAction, ActionTypes } from './actions';
import { WidgetZone, WidgetPlacement } from '../types/widget.types';
import {
  GeneralSettings,
  WallpaperSettings,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_WALLPAPER_SETTINGS,
} from '../types/settings.types';

// Plugin State
export interface PluginInfo {
  id: string;
  name: string;
  enabled: boolean;
  error: string | null;
}

// Zone State
export interface ZoneState {
  collapsed: boolean;
  width?: number;
}

// App State Interface
export interface AppState {
  // Initialization
  initialized: boolean;

  // Settings
  settings: {
    general: GeneralSettings;
    wallpaper: WallpaperSettings;
  };

  // Plugins
  plugins: {
    registered: Record<string, PluginInfo>;
    enabledIds: string[];
    settings: Record<string, Record<string, unknown>>;
  };

  // Widgets
  widgets: {
    placements: WidgetPlacement[];
    zones: Record<WidgetZone, ZoneState>;
  };

  // UI
  ui: {
    settingsOpen: boolean;
    activeSettingsTab: string;
    loading: Record<string, boolean>;
    errors: Record<string, string>;
    openApps: Array<{ pluginId: string; isMinimized: boolean; zIndex: number }>;
  };
}

// Initial State
export const initialState: AppState = {
  initialized: false,

  settings: {
    general: DEFAULT_GENERAL_SETTINGS,
    wallpaper: DEFAULT_WALLPAPER_SETTINGS,
  },

  plugins: {
    registered: {},
    enabledIds: [],
    settings: {},
  },

  widgets: {
    placements: [],
    zones: {
      'left-sidebar': { collapsed: false },
      'top-bar': { collapsed: false },
      'center': { collapsed: false },
      'right-sidebar': { collapsed: false },
      'floating': { collapsed: false },
    },
  },

  ui: {
    settingsOpen: false,
    activeSettingsTab: 'general',
    loading: {},
    errors: {},
    openApps: [],
  },
};

// Helper function to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Root Reducer
export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Settings Reducers
    case ActionTypes.SET_GENERAL_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          general: action.payload,
        },
      };

    case ActionTypes.SET_WALLPAPER_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          wallpaper: action.payload,
        },
      };

    case ActionTypes.UPDATE_GENERAL_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          general: { ...state.settings.general, ...action.payload },
        },
      };

    case ActionTypes.UPDATE_WALLPAPER_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          wallpaper: { ...state.settings.wallpaper, ...action.payload },
        },
      };

    // Plugin Reducers
    case ActionTypes.REGISTER_PLUGIN:
      return {
        ...state,
        plugins: {
          ...state.plugins,
          registered: {
            ...state.plugins.registered,
            [action.payload.id]: {
              id: action.payload.id,
              name: action.payload.name,
              enabled: action.payload.enabled,
              error: null,
            },
          },
          enabledIds: action.payload.enabled
            ? [...state.plugins.enabledIds, action.payload.id]
            : state.plugins.enabledIds,
        },
      };

    case ActionTypes.ENABLE_PLUGIN: {
      const pluginId = action.payload;
      if (!state.plugins.registered[pluginId]) return state;
      if (state.plugins.enabledIds.includes(pluginId)) return state;

      return {
        ...state,
        plugins: {
          ...state.plugins,
          registered: {
            ...state.plugins.registered,
            [pluginId]: {
              ...state.plugins.registered[pluginId],
              enabled: true,
            },
          },
          enabledIds: [...state.plugins.enabledIds, pluginId],
        },
      };
    }

    case ActionTypes.DISABLE_PLUGIN: {
      const pluginId = action.payload;
      if (!state.plugins.registered[pluginId]) return state;

      return {
        ...state,
        plugins: {
          ...state.plugins,
          registered: {
            ...state.plugins.registered,
            [pluginId]: {
              ...state.plugins.registered[pluginId],
              enabled: false,
            },
          },
          enabledIds: state.plugins.enabledIds.filter((id) => id !== pluginId),
        },
      };
    }

    case ActionTypes.UPDATE_PLUGIN_SETTINGS:
      return {
        ...state,
        plugins: {
          ...state.plugins,
          settings: {
            ...state.plugins.settings,
            [action.payload.pluginId]: {
              ...state.plugins.settings[action.payload.pluginId],
              ...action.payload.settings,
            },
          },
        },
      };

    case ActionTypes.SET_PLUGIN_ERROR:
      return {
        ...state,
        plugins: {
          ...state.plugins,
          registered: {
            ...state.plugins.registered,
            [action.payload.pluginId]: {
              ...state.plugins.registered[action.payload.pluginId],
              error: action.payload.error,
            },
          },
        },
      };

    // Widget Reducers
    case ActionTypes.SET_WIDGET_PLACEMENTS:
      return {
        ...state,
        widgets: {
          ...state.widgets,
          placements: action.payload,
        },
      };

    case ActionTypes.ADD_WIDGET: {
      const { pluginId, zone } = action.payload;
      const existingPlacements = state.widgets.placements.filter(
        (p) => p.zone === zone
      );
      const newPlacement: WidgetPlacement = {
        id: generateId(),
        pluginId,
        zone,
        order: existingPlacements.length,
        isVisible: true,
        isMinimized: false,
        size: 'medium',
      };

      return {
        ...state,
        widgets: {
          ...state.widgets,
          placements: [...state.widgets.placements, newPlacement],
        },
      };
    }

    case ActionTypes.REMOVE_WIDGET:
      return {
        ...state,
        widgets: {
          ...state.widgets,
          placements: state.widgets.placements.filter(
            (p) => p.id !== action.payload
          ),
        },
      };

    case ActionTypes.MOVE_WIDGET: {
      const { placementId, targetZone } = action.payload;
      const targetPlacements = state.widgets.placements.filter(
        (p) => p.zone === targetZone
      );

      return {
        ...state,
        widgets: {
          ...state.widgets,
          placements: state.widgets.placements.map((p) =>
            p.id === placementId
              ? { ...p, zone: targetZone, order: targetPlacements.length }
              : p
          ),
        },
      };
    }

    case ActionTypes.REORDER_WIDGETS: {
      const { zone, startIndex, endIndex } = action.payload;
      const zonePlacements = state.widgets.placements
        .filter((p) => p.zone === zone)
        .sort((a, b) => a.order - b.order);

      const [removed] = zonePlacements.splice(startIndex, 1);
      zonePlacements.splice(endIndex, 0, removed);

      const reorderedPlacements = zonePlacements.map((p, index) => ({
        ...p,
        order: index,
      }));

      const otherPlacements = state.widgets.placements.filter(
        (p) => p.zone !== zone
      );

      return {
        ...state,
        widgets: {
          ...state.widgets,
          placements: [...otherPlacements, ...reorderedPlacements],
        },
      };
    }

    case ActionTypes.TOGGLE_WIDGET_MINIMIZED:
      return {
        ...state,
        widgets: {
          ...state.widgets,
          placements: state.widgets.placements.map((p) =>
            p.id === action.payload ? { ...p, isMinimized: !p.isMinimized } : p
          ),
        },
      };

    case ActionTypes.SET_ZONE_COLLAPSED:
      return {
        ...state,
        widgets: {
          ...state.widgets,
          zones: {
            ...state.widgets.zones,
            [action.payload.zone]: {
              ...state.widgets.zones[action.payload.zone],
              collapsed: action.payload.collapsed,
            },
          },
        },
      };

    // UI Reducers
    case ActionTypes.SET_SETTINGS_OPEN:
      return {
        ...state,
        ui: {
          ...state.ui,
          settingsOpen: action.payload,
        },
      };

    case ActionTypes.SET_ACTIVE_SETTINGS_TAB:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeSettingsTab: action.payload,
        },
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui.loading,
            [action.payload.key]: action.payload.loading,
          },
        },
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: {
            ...state.ui.errors,
            [action.payload.key]: action.payload.error,
          },
        },
      };

    case ActionTypes.CLEAR_ERROR: {
      const { [action.payload]: _, ...remainingErrors } = state.ui.errors;
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: remainingErrors,
        },
      };
    }

    // OS-like App Reducers
    case ActionTypes.OPEN_APP: {
      const pluginId = action.payload;
      const existing = state.ui.openApps.find((a) => a.pluginId === pluginId);
      if (existing) {
        // If already open, just restore if minimized and bring to front
        const maxZ = Math.max(...state.ui.openApps.map((a) => a.zIndex), 0);
        return {
          ...state,
          ui: {
            ...state.ui,
            openApps: state.ui.openApps.map((a) =>
              a.pluginId === pluginId
                ? { ...a, isMinimized: false, zIndex: maxZ + 1 }
                : a
            ),
          },
        };
      }
      // Open new app
      const maxZ = Math.max(...state.ui.openApps.map((a) => a.zIndex), 0);
      return {
        ...state,
        ui: {
          ...state.ui,
          openApps: [
            ...state.ui.openApps,
            { pluginId, isMinimized: false, zIndex: maxZ + 1 },
          ],
        },
      };
    }

    case ActionTypes.CLOSE_APP:
      return {
        ...state,
        ui: {
          ...state.ui,
          openApps: state.ui.openApps.filter((a) => a.pluginId !== action.payload),
        },
      };

    case ActionTypes.MINIMIZE_APP:
      return {
        ...state,
        ui: {
          ...state.ui,
          openApps: state.ui.openApps.map((a) =>
            a.pluginId === action.payload ? { ...a, isMinimized: true } : a
          ),
        },
      };

    case ActionTypes.RESTORE_APP: {
      const maxZ = Math.max(...state.ui.openApps.map((a) => a.zIndex), 0);
      return {
        ...state,
        ui: {
          ...state.ui,
          openApps: state.ui.openApps.map((a) =>
            a.pluginId === action.payload
              ? { ...a, isMinimized: false, zIndex: maxZ + 1 }
              : a
          ),
        },
      };
    }

    case ActionTypes.SET_OPEN_APPS:
      return {
        ...state,
        ui: {
          ...state.ui,
          openApps: action.payload,
        },
      };

    // App State Reducers
    case ActionTypes.SET_INITIALIZED:
      return {
        ...state,
        initialized: action.payload,
      };

    default:
      return state;
  }
}
