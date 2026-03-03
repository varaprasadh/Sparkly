/// <reference types="chrome"/>
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DoubleRightOutlined, DoubleLeftOutlined, CloseOutlined } from '@ant-design/icons';
import sparklyIcon from '../../../icons/Sparkly_x.png';
import type { TabInfo, DomainGroup, GroupingMode } from './types';
import { STORAGE_KEYS, WINDOW_COLORS } from './constants';
import { useTabQuery } from './useTabQuery';
import { useDuplicates } from './useDuplicates';
import { useRecentlyClosed } from './useRecentlyClosed';
import { useSavedSessions } from './useSavedSessions';
import TabItem from './TabItem';
import {
  StyledTabManagerContainer,
  StyledTabManagerHeader,
  StyledTabListWrapper,
  StyledBottomSection,
  StyledCollapse,
  CollapseButton,
  StyledTabThumbnailBG,
  StyledTabThumbnail,
  StyledTabTitle,
  StyledTabCountBadge,
  StyledWindowGroup,
  StyledSearchInput,
  StyledSearchClear,
  StyledDuplicatesBanner,
  StyledDuplicatesCloseAll,
  StyledGroupingToggle,
  StyledGroupingOption,
  StyledSuspendButton,
  StyledCollapsibleSection,
  StyledCollapsibleHeader,
  StyledCollapsibleArrow,
  StyledRecentTabItem,
  StyledRestoreButton,
  StyledSessionPanel,
  StyledSessionSaveRow,
  StyledSessionItem,
  StyledSessionName,
  StyledSessionDate,
  StyledSessionActions,
  StyledSessionActionBtn,
} from './styles';

