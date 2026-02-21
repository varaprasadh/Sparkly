/**
 * Hacker News Plugin Entry Point
 */

import { PluginManifest, PluginInstance } from '../../../types/plugin.types';
import { HackerNewsPlugin } from './HackerNewsPlugin';

export const hackerNewsManifest: PluginManifest = {
  id: 'hackernews',
  name: 'Hacker News',
  version: '1.0.0',
  description: 'Top stories from Hacker News',
  author: 'Sparkly',
  icon: '📰',
  category: 'social',
  defaultZone: 'right-sidebar',
  minWidth: 320,
  minHeight: 400,
  permissions: ['storage'],
};

export const hackerNewsInstance: PluginInstance = {
  Component: HackerNewsPlugin,
};

export { HackerNewsPlugin } from './HackerNewsPlugin';
