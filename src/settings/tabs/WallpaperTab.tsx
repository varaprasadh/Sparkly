/**
 * Wallpaper Settings Tab
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WallpaperSettings, WallpaperSource, WallpaperFrequency } from '../../types/settings.types';

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

const SourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const SourceCard = styled.button<{ selected: boolean }>`
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

const SourceIcon = styled.span`
  font-size: 24px;
`;

const SourceLabel = styled.span`
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

const WALLPAPER_SOURCES: { id: WallpaperSource; label: string; icon: string }[] = [
  { id: 'random', label: 'Random', icon: '🎲' },
  { id: 'history', label: 'From History', icon: '📚' },
  { id: 'custom', label: 'Custom URL', icon: '🔗' },
  { id: 'upload', label: 'Upload', icon: '📁' },
  { id: 'color', label: 'Solid Color', icon: '🎨' },
];

const REFRESH_OPTIONS: { id: WallpaperFrequency; label: string }[] = [
  { id: 'never', label: 'Never' },
  { id: 'every-tab', label: 'Every new tab' },
  { id: 'hourly', label: 'Every hour' },
  { id: 'daily', label: 'Once a day' },
];

const SOLID_COLORS = [
  '#1f2937', '#374151', '#4b5563', '#6b7280',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e',
];

// History wallpaper grid styles
const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const HistoryCard = styled.button<{ selected: boolean }>`
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid ${(props) => (props.selected ? '#3b82f6' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const HistoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HistoryOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  font-size: 10px;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const EmptyHistory = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 14px;
`;

interface WallpaperHistoryItem {
  id: string;
  urls?: {
    thumb?: string;
    small?: string;
    regular?: string;
    full?: string;
  };
  user?: {
    username?: string;
  };
}

interface WallpaperTabProps {
  settings: WallpaperSettings;
  onUpdate: (updates: Partial<WallpaperSettings>) => void;
}

export function WallpaperTab({ settings, onUpdate }: WallpaperTabProps): JSX.Element {
  const [historyWallpapers, setHistoryWallpapers] = useState<WallpaperHistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Load wallpaper history from storage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        chrome.storage.local.get(['wallpapersTrail'], (result) => {
          const trail = result.wallpapersTrail;
          if (trail) {
            const parsed = typeof trail === 'string' ? JSON.parse(trail) : trail;
            // Get last 5 wallpapers, most recent first
            const recent = Array.isArray(parsed) ? parsed.slice(-5).reverse() : [];
            setHistoryWallpapers(recent);
          }
        });
      } catch (error) {
        console.error('Failed to load wallpaper history:', error);
      }
    };

    if (settings.source === 'history') {
      loadHistory();
    }
  }, [settings.source]);

  // Handle selecting a wallpaper from history
  const handleSelectHistoryWallpaper = (wallpaper: WallpaperHistoryItem) => {
    setSelectedHistoryId(wallpaper.id);

    // Set this wallpaper as the current one
    const imageUrl = wallpaper.urls?.full || wallpaper.urls?.regular;
    if (imageUrl) {
      // Fetch and cache the image
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            chrome.storage.local.set({
              bufferedImage: reader.result,
              bufferedImageMetadata: JSON.stringify(wallpaper),
              wallpaperConfigType: 'history'
            });
            // Force a page refresh to show the new wallpaper
            window.location.reload();
          });
          reader.readAsDataURL(blob);
        })
        .catch(err => console.error('Failed to set wallpaper:', err));
    }
  };

  return (
    <Container>
      <Section>
        <SectionTitle>Wallpaper Source</SectionTitle>
        <SourceGrid>
          {WALLPAPER_SOURCES.map((source) => (
            <SourceCard
              key={source.id}
              selected={settings.source === source.id}
              onClick={() => onUpdate({ source: source.id })}
            >
              <SourceIcon>{source.icon}</SourceIcon>
              <SourceLabel>{source.label}</SourceLabel>
            </SourceCard>
          ))}
        </SourceGrid>
      </Section>

      {settings.source === 'history' && (
        <Section>
          <SectionTitle>Recent Wallpapers</SectionTitle>
          <Description>Select from your last 5 wallpapers</Description>
          {historyWallpapers.length === 0 ? (
            <EmptyHistory>
              No wallpaper history yet. Browse some wallpapers first!
            </EmptyHistory>
          ) : (
            <HistoryGrid>
              {historyWallpapers.map((wallpaper) => (
                <HistoryCard
                  key={wallpaper.id}
                  selected={selectedHistoryId === wallpaper.id}
                  onClick={() => handleSelectHistoryWallpaper(wallpaper)}
                >
                  <HistoryImage
                    src={wallpaper.urls?.small || wallpaper.urls?.thumb}
                    alt="Wallpaper"
                  />
                  <HistoryOverlay>
                    by {wallpaper.user?.username || 'Unknown'}
                  </HistoryOverlay>
                </HistoryCard>
              ))}
            </HistoryGrid>
          )}
        </Section>
      )}

      {settings.source === 'color' && (
        <Section>
          <SectionTitle>Solid Color</SectionTitle>
          <FormGroup>
            <Label>Choose a color</Label>
            <ColorPicker>
              {SOLID_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={settings.solidColor === color}
                  onClick={() => onUpdate({ solidColor: color })}
                />
              ))}
            </ColorPicker>
          </FormGroup>
        </Section>
      )}

      <Section>
        <SectionTitle>Refresh Settings</SectionTitle>

        <FormGroup>
          <Label>Refresh frequency</Label>
          <Select
            value={settings.refreshFrequency}
            onChange={(e) => onUpdate({ refreshFrequency: e.target.value as WallpaperFrequency })}
          >
            {REFRESH_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          <Description>How often to change the wallpaper</Description>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Display Options</SectionTitle>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.blur}
              onChange={(e) => onUpdate({ blur: e.target.checked })}
            />
            <ToggleSwitch checked={settings.blur} />
            <ToggleLabel>Enable blur effect</ToggleLabel>
          </Toggle>
          <Description>Apply a subtle blur to the wallpaper</Description>
        </FormGroup>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.dim}
              onChange={(e) => onUpdate({ dim: e.target.checked })}
            />
            <ToggleSwitch checked={settings.dim} />
            <ToggleLabel>Enable dimming</ToggleLabel>
          </Toggle>
          <Description>Darken the wallpaper for better readability</Description>
        </FormGroup>
      </Section>
    </Container>
  );
}

export default WallpaperTab;
