/**
 * Built-in Plugins Index
 */

// Feed Hub (replaces individual HN, GitHub, DevTo plugins)
export { feedHubManifest, feedHubInstance, FeedHubPlugin } from './feedhub';

// All built-in plugins for registration
import { feedHubManifest, feedHubInstance } from './feedhub';
import { PluginManifest, PluginInstance } from '../../types/plugin.types';

export interface BuiltinPlugin {
  manifest: PluginManifest;
  instance: PluginInstance;
}

export const BUILTIN_PLUGINS: BuiltinPlugin[] = [
  { manifest: feedHubManifest, instance: feedHubInstance },
];

/**
 * Register all built-in plugins with the registry
 */
export function registerBuiltinPlugins(
  registry: { register: (manifest: PluginManifest, instance: PluginInstance) => void }
): void {
  BUILTIN_PLUGINS.forEach(({ manifest, instance }) => {
    registry.register(manifest, instance);
  });
}
