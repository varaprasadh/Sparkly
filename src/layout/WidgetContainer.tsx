/**
 * Widget Container - Wrapper for plugin widgets
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PluginProps } from '../types/plugin.types';
import { WidgetPlacement, WidgetZone } from '../types/widget.types';
import { pluginRegistry } from '../plugins/PluginRegistry';
import { createPluginAPI } from '../plugins/core/PluginAPI';

const Container = styled.div<{ isMinimized: boolean }>`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  height: ${(props) => (props.isMinimized ? 'auto' : '100%')};
  min-height: ${(props) => (props.isMinimized ? 'auto' : '200px')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: move;
`;

const WidgetTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const WidgetIcon = styled.span`
  font-size: 16px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 4px;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 14px;
  color: #6b7280;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1f2937;
  }
`;

const Content = styled.div<{ isMinimized: boolean }>`
  display: ${(props) => (props.isMinimized ? 'none' : 'flex')};
  flex-direction: column;
  height: calc(100% - 40px);
  overflow: hidden;
`;

interface WidgetContainerProps {
  placement: WidgetPlacement;
  onRemove: (placementId: string) => void;
  onToggleMinimized: (placementId: string) => void;
}

export function WidgetContainer({
  placement,
  onRemove,
  onToggleMinimized,
}: WidgetContainerProps): JSX.Element | null {
  const plugin = pluginRegistry.get(placement.pluginId);

  const api = useMemo(() => {
    return createPluginAPI(placement.pluginId);
  }, [placement.pluginId]);

  if (!plugin) {
    return null;
  }

  const { manifest, instance } = plugin;
  const PluginComponent = instance.Component;

  return (
    <Container isMinimized={placement.isMinimized}>
      <Header>
        <WidgetTitle>
          <WidgetIcon>{manifest.icon}</WidgetIcon>
          <span>{manifest.name}</span>
        </WidgetTitle>
        <HeaderActions>
          <HeaderButton
            onClick={() => onToggleMinimized(placement.id)}
            title={placement.isMinimized ? 'Expand' : 'Minimize'}
          >
            {placement.isMinimized ? '▼' : '▲'}
          </HeaderButton>
          <HeaderButton onClick={() => onRemove(placement.id)} title="Remove widget">
            ×
          </HeaderButton>
        </HeaderActions>
      </Header>
      <Content isMinimized={placement.isMinimized}>
        <PluginComponent
          api={api}
          isActive={true}
          isMinimized={placement.isMinimized}
          zone={placement.zone}
        />
      </Content>
    </Container>
  );
}

export default WidgetContainer;
