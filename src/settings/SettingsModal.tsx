/**
 * Settings Modal - Main container for all settings tabs
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useUI, useSettings } from '../store/hooks';
import { GeneralTab } from './tabs/GeneralTab';
import { WallpaperTab } from './tabs/WallpaperTab';
import { WidgetsTab } from './tabs/WidgetsTab';
import { AboutTab } from './tabs/AboutTab';
import { AITab } from './tabs/AITab';
import { GeneralSettings, WallpaperSettings } from '../types/settings.types';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  width: 90%;
  max-width: 800px;
  height: 80%;
  max-height: 600px;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 200px;
  border-right: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-base, 14px);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-duration, 0.2s);
  background: ${(props) => (props.active ? 'var(--accent-color, #3b82f6)' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#4b5563')};

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color, #3b82f6)' : '#f3f4f6')};
  }
`;

const TabIcon = styled.span`
  font-size: 18px;
`;

const TabLabel = styled.span`
  font-weight: 500;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const SaveButton = styled.button<{ hasChanges: boolean }>`
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-base, 14px);
  font-weight: 500;
  cursor: ${(props) => (props.hasChanges ? 'pointer' : 'default')};
  transition: all var(--transition-duration, 0.2s);
  background: ${(props) => (props.hasChanges ? 'var(--accent-color, #3b82f6)' : '#9ca3af')};
  color: white;

  &:hover {
    background: ${(props) => (props.hasChanges ? 'var(--accent-color-hover, #2563eb)' : '#9ca3af')};
  }
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: #374151;

  &:hover {
    background: #f3f4f6;
  }
`;

const UnsavedIndicator = styled.span`
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
`;

const TABS = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'wallpaper', label: 'Wallpaper', icon: '🖼️' },
  { id: 'widgets', label: 'Widgets', icon: '🧩' },
  { id: 'ai', label: 'Sparkly AI', icon: '✦' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

// Draft settings interface
interface DraftSettings {
  general: GeneralSettings;
  wallpaper: WallpaperSettings;
}

export function SettingsModal(): JSX.Element | null {
  const { settingsOpen, activeSettingsTab, closeSettings, setActiveTab } = useUI();
  const settings = useSettings();

  // Draft state for unsaved changes
  const [draft, setDraft] = useState<DraftSettings>({
    general: settings.general,
    wallpaper: settings.wallpaper,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Track previous open state to detect when modal opens
  const prevOpenRef = useRef(false);

  // Sync draft with actual settings only when modal first opens
  useEffect(() => {
    if (settingsOpen && !prevOpenRef.current) {
      setDraft({
        general: settings.general,
        wallpaper: settings.wallpaper,
      });
      setHasChanges(false);
    }
    prevOpenRef.current = settingsOpen;
  }, [settingsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update draft general settings
  const updateDraftGeneral = useCallback((updates: Partial<GeneralSettings>) => {
    setDraft((prev) => ({
      ...prev,
      general: { ...prev.general, ...updates },
    }));
    setHasChanges(true);
  }, []);

  // Update draft wallpaper settings
  const updateDraftWallpaper = useCallback((updates: Partial<WallpaperSettings>) => {
    setDraft((prev) => ({
      ...prev,
      wallpaper: { ...prev.wallpaper, ...updates },
    }));
    setHasChanges(true);
  }, []);

  // Save all changes (keep modal open)
  const handleSave = useCallback(() => {
    settings.updateGeneral(draft.general);
    settings.updateWallpaper(draft.wallpaper);
    setHasChanges(false);
  }, [draft, settings]);

  // Cancel and revert changes
  const handleCancel = useCallback(() => {
    setDraft({
      general: settings.general,
      wallpaper: settings.wallpaper,
    });
    setHasChanges(false);
    closeSettings();
  }, [settings, closeSettings]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        if (hasChanges) {
          // Optionally show a confirmation dialog
          if (confirm('You have unsaved changes. Discard them?')) {
            handleCancel();
          }
        } else {
          closeSettings();
        }
      }
    },
    [closeSettings, hasChanges, handleCancel]
  );

  if (!settingsOpen) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeSettingsTab) {
      case 'general':
        return <GeneralTab settings={draft.general} onUpdate={updateDraftGeneral} />;
      case 'wallpaper':
        return <WallpaperTab settings={draft.wallpaper} onUpdate={updateDraftWallpaper} />;
      case 'widgets':
        return <WidgetsTab settings={draft.general} onUpdate={updateDraftGeneral} />;
      case 'ai':
        return <AITab settings={draft.general} onUpdate={updateDraftGeneral} />;
      case 'about':
        return <AboutTab />;
      default:
        return <GeneralTab settings={draft.general} onUpdate={updateDraftGeneral} />;
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Settings</Title>
          <HeaderActions>
            {hasChanges && <UnsavedIndicator>Unsaved changes</UnsavedIndicator>}
            <CloseButton onClick={handleCancel}>×</CloseButton>
          </HeaderActions>
        </Header>
        <Content>
          <Sidebar>
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeSettingsTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon>{tab.icon}</TabIcon>
                <TabLabel>{tab.label}</TabLabel>
              </TabButton>
            ))}
          </Sidebar>
          <MainContent>{renderTabContent()}</MainContent>
        </Content>
        <Footer>
          <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          <SaveButton hasChanges={hasChanges} onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </SaveButton>
        </Footer>
      </Modal>
    </Overlay>
  );
}

export default SettingsModal;
