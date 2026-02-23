/**
 * Sidebar Zone - Collapsible sidebar for widgets
 */

import React from 'react';
import styled from 'styled-components';
import { WidgetPlacement, WidgetZone, ZONE_CONFIGS } from '../../types/widget.types';
import { WidgetContainer } from '../WidgetContainer';

const SidebarContainer = styled.div<{ position: 'left' | 'right'; collapsed: boolean; width: number }>`
  position: fixed;
  top: 0;
  ${(props) => props.position}: 0;
  height: 100vh;
  width: ${(props) => (props.collapsed ? '40px' : `${props.width}px`)};
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 100;
  overflow: hidden;
`;

const CollapseButton = styled.button<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(props) => (props.position === 'left' ? 'right' : 'left')}: 0;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: ${(props) => (props.position === 'left' ? '0 8px 8px 0' : '8px 0 0 8px')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6b7280;
  transition: all 0.2s;
  z-index: 101;

  &:hover {
    background: white;
    color: #1f2937;
  }
`;

const SidebarContent = styled.div<{ collapsed: boolean }>`
  flex: 1;
  display: ${(props) => (props.collapsed ? 'none' : 'flex')};
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const SidebarHeader = styled.div<{ collapsed: boolean }>`
  display: ${(props) => (props.collapsed ? 'none' : 'flex')};
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  font-size: 14px;
`;

const SettingsButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

interface SidebarZoneProps {
  zone: 'left-sidebar' | 'right-sidebar';
  placements: WidgetPlacement[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRemoveWidget: (placementId: string) => void;
  onToggleWidgetMinimized: (placementId: string) => void;
  onOpenSettings?: () => void;
}

export function SidebarZone({
  zone,
  placements,
  collapsed,
  onToggleCollapse,
  onRemoveWidget,
  onToggleWidgetMinimized,
  onOpenSettings,
}: SidebarZoneProps): JSX.Element {
  const position = zone === 'left-sidebar' ? 'left' : 'right';
  const config = ZONE_CONFIGS[zone];
  const title = zone === 'left-sidebar' ? 'Left Sidebar' : 'Widgets';

  return (
    <SidebarContainer position={position} collapsed={collapsed} width={config.defaultWidth || 320}>
      <CollapseButton position={position} onClick={onToggleCollapse}>
        {collapsed
          ? position === 'left'
            ? '▶'
            : '◀'
          : position === 'left'
          ? '◀'
          : '▶'}
      </CollapseButton>

      <SidebarHeader collapsed={collapsed}>
        <SidebarTitle>{title}</SidebarTitle>
        {onOpenSettings && (
          <SettingsButton onClick={onOpenSettings} title="Settings">
            ⚙️
          </SettingsButton>
        )}
      </SidebarHeader>

      <SidebarContent collapsed={collapsed}>
        {placements.length === 0 ? (
          <EmptyState>No widgets added</EmptyState>
        ) : (
          placements.map((placement) => (
            <WidgetContainer
              key={placement.id}
              placement={placement}
              onRemove={onRemoveWidget}
              onToggleMinimized={onToggleWidgetMinimized}
            />
          ))
        )}
      </SidebarContent>
    </SidebarContainer>
  );
}

export default SidebarZone;
