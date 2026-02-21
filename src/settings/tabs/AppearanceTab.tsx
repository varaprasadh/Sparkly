/**
 * Appearance Settings Tab
 */

import React from 'react';
import styled from 'styled-components';
import { AppearanceSettings, ThemeMode, FontSize, LayoutDensity } from '../../types/settings.types';

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
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  background: ${(props) => (props.checked ? '#3b82f6' : '#d1d5db')};
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

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const ThemeCard = styled.button<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid ${(props) => (props.selected ? '#3b82f6' : '#e5e7eb')};
  border-radius: 12px;
  background: ${(props) => (props.selected ? '#eff6ff' : 'white')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => (props.selected ? '#3b82f6' : '#d1d5db')};
  }
`;

const ThemePreview = styled.div<{ mode: ThemeMode }>`
  width: 60px;
  height: 40px;
  border-radius: 6px;
  background: ${(props) =>
    props.mode === 'light'
      ? 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
      : props.mode === 'dark'
      ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
      : 'linear-gradient(135deg, #f9fafb 0%, #1f2937 100%)'};
  border: 1px solid #d1d5db;
`;

const ThemeLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ColorSwatch = styled.button<{ color: string; selected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid ${(props) => (props.selected ? '#1f2937' : 'transparent')};
  background: ${(props) => props.color};
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const SliderValue = styled.span`
  font-size: 14px;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const THEME_MODES: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
];

const ACCENT_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
];

const FONT_SIZE_OPTIONS: { id: FontSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const DENSITY_OPTIONS: { id: LayoutDensity; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'spacious', label: 'Spacious' },
];

interface AppearanceTabProps {
  settings: AppearanceSettings;
  onUpdate: (updates: Partial<AppearanceSettings>) => void;
}

export function AppearanceTab({ settings, onUpdate }: AppearanceTabProps): JSX.Element {
  return (
    <Container>
      <Section>
        <SectionTitle>Theme</SectionTitle>

        <ThemeGrid>
          {THEME_MODES.map((mode) => (
            <ThemeCard
              key={mode.id}
              selected={settings.theme === mode.id}
              onClick={() => onUpdate({ theme: mode.id })}
            >
              <ThemePreview mode={mode.id} />
              <ThemeLabel>{mode.label}</ThemeLabel>
            </ThemeCard>
          ))}
        </ThemeGrid>
      </Section>

      <Section>
        <SectionTitle>Accent Color</SectionTitle>

        <FormGroup>
          <Label>Choose an accent color</Label>
          <ColorPicker>
            {ACCENT_COLORS.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={settings.accentColor === color}
                onClick={() => onUpdate({ accentColor: color })}
              />
            ))}
          </ColorPicker>
          <Description>This color will be used for buttons and interactive elements</Description>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Typography</SectionTitle>

        <FormGroup>
          <Label>Font size</Label>
          <Select
            value={settings.fontSize}
            onChange={(e) => onUpdate({ fontSize: e.target.value as FontSize })}
          >
            {FONT_SIZE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          <Description>Adjust the overall text size</Description>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Layout</SectionTitle>

        <FormGroup>
          <Label>Layout density</Label>
          <Select
            value={settings.layoutDensity}
            onChange={(e) => onUpdate({ layoutDensity: e.target.value as LayoutDensity })}
          >
            {DENSITY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          <Description>Control the spacing and padding of elements</Description>
        </FormGroup>

        <FormGroup>
          <Label>Widget border radius ({settings.widgetBorderRadius}px)</Label>
          <SliderContainer>
            <Slider
              type="range"
              min="0"
              max="24"
              value={settings.widgetBorderRadius}
              onChange={(e) => onUpdate({ widgetBorderRadius: parseInt(e.target.value) })}
            />
            <SliderValue>{settings.widgetBorderRadius}px</SliderValue>
          </SliderContainer>
          <Description>Adjust the roundness of widget corners</Description>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Animations</SectionTitle>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.enableAnimations}
              onChange={(e) => onUpdate({ enableAnimations: e.target.checked })}
            />
            <ToggleSwitch checked={settings.enableAnimations} />
            <ToggleLabel>Enable animations</ToggleLabel>
          </Toggle>
          <Description>Toggle smooth transitions and animations</Description>
        </FormGroup>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.enableTransparency}
              onChange={(e) => onUpdate({ enableTransparency: e.target.checked })}
            />
            <ToggleSwitch checked={settings.enableTransparency} />
            <ToggleLabel>Enable transparency effects</ToggleLabel>
          </Toggle>
          <Description>Use semi-transparent backgrounds for widgets</Description>
        </FormGroup>
      </Section>
    </Container>
  );
}

export default AppearanceTab;
