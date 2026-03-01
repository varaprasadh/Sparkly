/**
 * Plugin system type definitions
 */

import { WidgetZone } from './widget.types';
import { PluginAPI } from '../plugins/core/PluginAPI';

// Plugin permission types
export type PluginPermission = 'storage';

// Plugin status
export type PluginStatus = 'registered' | 'enabled' | 'disabled' | 'error';

// Plugin category
export type PluginCategory = 'productivity' | 'utility' | 'entertainment' | 'social' | 'other';

// Plugin settings field types
export type PluginSettingFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'range';

// Plugin settings field definition
export interface PluginSettingField {
  type: PluginSettingFieldType;
  label: string;
  description?: string;
  default: unknown;
  options?: Array<{ label: string; value: unknown }>;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

// Plugin settings schema
export interface PluginSettingsSchema {
  [key: string]: PluginSettingField;
}

// Plugin manifest - describes a plugin
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  author?: string;
  category?: PluginCategory;
  defaultZone: WidgetZone;
  permissions?: PluginPermission[];
  settingsSchema?: PluginSettingsSchema;
  defaultSettings?: Record<string, unknown>;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
}

// Props passed to plugin components
export interface PluginProps {
  api: PluginAPI;
  isActive?: boolean;
  isMinimized?: boolean;
  zone?: WidgetZone;
  settings?: Record<string, unknown>;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

// Plugin component type
export type PluginComponent = React.ComponentType<PluginProps>;

// Plugin instance - runtime representation (simplified)
export interface PluginInstance {
  Component: PluginComponent;
  onEnable?: (api: PluginAPI) => void | Promise<void>;
  onDisable?: (api: PluginAPI) => void | Promise<void>;
  onSettingsChange?: (api: PluginAPI, settings: Record<string, unknown>) => void;
}

// Plugin state in store
export interface PluginState {
  id: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  zone: WidgetZone;
  order: number;
  isMinimized: boolean;
  lastError?: string;
}

// Plugin event types
export type PluginEventType =
  | 'plugin:registered'
  | 'plugin:enabled'
  | 'plugin:disabled'
  | 'plugin:error'
  | 'plugin:settings-changed';

export interface PluginEvent {
  type: PluginEventType;
  pluginId: string;
  timestamp: number;
  data?: unknown;
}
