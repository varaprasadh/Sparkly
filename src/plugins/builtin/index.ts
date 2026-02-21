/**
 * Built-in Plugins Index
 */

// Hacker News Plugin
export { hackerNewsManifest, hackerNewsInstance, HackerNewsPlugin } from './hackernews';

// GitHub Trending Plugin
export { githubManifest, githubInstance, GitHubPlugin } from './github';

// Dev.to Plugin
export { devtoManifest, devtoInstance, DevToPlugin } from './devto';

// All built-in plugins for registration
import { hackerNewsManifest, hackerNewsInstance } from './hackernews';
import { githubManifest, githubInstance } from './github';
import { devtoManifest, devtoInstance } from './devto';
import { PluginManifest, PluginInstance } from '../../types/plugin.types';

export interface BuiltinPlugin {
  manifest: PluginManifest;
  instance: PluginInstance;
}

export const BUILTIN_PLUGINS: BuiltinPlugin[] = [
  { manifest: hackerNewsManifest, instance: hackerNewsInstance },
  { manifest: githubManifest, instance: githubInstance },
  { manifest: devtoManifest, instance: devtoInstance },
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
