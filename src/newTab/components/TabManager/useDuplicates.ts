import { useMemo } from 'react';
import type { TabInfo } from './types';

export function useDuplicates(allTabs: TabInfo[]) {
  return useMemo(() => {
    const urlMap = new Map<string, TabInfo[]>();

    allTabs.forEach((tab) => {
      if (!tab.url) return;
      const existing = urlMap.get(tab.url) || [];
      existing.push(tab);
      urlMap.set(tab.url, existing);
    });

    const duplicateIds = new Set<number>();
    const duplicateGroups: TabInfo[][] = [];

    urlMap.forEach((tabs) => {
      if (tabs.length > 1) {
        duplicateGroups.push(tabs);
        // Mark all but the first as duplicates
        tabs.forEach((t) => {
          if (t.id !== undefined) duplicateIds.add(t.id);
        });
      }
    });

    const duplicateCount = duplicateGroups.reduce((sum, g) => sum + g.length - 1, 0);

    const closeAllDuplicates = () => {
      const idsToClose: number[] = [];
      urlMap.forEach((tabs) => {
        if (tabs.length > 1) {
          // Prefer keeping the active tab; fall back to the first one
          const activeIdx = tabs.findIndex((t) => t.active);
          const keepIdx = activeIdx !== -1 ? activeIdx : 0;
          tabs.forEach((t, i) => {
            if (i !== keepIdx && t.id !== undefined) idsToClose.push(t.id);
          });
        }
      });
      if (idsToClose.length > 0) {
        chrome.tabs.remove(idsToClose);
      }
    };

    return { duplicateIds, duplicateCount, closeAllDuplicates };
  }, [allTabs]);
}
