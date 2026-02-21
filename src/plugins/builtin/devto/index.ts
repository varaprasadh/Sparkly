/**
 * Dev.to Plugin Entry Point
 */

import { PluginManifest, PluginInstance } from '../../../types/plugin.types';
import { DevToPlugin } from './DevToPlugin';

export const devtoManifest: PluginManifest = {
    id: 'devto',
    name: 'Dev.to Articles',
    version: '1.0.0',
    description: 'Top articles from Dev.to',
    author: 'Sparkly',
    icon: '👩‍💻',
    category: 'productivity',
    defaultZone: 'right-sidebar',
    minWidth: 320,
    minHeight: 400,
    permissions: ['storage'],
};

export const devtoInstance: PluginInstance = {
    Component: DevToPlugin,
};

export { DevToPlugin } from './DevToPlugin';
