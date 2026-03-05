/**
 * Widgets Settings Tab
 */

import React from 'react';
import styled from 'styled-components';
import { GeneralSettings } from '../../types/settings.types';

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


const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;


const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const ToggleSwitch = styled.div<{ checked: boolean }>`
  width: 48px;
  height: 26px;
  background: ${(p) => (p.checked ? '#3b82f6' : '#d1d5db')};
  border-radius: 13px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: ${(p) => (p.checked ? '25px' : '3px')};
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #374151;
`;

interface WidgetsTabProps {
  settings: GeneralSettings;
  onUpdate: (updates: Partial<GeneralSettings>) => void;
}

const WIDGET_TOGGLES: { key: keyof GeneralSettings; label: string; description: string }[] = [
  { key: 'showClock',          label: 'Clock',              description: 'Display the clock and date' },
  { key: 'showSearch',         label: 'Search Bar',         description: 'Display the search bar below the clock' },
  { key: 'showWeather',        label: 'Weather',            description: 'Show current weather (requires location permission)' },
  { key: 'showTopSites',       label: 'Recently Visited',   description: 'Show most recently visited sites as quick shortcuts' },
  { key: 'showTabManager',     label: 'Tab Manager',        description: 'Display the tab manager in the left sidebar' },
  { key: 'showFeedHub',        label: 'Feed Hub',           description: 'Display the developer news feed' },
  { key: 'showGoogleWorkspace',label: 'Google Workspace',   description: 'Show Calendar, Drive, and Gmail widget' },
  { key: 'showBookmarks',      label: 'Google Apps',        description: 'Display Google app shortcuts in the right sidebar' },
];

export function WidgetsTab({ settings, onUpdate }: WidgetsTabProps): JSX.Element {
  return (
    <Container>
      <Section>
        {WIDGET_TOGGLES.map(({ key, label, description }) => (
          <FormGroup key={key}>
            <Toggle>
              <HiddenCheckbox
                checked={!!settings[key]}
                onChange={(e) => onUpdate({ [key]: e.target.checked } as Partial<GeneralSettings>)}
              />
              <ToggleSwitch checked={!!settings[key]} />
              <div>
                <ToggleLabel>{label}</ToggleLabel>
                <Description>{description}</Description>
              </div>
            </Toggle>
          </FormGroup>
        ))}
        {settings.showTopSites && (
          <FormGroup>
            <Label>Maximum quick links</Label>
            <Select
              value={settings.maxQuickLinks}
              onChange={(e) => onUpdate({ maxQuickLinks: parseInt(e.target.value) })}
            >
              <option value="4">4 links</option>
              <option value="6">6 links</option>
              <option value="8">8 links</option>
              <option value="10">10 links</option>
              <option value="12">12 links</option>
            </Select>
          </FormGroup>
        )}
        {settings.showWeather && (
          <FormGroup>
            <Label>Temperature unit</Label>
            <Select
              value={settings.temperatureUnit}
              onChange={(e) => onUpdate({ temperatureUnit: e.target.value as 'celsius' | 'fahrenheit' })}
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </Select>
          </FormGroup>
        )}
      </Section>
    </Container>
  );
}

export default WidgetsTab;
