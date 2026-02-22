/**
 * Plugins Barrel Export
 */

// Registry
export { pluginRegistry, PluginRegistry } from './PluginRegistry';
export type { RegisteredPlugin } from './PluginRegistry';

// Context and Provider
export {
  PluginProvider,
  usePluginContext,
  usePlugin,
  useIsPluginEnabled,
} from './PluginContext';

// Plugin API
export { createPluginAPI } from './core/PluginAPI';
export type {
  PluginAPI,
  PluginStorageAPI,
} from './core/PluginAPI';
