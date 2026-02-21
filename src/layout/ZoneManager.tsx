/**
 * Zone Manager - Orchestrates widget zones in the layout
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { WidgetZone } from '../types/widget.types';
import { useWidgets } from '../store/hooks';
import { SidebarZone } from './zones/SidebarZone';

const ZoneManagerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

interface ZoneManagerProps {
  children?: React.ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

export function ZoneManager({
  children,
  showLeftSidebar = false,
  showRightSidebar = true,
}: ZoneManagerProps): JSX.Element {
  const {
    placements,
    getZonePlacements,
    isZoneCollapsed,
    toggleZoneCollapsed,
    removeWidget,
    toggleWidgetMinimized,
  } = useWidgets();

  // Get placements for each zone
  const leftSidebarPlacements = getZonePlacements('left-sidebar');
  const rightSidebarPlacements = getZonePlacements('right-sidebar');

  // Zone collapse handlers
  const handleToggleLeftSidebar = useCallback(() => {
    toggleZoneCollapsed('left-sidebar');
  }, [toggleZoneCollapsed]);

  const handleToggleRightSidebar = useCallback(() => {
    toggleZoneCollapsed('right-sidebar');
  }, [toggleZoneCollapsed]);

  // Widget action handlers
  const handleRemoveWidget = useCallback(
    (placementId: string) => {
      removeWidget(placementId);
    },
    [removeWidget]
  );

  const handleToggleWidgetMinimized = useCallback(
    (placementId: string) => {
      toggleWidgetMinimized(placementId);
    },
    [toggleWidgetMinimized]
  );

  return (
    <ZoneManagerContainer>
      {/* Main content */}
      {children}

      {/* Left Sidebar */}
      {showLeftSidebar && (
        <SidebarZone
          zone="left-sidebar"
          placements={leftSidebarPlacements}
          collapsed={isZoneCollapsed('left-sidebar')}
          onToggleCollapse={handleToggleLeftSidebar}
          onRemoveWidget={handleRemoveWidget}
          onToggleWidgetMinimized={handleToggleWidgetMinimized}
        />
      )}

      {/* Right Sidebar */}
      {showRightSidebar && (
        <SidebarZone
          zone="right-sidebar"
          placements={rightSidebarPlacements}
          collapsed={isZoneCollapsed('right-sidebar')}
          onToggleCollapse={handleToggleRightSidebar}
          onRemoveWidget={handleRemoveWidget}
          onToggleWidgetMinimized={handleToggleWidgetMinimized}
        />
      )}
    </ZoneManagerContainer>
  );
}

export default ZoneManager;
