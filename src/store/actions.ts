/**
 * Action Types and Creators for Sparkly Store
 */

import { WidgetZone, WidgetPlacement } from '../types/widget.types';
import {
  GeneralSettings,
  WallpaperSettings,
} from '../types/settings.types';

// Action Type Constants
export const ActionTypes = {
  // Settings Actions
  SET_GENERAL_SETTINGS: 'settings/SET_GENERAL',
  SET_WALLPAPER_SETTINGS: 'settings/SET_WALLPAPER',
  UPDATE_GENERAL_SETTINGS: 'settings/UPDATE_GENERAL',
  UPDATE_WALLPAPER_SETTINGS: 'settings/UPDATE_WALLPAPER',

  // Plugin Actions
  REGISTER_PLUGIN: 'plugins/REGISTER',
  ENABLE_PLUGIN: 'plugins/ENABLE',
  DISABLE_PLUGIN: 'plugins/DISABLE',
  UPDATE_PLUGIN_SETTINGS: 'plugins/UPDATE_SETTINGS',
  SET_PLUGIN_ERROR: 'plugins/SET_ERROR',

  // Widget Actions
  SET_WIDGET_PLACEMENTS: 'widgets/SET_PLACEMENTS',
  ADD_WIDGET: 'widgets/ADD',
  REMOVE_WIDGET: 'widgets/REMOVE',
  MOVE_WIDGET: 'widgets/MOVE',
  REORDER_WIDGETS: 'widgets/REORDER',
  TOGGLE_WIDGET_MINIMIZED: 'widgets/TOGGLE_MINIMIZED',
  SET_ZONE_COLLAPSED: 'widgets/SET_ZONE_COLLAPSED',

  // UI Actions
  SET_SETTINGS_OPEN: 'ui/SET_SETTINGS_OPEN',
  SET_ACTIVE_SETTINGS_TAB: 'ui/SET_ACTIVE_TAB',
  SET_LOADING: 'ui/SET_LOADING',
  SET_ERROR: 'ui/SET_ERROR',
  CLEAR_ERROR: 'ui/CLEAR_ERROR',

  // App Actions (OS-like apps)
  OPEN_APP: 'apps/OPEN',
  CLOSE_APP: 'apps/CLOSE',
  MINIMIZE_APP: 'apps/MINIMIZE',
  RESTORE_APP: 'apps/RESTORE',
  SET_OPEN_APPS: 'apps/SET_OPEN',

  // App State Actions
  INITIALIZE_APP: 'app/INITIALIZE',
  SET_INITIALIZED: 'app/SET_INITIALIZED',
} as const;

// Action Interfaces

// Settings Actions
export interface SetGeneralSettingsAction {
  type: typeof ActionTypes.SET_GENERAL_SETTINGS;
  payload: GeneralSettings;
}

export interface SetWallpaperSettingsAction {
  type: typeof ActionTypes.SET_WALLPAPER_SETTINGS;
  payload: WallpaperSettings;
}

export interface UpdateGeneralSettingsAction {
  type: typeof ActionTypes.UPDATE_GENERAL_SETTINGS;
  payload: Partial<GeneralSettings>;
}

export interface UpdateWallpaperSettingsAction {
  type: typeof ActionTypes.UPDATE_WALLPAPER_SETTINGS;
  payload: Partial<WallpaperSettings>;
}

// Plugin Actions
export interface RegisterPluginAction {
  type: typeof ActionTypes.REGISTER_PLUGIN;
  payload: {
    id: string;
    name: string;
    enabled: boolean;
  };
}

export interface EnablePluginAction {
  type: typeof ActionTypes.ENABLE_PLUGIN;
  payload: string;
}

export interface DisablePluginAction {
  type: typeof ActionTypes.DISABLE_PLUGIN;
  payload: string;
}

export interface UpdatePluginSettingsAction {
  type: typeof ActionTypes.UPDATE_PLUGIN_SETTINGS;
  payload: {
    pluginId: string;
    settings: Record<string, unknown>;
  };
}

export interface SetPluginErrorAction {
  type: typeof ActionTypes.SET_PLUGIN_ERROR;
  payload: {
    pluginId: string;
    error: string | null;
  };
}

// Widget Actions
export interface SetWidgetPlacementsAction {
  type: typeof ActionTypes.SET_WIDGET_PLACEMENTS;
  payload: WidgetPlacement[];
}

export interface AddWidgetAction {
  type: typeof ActionTypes.ADD_WIDGET;
  payload: {
    pluginId: string;
    zone: WidgetZone;
  };
}

