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
    if (!chrome.sessions?.getRecentlyClosed) return;

    chrome.sessions.getRecentlyClosed({ maxResults: 10 }, (sessions) => {
      if (chrome.runtime.lastError) return;

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
        // Also handle closed windows — extract their tabs
        if (session.window && session.window.sessionId && session.window.tabs) {
          session.window.tabs.forEach((tab) => {
            tabs.push({
              sessionId: session.window!.sessionId!,
              title: tab.title,
              url: tab.url,
              favIconUrl: tab.favIconUrl,
            });
          });
        }
      });
      setRecentTabs(tabs.slice(0, 10));
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
    if (chrome.sessions?.restore) {
      chrome.sessions.restore(sessionId);
    }
  }, []);

  return { recentTabs, restoreSession };
}
