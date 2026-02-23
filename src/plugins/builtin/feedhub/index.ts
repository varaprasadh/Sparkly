/**
 * FeedHub Plugin Entry Point
 */

import { PluginManifest, PluginInstance } from '../../../types/plugin.types';
import { FeedHubPlugin } from './FeedHubPlugin';

export const feedHubManifest: PluginManifest = {
  id: 'feedhub',
  name: 'Feed Hub',
  version: '1.0.0',
  description: 'All your developer feeds in one place — HN, GitHub, Reddit, Dev.to, and more',
  author: 'Sparkly',
  icon: '📡',
  category: 'productivity',
  defaultZone: 'right-sidebar',
  minWidth: 320,
  minHeight: 400,
  permissions: ['storage'],
};

export const feedHubInstance: PluginInstance = {
  Component: FeedHubPlugin,
};

export { FeedHubPlugin } from './FeedHubPlugin';