export interface RemoveWidgetAction {
  type: typeof ActionTypes.REMOVE_WIDGET;
  payload: string; // placementId
}

export interface MoveWidgetAction {
  type: typeof ActionTypes.MOVE_WIDGET;
  payload: {
    placementId: string;
    targetZone: WidgetZone;
  };
}

export interface ReorderWidgetsAction {
  type: typeof ActionTypes.REORDER_WIDGETS;
  payload: {
    zone: WidgetZone;
    startIndex: number;
    endIndex: number;
  };
}

export interface ToggleWidgetMinimizedAction {
  type: typeof ActionTypes.TOGGLE_WIDGET_MINIMIZED;
  payload: string; // placementId
}

export interface SetZoneCollapsedAction {
  type: typeof ActionTypes.SET_ZONE_COLLAPSED;
  payload: {
    zone: WidgetZone;
    collapsed: boolean;
  };
}

// UI Actions
export interface SetSettingsOpenAction {
  type: typeof ActionTypes.SET_SETTINGS_OPEN;
  payload: boolean;
}

export interface SetActiveSettingsTabAction {
  type: typeof ActionTypes.SET_ACTIVE_SETTINGS_TAB;
  payload: string;
}

export interface SetLoadingAction {
  type: typeof ActionTypes.SET_LOADING;
  payload: {
    key: string;
    loading: boolean;
  };
}

export interface SetErrorAction {
  type: typeof ActionTypes.SET_ERROR;
  payload: {
    key: string;
    error: string;
  };
}

export interface ClearErrorAction {
  type: typeof ActionTypes.CLEAR_ERROR;
  payload: string; // key
}

// OS-like App Actions
export interface OpenAppState {
  pluginId: string;
  isMinimized: boolean;
  zIndex: number;
}

export interface OpenAppAction {
  type: typeof ActionTypes.OPEN_APP;
  payload: string; // pluginId
}

export interface CloseAppAction {
  type: typeof ActionTypes.CLOSE_APP;
  payload: string; // pluginId
}

export interface MinimizeAppAction {
  type: typeof ActionTypes.MINIMIZE_APP;
  payload: string; // pluginId
}

export interface RestoreAppAction {
  type: typeof ActionTypes.RESTORE_APP;
  payload: string; // pluginId
}

export interface SetOpenAppsAction {
  type: typeof ActionTypes.SET_OPEN_APPS;
  payload: OpenAppState[];
}

// App State Actions
export interface InitializeAppAction {
  type: typeof ActionTypes.INITIALIZE_APP;
}

export interface SetInitializedAction {
  type: typeof ActionTypes.SET_INITIALIZED;
  payload: boolean;
}

// Union Type
export type AppAction =
  | SetGeneralSettingsAction
  | SetWallpaperSettingsAction
  | UpdateGeneralSettingsAction
  | UpdateWallpaperSettingsAction
  | RegisterPluginAction
  | EnablePluginAction
  | DisablePluginAction
  | UpdatePluginSettingsAction
  | SetPluginErrorAction
  | SetWidgetPlacementsAction
  | AddWidgetAction
  | RemoveWidgetAction
  | MoveWidgetAction
  | ReorderWidgetsAction
  | ToggleWidgetMinimizedAction
  | SetZoneCollapsedAction
  | SetSettingsOpenAction
  | SetActiveSettingsTabAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | OpenAppAction
  | CloseAppAction
  | MinimizeAppAction
  | RestoreAppAction
  | SetOpenAppsAction
  | InitializeAppAction
  | SetInitializedAction;

