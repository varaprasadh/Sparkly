/**
 * Google Workspace Plugin Entry Point
 */

import { PluginManifest, PluginInstance } from '../../../types/plugin.types';
import { GoogleWorkspacePlugin } from './GoogleWorkspacePlugin';

export const googleWorkspaceManifest: PluginManifest = {
  id: 'google-workspace',
  name: 'Google Workspace',
  version: '1.0.0',
  description: 'View your Google Calendar, Drive files, and Gmail - all in one place',
  author: 'Sparkly',
  icon: '🔷',
  category: 'productivity',
  defaultZone: 'right-sidebar',
  minWidth: 320,
  minHeight: 400,
  permissions: ['storage'],
};

export const googleWorkspaceInstance: PluginInstance = {
  Component: GoogleWorkspacePlugin,
};

export { GoogleWorkspacePlugin } from './GoogleWorkspacePlugin';
