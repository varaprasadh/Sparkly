/// <reference types="chrome"/>
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import sparklyIcon from '../../icons/Sparkly.png';
import { DoubleRightOutlined, DoubleLeftOutlined, CloseOutlined } from '@ant-design/icons';

// Types
interface TabInfo {
  id?: number;
  windowId: number;
  title?: string;
  url?: string;
  favIconUrl?: string;
  active: boolean;
}

interface WindowGroup {
  windowId: number;
  tabs: TabInfo[];
  color: string;
}

interface StyledTabManagerContainerProps {
  collapsed: boolean;
}

interface StyledWindowGroupProps {
  color: string;
}

// Constants
const WINDOW_COLORS = ['#EA047E', '#ABD9FF', '#FF6D28', '#00F5FF', '#A7FFE4'];

// Styled components
const StyledTabManagerContainer = styled.div<StyledTabManagerContainerProps>`
  width: ${(props) => (props.collapsed ? 'auto' : '300px')};
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
  }
`;

const StyledTabItem = styled.div`
  position: relative;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  margin: 0.4rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  &:hover .styled-tab-actions {
    right: 0px;
  }
`;

const StyledWindowGroup = styled.div<StyledWindowGroupProps>`
  border-left: 3px solid ${(props) => props.color};
  margin: 1rem 0;
  padding-left: 2px;
`;

const StyledTabThumbnailBG = styled.a`
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  margin-right: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &:active {
    transform: scale(0.9);
  }
`;

const StyledTabThumbnail = styled.img`
  width: 16px;
  height: 16px;
`;

const StyledTabTitle = styled.div<{ width?: string }>`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${(props) => props.width || '100%'};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
`;

const StyledTabManagerHeader = styled.div`
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  color: white;
  padding: 1rem 1rem 0 1rem;
  min-height: 52px;
  margin-bottom: 0.5rem;
`;

const StyledCollapse = styled.div`
  margin-left: auto;
`;

const StyledActions = styled.div`
  position: absolute;
  top: 0;
  right: -60px;
  height: 100%;
  width: 60px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.8));
  transition: right 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
`;

const StyledActionIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.8);
    transform: scale(1.1);
  }
`;

const CollapseButton = styled.div`
  margin: 0rem 0.5rem;
  cursor: pointer;
  color: white;
`;

/**
 * Group tabs by window ID and assign colors
 */
function groupTabsByWindow(tabs: chrome.tabs.Tab[]): WindowGroup[] {
  const grouped: Record<number, TabInfo[]> = {};

  tabs.forEach((tab) => {
    const windowId = tab.windowId;
    if (!grouped[windowId]) {
      grouped[windowId] = [];
    }
    grouped[windowId].push({
      id: tab.id,
      windowId: tab.windowId,
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl,
      active: tab.active,
    });
  });

  return Object.entries(grouped).map(([windowId, tabs], index) => ({
    windowId: parseInt(windowId, 10),
    tabs,
    color: WINDOW_COLORS[index % WINDOW_COLORS.length],
  }));
}

function TabManager(): JSX.Element {
  const [windowGroups, setWindowGroups] = useState<WindowGroup[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const queryTabs = useCallback((): void => {
    chrome.tabs.query({}, (tabs) => {
      const groups = groupTabsByWindow(tabs);
      setWindowGroups(groups);
    });
  }, []);

  useEffect(() => {
    // Initial load
    queryTabs();

    // Load collapse state from storage
    chrome.storage.local.get('tabManagerCollapsed', (result) => {
      setCollapsed(result.tabManagerCollapsed || false);
    });

    // Add listeners
    chrome.windows.onCreated.addListener(queryTabs);
    chrome.windows.onRemoved.addListener(queryTabs);
    chrome.tabs.onUpdated.addListener(queryTabs);
    chrome.tabs.onRemoved.addListener(queryTabs);

    // Cleanup listeners
    return () => {
      chrome.windows.onCreated.removeListener(queryTabs);
      chrome.windows.onRemoved.removeListener(queryTabs);
      chrome.tabs.onUpdated.removeListener(queryTabs);
      chrome.tabs.onRemoved.removeListener(queryTabs);
    };
  }, [queryTabs]);

  const handleCollapse = (): void => {
    const newCollapsed = !collapsed;
    chrome.storage.local.set({ tabManagerCollapsed: newCollapsed });
    setCollapsed(newCollapsed);
  };

  const handleTabClick = (tab: TabInfo): void => {
    if (tab.id === undefined) return;

    chrome.windows.update(tab.windowId, { focused: true }, () => {
      chrome.tabs.update(tab.id!, { active: true });
    });
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: number | undefined): void => {
    e.stopPropagation();
    if (tabId !== undefined) {
      chrome.tabs.remove(tabId);
    }
  };

  return (
    <StyledTabManagerContainer className="tab-manager" collapsed={collapsed}>
      <StyledTabManagerHeader>
        {!collapsed && (
          <StyledTabThumbnailBG as="div">
            <StyledTabThumbnail src={sparklyIcon} alt="Sparkly" />
          </StyledTabThumbnailBG>
        )}
        {!collapsed && (
          <StyledTabTitle>
            Sparkly
            <br />
            Tab Manager
          </StyledTabTitle>
        )}
        <StyledCollapse>
          <CollapseButton onClick={handleCollapse}>
            {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
          </CollapseButton>
        </StyledCollapse>
      </StyledTabManagerHeader>

      {windowGroups.map((windowGroup) => (
        <StyledWindowGroup key={windowGroup.windowId} color={windowGroup.color}>
          {windowGroup.tabs.map((tab) => (
            <StyledTabItem key={tab.id} onClick={() => handleTabClick(tab)}>
              <StyledTabThumbnailBG as="div">
                <StyledTabThumbnail
                  src={tab.favIconUrl || sparklyIcon}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = sparklyIcon;
                  }}
                />
              </StyledTabThumbnailBG>
              <StyledTabTitle width={collapsed ? '0px' : '100%'}>
                {tab.title || 'Sparkly New Tab'}
              </StyledTabTitle>
              <StyledActions className="styled-tab-actions">
                <StyledActionIconWrapper onClick={(e) => handleCloseTab(e, tab.id)}>
                  <CloseOutlined style={{ color: 'white' }} />
                </StyledActionIconWrapper>
              </StyledActions>
            </StyledTabItem>
          ))}
        </StyledWindowGroup>
      ))}
    </StyledTabManagerContainer>
  );
}

export default TabManager;
