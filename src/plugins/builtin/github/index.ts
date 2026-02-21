/**
 * GitHub Trending Plugin Entry Point
 */

import { PluginManifest, PluginInstance } from '../../../types/plugin.types';
import { GitHubPlugin } from './GitHubPlugin';

export const githubManifest: PluginManifest = {
    id: 'github',
    name: 'GitHub Trending',
    version: '1.0.0',
    description: 'Trending repositories on GitHub',
    author: 'Sparkly',
    icon: '🐙',
    category: 'productivity',
    defaultZone: 'right-sidebar',
    minWidth: 320,
    minHeight: 400,
    permissions: ['storage'],
};

export const githubInstance: PluginInstance = {
    Component: GitHubPlugin,
};

export { GitHubPlugin } from './GitHubPlugin';
