/// <reference types="chrome"/>
import { useState, useEffect, useCallback } from 'react';
import type { SavedSession } from './types';
import { STORAGE_KEYS } from './constants';

export function useSavedSessions() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEYS.sessions, (result) => {
      setSessions(result[STORAGE_KEYS.sessions] || []);
    });
  }, []);

  const saveSession = useCallback((name: string) => {
    chrome.tabs.query({}, (tabs) => {
      const windowMap = new Map<number, { url: string; title?: string }[]>();

      tabs.forEach((tab) => {
        if (!tab.url) return;
        const existing = windowMap.get(tab.windowId) || [];
        existing.push({ url: tab.url, title: tab.title });
        windowMap.set(tab.windowId, existing);
      });

      const newSession: SavedSession = {
        id: Date.now().toString(36),
        name,
        timestamp: Date.now(),
        windows: Array.from(windowMap.values()).map((tabList) => ({ tabs: tabList })),
      };

      chrome.storage.local.get(STORAGE_KEYS.sessions, (result) => {
        const existing: SavedSession[] = result[STORAGE_KEYS.sessions] || [];
        const updated = [newSession, ...existing];
        chrome.storage.local.set({ [STORAGE_KEYS.sessions]: updated });
        setSessions(updated);
      });
    });
  }, []);

  const restoreSession = useCallback((session: SavedSession) => {
    session.windows.forEach((win) => {
      const urls = win.tabs.map((t) => t.url);
      chrome.windows.create({ url: urls });
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    chrome.storage.local.get(STORAGE_KEYS.sessions, (result) => {
      const existing: SavedSession[] = result[STORAGE_KEYS.sessions] || [];
      const updated = existing.filter((s) => s.id !== id);
      chrome.storage.local.set({ [STORAGE_KEYS.sessions]: updated });
      setSessions(updated);
    });
  }, []);

  return { sessions, saveSession, restoreSession, deleteSession };
}