// Action Creators
export const actions = {
  // Settings
  setGeneralSettings: (settings: GeneralSettings): SetGeneralSettingsAction => ({
    type: ActionTypes.SET_GENERAL_SETTINGS,
    payload: settings,
  }),

  setWallpaperSettings: (settings: WallpaperSettings): SetWallpaperSettingsAction => ({
    type: ActionTypes.SET_WALLPAPER_SETTINGS,
    payload: settings,
  }),

  updateGeneralSettings: (updates: Partial<GeneralSettings>): UpdateGeneralSettingsAction => ({
    type: ActionTypes.UPDATE_GENERAL_SETTINGS,
    payload: updates,
  }),

  updateWallpaperSettings: (updates: Partial<WallpaperSettings>): UpdateWallpaperSettingsAction => ({
    type: ActionTypes.UPDATE_WALLPAPER_SETTINGS,
    payload: updates,
  }),

  // Plugins
  registerPlugin: (id: string, name: string, enabled = true): RegisterPluginAction => ({
    type: ActionTypes.REGISTER_PLUGIN,
    payload: { id, name, enabled },
  }),

  enablePlugin: (pluginId: string): EnablePluginAction => ({
    type: ActionTypes.ENABLE_PLUGIN,
    payload: pluginId,
  }),

  disablePlugin: (pluginId: string): DisablePluginAction => ({
    type: ActionTypes.DISABLE_PLUGIN,
    payload: pluginId,
  }),

  updatePluginSettings: (
    pluginId: string,
    settings: Record<string, unknown>
  ): UpdatePluginSettingsAction => ({
    type: ActionTypes.UPDATE_PLUGIN_SETTINGS,
    payload: { pluginId, settings },
  }),

  setPluginError: (pluginId: string, error: string | null): SetPluginErrorAction => ({
    type: ActionTypes.SET_PLUGIN_ERROR,
    payload: { pluginId, error },
  }),

  // Widgets
  setWidgetPlacements: (placements: WidgetPlacement[]): SetWidgetPlacementsAction => ({
    type: ActionTypes.SET_WIDGET_PLACEMENTS,
    payload: placements,
  }),

  addWidget: (pluginId: string, zone: WidgetZone): AddWidgetAction => ({
    type: ActionTypes.ADD_WIDGET,
    payload: { pluginId, zone },
  }),

  removeWidget: (placementId: string): RemoveWidgetAction => ({
    type: ActionTypes.REMOVE_WIDGET,
    payload: placementId,
  }),

  moveWidget: (placementId: string, targetZone: WidgetZone): MoveWidgetAction => ({
    type: ActionTypes.MOVE_WIDGET,
    payload: { placementId, targetZone },
  }),

  reorderWidgets: (
    zone: WidgetZone,
    startIndex: number,
    endIndex: number
  ): ReorderWidgetsAction => ({
    type: ActionTypes.REORDER_WIDGETS,
    payload: { zone, startIndex, endIndex },
  }),

  toggleWidgetMinimized: (placementId: string): ToggleWidgetMinimizedAction => ({
    type: ActionTypes.TOGGLE_WIDGET_MINIMIZED,
    payload: placementId,
  }),

  setZoneCollapsed: (zone: WidgetZone, collapsed: boolean): SetZoneCollapsedAction => ({
    type: ActionTypes.SET_ZONE_COLLAPSED,
    payload: { zone, collapsed },
  }),

  // UI
  setSettingsOpen: (open: boolean): SetSettingsOpenAction => ({
    type: ActionTypes.SET_SETTINGS_OPEN,
    payload: open,
  }),

  setActiveSettingsTab: (tab: string): SetActiveSettingsTabAction => ({
    type: ActionTypes.SET_ACTIVE_SETTINGS_TAB,
    payload: tab,
  }),

  setLoading: (key: string, loading: boolean): SetLoadingAction => ({
    type: ActionTypes.SET_LOADING,
    payload: { key, loading },
  }),

  setError: (key: string, error: string): SetErrorAction => ({
    type: ActionTypes.SET_ERROR,
    payload: { key, error },
  }),

  clearError: (key: string): ClearErrorAction => ({
    type: ActionTypes.CLEAR_ERROR,
    payload: key,
  }),

  // OS-like Apps
  openApp: (pluginId: string): OpenAppAction => ({
    type: ActionTypes.OPEN_APP,
    payload: pluginId,
  }),

  closeApp: (pluginId: string): CloseAppAction => ({
    type: ActionTypes.CLOSE_APP,
    payload: pluginId,
  }),

  minimizeApp: (pluginId: string): MinimizeAppAction => ({
    type: ActionTypes.MINIMIZE_APP,
    payload: pluginId,
  }),

  restoreApp: (pluginId: string): RestoreAppAction => ({
    type: ActionTypes.RESTORE_APP,
    payload: pluginId,
  }),

  setOpenApps: (apps: OpenAppState[]): SetOpenAppsAction => ({
    type: ActionTypes.SET_OPEN_APPS,
    payload: apps,
  }),

  // App State
  initializeApp: (): InitializeAppAction => ({
    type: ActionTypes.INITIALIZE_APP,
  }),

  setInitialized: (initialized: boolean): SetInitializedAction => ({
    type: ActionTypes.SET_INITIALIZED,
    payload: initialized,
  }),
};
