/**
 * Built-in Plugins Index
 */

// Feed Hub (replaces individual HN, GitHub, DevTo plugins)
export { feedHubManifest, feedHubInstance, FeedHubPlugin } from './feedhub';

// Google Workspace
export { googleWorkspaceManifest, googleWorkspaceInstance, GoogleWorkspacePlugin } from './googleworkspace';

// All built-in plugins for registration
import { feedHubManifest, feedHubInstance } from './feedhub';
import { googleWorkspaceManifest, googleWorkspaceInstance } from './googleworkspace';
import { PluginManifest, PluginInstance } from '../../types/plugin.types';

export interface BuiltinPlugin {
  manifest: PluginManifest;
  instance: PluginInstance;
}

export const BUILTIN_PLUGINS: BuiltinPlugin[] = [
  { manifest: feedHubManifest, instance: feedHubInstance },
  { manifest: googleWorkspaceManifest, instance: googleWorkspaceInstance },
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
