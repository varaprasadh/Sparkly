/**
 * Widgets Settings Tab
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { pluginRegistry } from '../../plugins/PluginRegistry';
import { useWidgets } from '../../store/hooks';
import { WidgetZone, ZONE_CONFIGS } from '../../types/widget.types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const PluginList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PluginCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const PluginIcon = styled.span`
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const PluginInfo = styled.div`
  flex: 1;
`;

const PluginName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
`;

const PluginDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
`;

const PluginActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ActiveWidgetsSection = styled.div`
  margin-top: 16px;
`;

const ActiveWidgetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActiveWidget = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const WidgetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WidgetIcon = styled.span`
  font-size: 20px;
`;

const WidgetName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const WidgetZoneTag = styled.span`
  padding: 4px 8px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  color: #6b7280;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #fef2f2;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #9ca3af;
  font-size: 14px;
`;

const ZONES: { id: WidgetZone; label: string }[] = [
  { id: 'left-sidebar', label: 'Left Sidebar' },
  { id: 'right-sidebar', label: 'Right Sidebar' },
  { id: 'center', label: 'Center' },
];

export function WidgetsTab(): JSX.Element {
  const { placements, addWidget, removeWidget } = useWidgets();
  const [selectedZone, setSelectedZone] = React.useState<WidgetZone>('right-sidebar');

  const plugins = pluginRegistry.getAll();

  const handleAddWidget = useCallback(
    (pluginId: string) => {
      addWidget(pluginId, selectedZone);
    },
    [addWidget, selectedZone]
  );

  const handleRemoveWidget = useCallback(
    (placementId: string) => {
      removeWidget(placementId);
    },
    [removeWidget]
  );

  // Check if a plugin is already placed in a zone
  const isPluginPlaced = useCallback(
    (pluginId: string) => {
      return placements.some((p) => p.pluginId === pluginId && p.isVisible);
    },
    [placements]
  );

  const activeWidgets = placements.filter((p) => p.isVisible);

  return (
    <Container>
      <Section>
        <SectionTitle>Available Widgets</SectionTitle>
        <Description>Add widgets to your new tab page to enhance productivity</Description>

        <PluginList>
          {plugins.map((plugin) => (
            <PluginCard key={plugin.manifest.id}>
              <PluginIcon>{plugin.manifest.icon}</PluginIcon>
              <PluginInfo>
                <PluginName>{plugin.manifest.name}</PluginName>
                <PluginDescription>{plugin.manifest.description}</PluginDescription>
              </PluginInfo>
              <PluginActions>
                <Select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as WidgetZone)}
                >
                  {ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label}
                    </option>
                  ))}
                </Select>
                <AddButton
                  onClick={() => handleAddWidget(plugin.manifest.id)}
                  disabled={isPluginPlaced(plugin.manifest.id)}
                >
                  {isPluginPlaced(plugin.manifest.id) ? 'Added' : 'Add'}
                </AddButton>
              </PluginActions>
            </PluginCard>
          ))}

          {plugins.length === 0 && (
            <EmptyState>No widgets available</EmptyState>
          )}
        </PluginList>
      </Section>

      <ActiveWidgetsSection>
        <SectionTitle>Active Widgets</SectionTitle>
        <Description>Manage widgets currently on your new tab page</Description>

        <ActiveWidgetsList style={{ marginTop: '16px' }}>
          {activeWidgets.map((placement) => {
            const plugin = pluginRegistry.get(placement.pluginId);
            if (!plugin) return null;

            return (
              <ActiveWidget key={placement.id}>
                <WidgetInfo>
                  <WidgetIcon>{plugin.manifest.icon}</WidgetIcon>
                  <WidgetName>{plugin.manifest.name}</WidgetName>
                  <WidgetZoneTag>{ZONE_CONFIGS[placement.zone].name}</WidgetZoneTag>
                </WidgetInfo>
                <RemoveButton onClick={() => handleRemoveWidget(placement.id)}>×</RemoveButton>
              </ActiveWidget>
            );
          })}

          {activeWidgets.length === 0 && (
            <EmptyState>No widgets added yet. Add widgets from the list above.</EmptyState>
          )}
        </ActiveWidgetsList>
      </ActiveWidgetsSection>
    </Container>
  );
}

export default WidgetsTab;
