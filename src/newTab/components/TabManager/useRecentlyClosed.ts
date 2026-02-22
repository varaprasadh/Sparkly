/// <reference types="chrome"/>
import { useState, useEffect, useCallback } from 'react';

export interface RecentlyClosedTab {
  sessionId: string;
  title?: string;
  url?: string;
  favIconUrl?: string;
}

export function useRecentlyClosed() {
  const [recentTabs, setRecentTabs] = useState<RecentlyClosedTab[]>([]);

  const fetchRecent = useCallback(() => {
    if (!chrome.sessions) return;

    chrome.sessions.getRecentlyClosed({ maxResults: 10 }, (sessions) => {
      const tabs: RecentlyClosedTab[] = [];
      sessions.forEach((session) => {
        if (session.tab && session.tab.sessionId) {
          tabs.push({
            sessionId: session.tab.sessionId,
            title: session.tab.title,
            url: session.tab.url,
            favIconUrl: session.tab.favIconUrl,
          });
        }
      });
      setRecentTabs(tabs);
    });
  }, []);

  useEffect(() => {
    fetchRecent();

    if (chrome.sessions?.onChanged) {
      chrome.sessions.onChanged.addListener(fetchRecent);
      return () => {
        chrome.sessions.onChanged.removeListener(fetchRecent);
      };
    }
  }, [fetchRecent]);

  const restoreSession = useCallback((sessionId: string) => {
    chrome.sessions.restore(sessionId);
  }, []);

  return { recentTabs, restoreSession };
}
