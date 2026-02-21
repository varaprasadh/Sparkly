/**
 * AppDock - Dock showing app icons that can be clicked to open
 */

import React from 'react';
import styled from 'styled-components';
import { useApps, usePlugins } from '../store/hooks';
import { pluginRegistry } from '../plugins';

const DockContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
`;

const DockItem = styled.button<{ isActive: boolean; isMinimized: boolean }>`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: ${(props) =>
    props.isActive
      ? props.isMinimized
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(255, 255, 255, 0.9)'
      : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DockIndicator = styled.div<{ isActive: boolean }>`
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${(props) => (props.isActive ? '#fff' : 'transparent')};
`;

const DockLabel = styled.div`
  position: absolute;
  right: 50px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;

  ${DockItem}:hover & {
    opacity: 1;
  }
`;

export function AppDock(): JSX.Element {
  const { openApps, toggleApp, isAppOpen, isAppMinimized } = useApps();
  const plugins = pluginRegistry.getAll();

  return (
    <DockContainer>
      {plugins.map((plugin) => {
        const isOpen = isAppOpen(plugin.manifest.id);
        const isMinimized = isAppMinimized(plugin.manifest.id);

        return (
          <DockItem
            key={plugin.manifest.id}
            isActive={isOpen}
            isMinimized={isMinimized}
            onClick={() => toggleApp(plugin.manifest.id)}
            title={plugin.manifest.name}
          >
            {plugin.manifest.icon}
            <DockIndicator isActive={isOpen && !isMinimized} />
            <DockLabel>{plugin.manifest.name}</DockLabel>
          </DockItem>
        );
      })}
    </DockContainer>
  );
}

export default AppDock;