function TabManager(): JSX.Element {
  const { windowGroups, allTabs } = useTabQuery();
  const { duplicateIds, duplicateCount, closeAllDuplicates } = useDuplicates(allTabs);
  const { recentTabs, restoreSession: restoreRecentSession } = useRecentlyClosed();
  const { sessions, saveSession, restoreSession, deleteSession } = useSavedSessions();

  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('windows');
  const [recentOpen, setRecentOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');

  // Load persisted state
  useEffect(() => {
    chrome.storage.local.get(
      [STORAGE_KEYS.collapsed, STORAGE_KEYS.groupingMode],
      (result) => {
        if (result[STORAGE_KEYS.collapsed]) setCollapsed(result[STORAGE_KEYS.collapsed]);
        if (result[STORAGE_KEYS.groupingMode]) setGroupingMode(result[STORAGE_KEYS.groupingMode]);
      }
    );
  }, []);

  // Tab count
  const tabCount = allTabs.length;

  // Search filtering
  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allTabs.filter(
      (tab) =>
        tab.title?.toLowerCase().includes(q) || tab.url?.toLowerCase().includes(q)
    );
  }, [allTabs, searchQuery]);

  // Domain grouping
  const domainGroups = useMemo((): DomainGroup[] => {
    const tabs = filteredTabs || allTabs;
    const map = new Map<string, TabInfo[]>();

    tabs.forEach((tab) => {
      let domain = 'Other';
      try {
        if (tab.url) domain = new URL(tab.url).hostname;
      } catch {
        // keep 'Other'
      }
      const existing = map.get(domain) || [];
      existing.push(tab);
      map.set(domain, existing);
    });

    return Array.from(map.entries()).map(([domain, tabs]) => ({ domain, tabs }));
  }, [filteredTabs, allTabs]);

  const handleCollapse = (): void => {
    const newCollapsed = !collapsed;
    chrome.storage.local.set({ [STORAGE_KEYS.collapsed]: newCollapsed });
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

  const handleSuspendTab = (e: React.MouseEvent, tabId: number | undefined): void => {
    e.stopPropagation();
    if (tabId !== undefined) {
      chrome.tabs.discard(tabId);
    }
  };

  const handleSuspendInactive = (): void => {
    allTabs.forEach((tab) => {
      if (!tab.active && !tab.discarded && tab.id !== undefined) {
        chrome.tabs.discard(tab.id);
      }
    });
  };

  const handleGroupingChange = (mode: GroupingMode): void => {
    setGroupingMode(mode);
    chrome.storage.local.set({ [STORAGE_KEYS.groupingMode]: mode });
  };

  const handleSaveSession = (): void => {
    const name = sessionName.trim();
    if (!name) return;
    saveSession(name);
    setSessionName('');
  };

  const formatDate = (ts: number): string => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Determine what to render for tabs
  const renderTabList = () => {
    // If searching, render flat filtered list
    if (filteredTabs) {
      return (
        <div style={{ margin: '0.5rem 0' }}>
          {filteredTabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              collapsed={collapsed}
              isDuplicate={tab.id !== undefined && duplicateIds.has(tab.id)}
              onTabClick={handleTabClick}
              onCloseTab={handleCloseTab}
              onSuspendTab={handleSuspendTab}
            />
          ))}
          {filteredTabs.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: 12,
                padding: '1rem',
              }}
            >
              No tabs match your search
            </div>
          )}
        </div>
      );
    }

    // Domain/site grouping
    if (groupingMode === 'sites') {
      return domainGroups.map((group, index) => (
        <StyledWindowGroup
          key={group.domain}
          color={WINDOW_COLORS[index % WINDOW_COLORS.length]}
        >
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
              padding: '4px 8px 0',
              fontWeight: 600,
            }}
          >
            {group.domain} ({group.tabs.length})
          </div>
          {group.tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              collapsed={collapsed}
              isDuplicate={tab.id !== undefined && duplicateIds.has(tab.id)}
              onTabClick={handleTabClick}
              onCloseTab={handleCloseTab}
              onSuspendTab={handleSuspendTab}
            />
          ))}
        </StyledWindowGroup>
      ));
    }

    // Default: window grouping
    return windowGroups.map((windowGroup) => (
      <StyledWindowGroup key={windowGroup.windowId} color={windowGroup.color}>
        {windowGroup.tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            collapsed={collapsed}
            isDuplicate={tab.id !== undefined && duplicateIds.has(tab.id)}
            onTabClick={handleTabClick}
            onCloseTab={handleCloseTab}
            onSuspendTab={handleSuspendTab}
          />
        ))}
      </StyledWindowGroup>
    ));
  };

  return (
    <StyledTabManagerContainer className="tab-manager" collapsed={collapsed}>
      {/* Header */}
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
            <StyledTabCountBadge>{tabCount}</StyledTabCountBadge>
          </StyledTabTitle>
        )}
        <StyledCollapse>
          <CollapseButton onClick={handleCollapse}>
            {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
          </CollapseButton>
        </StyledCollapse>
      </StyledTabManagerHeader>

      {!collapsed && (
        <>
          {/* Search */}
          <StyledSearchInput>
            <input
              type="text"
              placeholder="Search tabs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <StyledSearchClear onClick={() => setSearchQuery('')}>
                <CloseOutlined />
              </StyledSearchClear>
            )}
          </StyledSearchInput>

          {/* Duplicates Banner */}
          {duplicateCount > 0 && (
            <StyledDuplicatesBanner>
              <span>{duplicateCount} duplicate tab{duplicateCount !== 1 ? 's' : ''} found</span>
              <StyledDuplicatesCloseAll onClick={closeAllDuplicates}>
                Close All
              </StyledDuplicatesCloseAll>
            </StyledDuplicatesBanner>
          )}

          {/* Grouping Toggle (hidden when searching) */}
          {!filteredTabs && (
            <StyledGroupingToggle>
              <StyledGroupingOption
                active={groupingMode === 'windows'}
                onClick={() => handleGroupingChange('windows')}
              >
                Windows
              </StyledGroupingOption>
              <StyledGroupingOption
                active={groupingMode === 'sites'}
                onClick={() => handleGroupingChange('sites')}
              >
                Sites
              </StyledGroupingOption>
            </StyledGroupingToggle>
          )}
        </>
      )}

      {/* Tab List */}
      <StyledTabListWrapper>
        {renderTabList()}
      </StyledTabListWrapper>

      {!collapsed && (
        <StyledBottomSection>
          {/* Suspend Inactive */}
          <StyledSuspendButton onClick={handleSuspendInactive}>
            💤 Suspend inactive tabs
          </StyledSuspendButton>

          {/* Recently Closed */}
          <StyledCollapsibleSection>
            <StyledCollapsibleHeader onClick={() => setRecentOpen(!recentOpen)}>
              <StyledCollapsibleArrow open={recentOpen}>&#9654;</StyledCollapsibleArrow>
              Recently Closed ({recentTabs.length})
            </StyledCollapsibleHeader>
            {recentOpen && recentTabs.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: 11,
                  padding: '8px',
                }}
              >
                No recently closed tabs
              </div>
            )}
            {recentOpen &&
              recentTabs.map((tab, index) => (
                <StyledRecentTabItem key={`${tab.sessionId}-${index}`}>
                  <StyledTabThumbnailBG
                    as="div"
                    style={{ width: 22, height: 22, marginRight: 8, flexShrink: 0 }}
                  >
                    <StyledTabThumbnail
                      src={tab.favIconUrl || sparklyIcon}
                      alt=""
                      style={{ width: 12, height: 12 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = sparklyIcon;
                      }}
                    />
                  </StyledTabThumbnailBG>
                  <StyledTabTitle style={{ fontSize: 12 }}>
                    {tab.title || tab.url || 'Untitled'}
                  </StyledTabTitle>
                  <StyledRestoreButton onClick={() => restoreRecentSession(tab.sessionId)}>
                      Restore
                    </StyledRestoreButton>
                  </StyledRecentTabItem>
                ))}
          </StyledCollapsibleSection>

          {/* Saved Sessions */}
          <StyledSessionPanel>
            <StyledCollapsibleHeader onClick={() => setSessionsOpen(!sessionsOpen)}>
              <StyledCollapsibleArrow open={sessionsOpen}>&#9654;</StyledCollapsibleArrow>
              Saved Sessions ({sessions.length})
            </StyledCollapsibleHeader>
            {sessionsOpen && (
              <>
                <StyledSessionSaveRow>
                  <input
                    type="text"
                    placeholder="Session name..."
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSession()}
                  />
                  <button onClick={handleSaveSession}>Save</button>
                </StyledSessionSaveRow>
                {sessions.map((session) => (
                  <StyledSessionItem key={session.id}>
                    <StyledSessionName>{session.name}</StyledSessionName>
                    <StyledSessionDate>{formatDate(session.timestamp)}</StyledSessionDate>
                    <StyledSessionActions>
                      <StyledSessionActionBtn onClick={() => restoreSession(session)}>
                        Open
                      </StyledSessionActionBtn>
                      <StyledSessionActionBtn danger onClick={() => deleteSession(session.id)}>
                        Del
                      </StyledSessionActionBtn>
                    </StyledSessionActions>
                  </StyledSessionItem>
                ))}
                {sessions.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: 11,
                      padding: '8px',
                    }}
                  >
                    No saved sessions
                  </div>
                )}
              </>
              )}
            </StyledSessionPanel>
        </StyledBottomSection>
      )}
    </StyledTabManagerContainer>
  );
}

export default TabManager;
