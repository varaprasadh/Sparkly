/// <reference types="chrome"/>
import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Action types
export const ActionTypes = {
  SET_BACKGROUND: 'SET_BACKGROUND',
  SET_WALLPAPER_CONFIG: 'SET_WALLPAPER_CONFIG',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
} as const;

// Action interfaces
interface SetBackgroundAction {
  type: typeof ActionTypes.SET_BACKGROUND;
  payload: {
    type: string;
    key: string;
  };
}

interface SetWallpaperConfigAction {
  type: typeof ActionTypes.SET_WALLPAPER_CONFIG;
  payload: {
    configType: 'random' | 'custom' | 'history';
  };
}

interface SetLoadingAction {
  type: typeof ActionTypes.SET_LOADING;
  payload: boolean;
}

interface SetErrorAction {
  type: typeof ActionTypes.SET_ERROR;
  payload: string | null;
}

export type AppAction =
  | SetBackgroundAction
  | SetWallpaperConfigAction
  | SetLoadingAction
  | SetErrorAction;

// State interface
export interface AppState {
  appBackground: {
    type: string;
    key: string;
  } | null;
  wallpaperConfigType: 'random' | 'custom' | 'history';
  isLoading: boolean;
  error: string | null;
}

// Initial state
export const initialState: AppState = {
  appBackground: null,
  wallpaperConfigType: 'random',
  isLoading: false,
  error: null,
};

// Reducer
export const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ActionTypes.SET_BACKGROUND: {
      const { type, key } = action.payload;
      const appBackground = { type, key };
      // Persist to sync storage
      chrome.storage.sync.set({ appBackground });
      return {
        ...state,
        appBackground,
      };
    }
    case ActionTypes.SET_WALLPAPER_CONFIG: {
      const { configType } = action.payload;
      chrome.storage.local.set({ wallpaperConfigType: configType });
      return {
        ...state,
        wallpaperConfigType: configType,
      };
    }
    case ActionTypes.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    case ActionTypes.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
      };
    }
    default:
      return state;
  }
};

// Context type
type AppContextType = [AppState, Dispatch<AppAction>];

// Create context with proper default
export const AppContext = createContext<AppContextType>([initialState, () => {}]);

// Provider props
interface AppProviderProps {
  children: ReactNode;
}

// Provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Action creators
export const actions = {
  setBackground: (type: string, key: string): SetBackgroundAction => ({
    type: ActionTypes.SET_BACKGROUND,
    payload: { type, key },
  }),
  setWallpaperConfig: (configType: 'random' | 'custom' | 'history'): SetWallpaperConfigAction => ({
    type: ActionTypes.SET_WALLPAPER_CONFIG,
    payload: { configType },
  }),
  setLoading: (isLoading: boolean): SetLoadingAction => ({
    type: ActionTypes.SET_LOADING,
    payload: isLoading,
  }),
  setError: (error: string | null): SetErrorAction => ({
    type: ActionTypes.SET_ERROR,
    payload: error,
  }),
};
