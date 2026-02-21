/**
 * Plugin Test Page - For testing the new plugin system
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { AppBootstrap } from './AppBootstrap';
import { useUI, useWidgets } from '../store/hooks';
import { pluginRegistry } from '../plugins';

const TestContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;

  &:hover {
    background: #2563eb;
  }
`;

const PluginList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const PluginCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
`;

const PluginIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const PluginName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const PluginDesc = styled.div`
  font-size: 12px;
  opacity: 0.7;
`;

function TestContent(): JSX.Element {
  const { openSettings } = useUI();
  const { addWidget } = useWidgets();
  const plugins = pluginRegistry.getAll();

  const handleAddAllWidgets = () => {
    plugins.forEach((plugin) => {
      addWidget(plugin.manifest.id, 'right-sidebar');
    });
  };

  return (
    <TestContainer>
      <Header>
        <Title>Sparkly Plugin Test</Title>
        <div>
          <Button onClick={handleAddAllWidgets}>Add All Widgets</Button>
          <Button onClick={() => openSettings()}>Open Settings</Button>
        </div>
      </Header>

      <p>
        The widgets sidebar should appear on the right. Click "Add All Widgets"
        to add the built-in plugins, or use the Settings to manage them.
      </p>

      <h2>Registered Plugins ({plugins.length})</h2>
      <PluginList>
        {plugins.map((plugin) => (
          <PluginCard key={plugin.manifest.id}>
            <PluginIcon>{plugin.manifest.icon}</PluginIcon>
            <PluginName>{plugin.manifest.name}</PluginName>
            <PluginDesc>{plugin.manifest.description}</PluginDesc>
            <Button
              style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px' }}
              onClick={() => addWidget(plugin.manifest.id, 'right-sidebar')}
            >
              Add to Sidebar
            </Button>
          </PluginCard>
        ))}
      </PluginList>
    </TestContainer>
  );
}

export function PluginTestPage(): JSX.Element {
  return (
    <AppBootstrap>
      <TestContent />
    </AppBootstrap>
  );
}

export default PluginTestPage;
