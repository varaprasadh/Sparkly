/**
 * Widget zone layout type definitions
 */

import { EntityId, Position, Size } from './common.types';

// Widget zones
export type WidgetZone =
  | 'left-sidebar'
  | 'top-bar'
  | 'center'
  | 'right-sidebar'
  | 'floating';

// Widget size presets
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

// Zone layout direction
export type ZoneLayout = 'horizontal' | 'vertical' | 'grid';

// Zone position on screen
export type ZonePosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'overlay';

// Zone configuration
export interface ZoneConfiguration {
  id: WidgetZone;
  name: string;
  position: ZonePosition;
  layout: ZoneLayout;

  // Size constraints
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  // Behavior
  collapsible: boolean;
  resizable: boolean;
  maxWidgets: number;
  allowDrag?: boolean;

  // Styling
  padding?: number;
  gap?: number;
  backgroundColor?: string;
}

// Widget placement in a zone
export interface WidgetPlacement {
  id: EntityId;
  pluginId: string;
  zone: WidgetZone;
  order: number;
  isVisible: boolean;
  isMinimized: boolean;
  size: WidgetSize;

  // For floating zone only
  position?: Position;
  customSize?: Size;
}

// Zone state
export interface ZoneState {
  id: WidgetZone;
  isCollapsed: boolean;
  isResizing: boolean;
  currentWidth?: number;
  currentHeight?: number;
  widgets: WidgetPlacement[];
}

// Zone context for child widgets
export interface ZoneContextValue {
  zone: WidgetZone;
  config: ZoneConfiguration;
  state: ZoneState;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  addWidget: (pluginId: string) => void;
  removeWidget: (placementId: EntityId) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
  moveWidget: (placementId: EntityId, targetZone: WidgetZone) => void;
}

// Widget container props
export interface WidgetContainerProps {
  placement: WidgetPlacement;
  children: React.ReactNode;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Zone props
export interface ZoneProps {
  zone: WidgetZone;
  children?: React.ReactNode;
  className?: string;
}

// Drag and drop types
export interface DragItem {
  type: 'widget';
  placementId: EntityId;
  pluginId: string;
  sourceZone: WidgetZone;
  index: number;
}

export interface DropResult {
  targetZone: WidgetZone;
  targetIndex: number;
}

// Widget events
export type WidgetEventType =
  | 'widget:added'
  | 'widget:removed'
  | 'widget:moved'
  | 'widget:resized'
  | 'widget:minimized'
  | 'widget:maximized';

export interface WidgetEvent {
  type: WidgetEventType;
  placementId: EntityId;
  pluginId: string;
  zone: WidgetZone;
  timestamp: string;
  data?: unknown;
}

// Zone configuration map
export const ZONE_CONFIGS: Record<WidgetZone, ZoneConfiguration> = {
  'left-sidebar': {
    id: 'left-sidebar',
    name: 'Left Sidebar',
    position: 'left',
    layout: 'vertical',
    defaultWidth: 300,
    minWidth: 200,
    maxWidth: 400,
    collapsible: true,
    resizable: true,
    maxWidgets: 3,
    padding: 12,
    gap: 8,
  },
  'top-bar': {
    id: 'top-bar',
    name: 'Top Bar',
    position: 'top',
    layout: 'horizontal',
    defaultHeight: 60,
    minHeight: 40,
    maxHeight: 80,
    collapsible: false,
    resizable: false,
    maxWidgets: 5,
    padding: 8,
    gap: 16,
  },
  'center': {
    id: 'center',
    name: 'Center',
    position: 'center',
    layout: 'vertical',
    collapsible: false,
    resizable: false,
    maxWidgets: 2,
    padding: 0,
    gap: 24,
  },
  'right-sidebar': {
    id: 'right-sidebar',
    name: 'Right Sidebar',
    position: 'right',
    layout: 'vertical',
    defaultWidth: 320,
    minWidth: 280,
    maxWidth: 450,
    collapsible: true,
    resizable: true,
    maxWidgets: 4,
    padding: 12,
    gap: 8,
  },
  'floating': {
    id: 'floating',
    name: 'Floating',
    position: 'overlay',
    layout: 'grid',
    collapsible: false,
    resizable: false,
    maxWidgets: 10,
    allowDrag: true,
    padding: 0,
    gap: 0,
  },
};
