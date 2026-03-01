/// <reference types="chrome"/>
import { useState, useEffect, useCallback } from 'react';
import type { TabInfo, WindowGroup } from './types';
import { WINDOW_COLORS } from './constants';

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
      discarded: tab.discarded,
    });
  });

  return Object.entries(grouped).map(([windowId, tabs], index) => ({
    windowId: parseInt(windowId, 10),
    tabs,
    color: WINDOW_COLORS[index % WINDOW_COLORS.length],
  }));
}

export function useTabQuery() {
  const [windowGroups, setWindowGroups] = useState<WindowGroup[]>([]);

  const queryTabs = useCallback((): void => {
    chrome.tabs.query({}, (tabs) => {
      const groups = groupTabsByWindow(tabs);
      setWindowGroups(groups);
    });
  }, []);

  useEffect(() => {
    queryTabs();

    chrome.windows.onCreated.addListener(queryTabs);
    chrome.windows.onRemoved.addListener(queryTabs);
    chrome.tabs.onUpdated.addListener(queryTabs);
    chrome.tabs.onRemoved.addListener(queryTabs);

    return () => {
      chrome.windows.onCreated.removeListener(queryTabs);
      chrome.windows.onRemoved.removeListener(queryTabs);
      chrome.tabs.onUpdated.removeListener(queryTabs);
      chrome.tabs.onRemoved.removeListener(queryTabs);
    };
  }, [queryTabs]);

  const allTabs = windowGroups.flatMap((g) => g.tabs);

  return { windowGroups, allTabs, queryTabs };
}
