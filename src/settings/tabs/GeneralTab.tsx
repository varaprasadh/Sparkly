/**
 * General Settings Tab
 */

import React from 'react';
import styled from 'styled-components';
import { GeneralSettings, SearchEngineId } from '../../types/settings.types';

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

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent-color, #3b82f6);
    box-shadow: 0 0 0 3px var(--accent-color-light, rgba(59, 130, 246, 0.1));
  }
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
    border-color: var(--accent-color, #3b82f6);
    box-shadow: 0 0 0 3px var(--accent-color-light, rgba(59, 130, 246, 0.1));
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
  background: ${(props) => (props.checked ? 'var(--accent-color, #3b82f6)' : '#d1d5db')};
  border-radius: 13px;
  position: relative;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: ${(props) => (props.checked ? '25px' : '3px')};
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

const SEARCH_ENGINES = [
  { id: 'google', label: 'Google' },
  { id: 'bing', label: 'Bing' },
  { id: 'yahoo', label: 'Yahoo' },
  { id: 'duckduckgo', label: 'DuckDuckGo' },
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'claude', label: 'Claude' },
];

interface GeneralTabProps {
  settings: GeneralSettings;
  onUpdate: (updates: Partial<GeneralSettings>) => void;
}

export function GeneralTab({ settings, onUpdate }: GeneralTabProps): JSX.Element {
  return (
    <Container>
      <Section>
        <SectionTitle>Search</SectionTitle>

        <FormGroup>
          <Label>Search Engine</Label>
          <Select
            value={settings.searchEngine}
            onChange={(e) => onUpdate({ searchEngine: e.target.value as SearchEngineId })}
          >
            {SEARCH_ENGINES.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.label}
              </option>
            ))}
          </Select>
          <Description>Choose your preferred search engine for the search bar</Description>
        </FormGroup>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.openLinksInNewTab}
              onChange={(e) => onUpdate({ openLinksInNewTab: e.target.checked })}
            />
            <ToggleSwitch checked={settings.openLinksInNewTab} />
            <ToggleLabel>Open links in new tab</ToggleLabel>
          </Toggle>
          <Description>When enabled, all link clicks on any website will open in a new tab</Description>
        </FormGroup>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.globalSearch}
              onChange={(e) => onUpdate({ globalSearch: e.target.checked })}
            />
            <ToggleSwitch checked={settings.globalSearch} />
            <ToggleLabel>Global search bar</ToggleLabel>
          </Toggle>
          <Description>Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Shift+K on any webpage to open a universal search bar for tabs and web search</Description>
        </FormGroup>
      </Section>


    </Container>
  );
}

export default GeneralTab;
