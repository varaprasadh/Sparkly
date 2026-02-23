/**
 * FeedHub Plugin Component
 *
 * A unified feed reader with multiple sources, horizontal tab switching,
 * and inline settings to enable/disable feeds via checkboxes.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PluginProps } from '../../../types/plugin.types';
import { FeedItem, FeedState, FEED_STORAGE_KEY, FEED_CACHE_KEY } from './types';
import { FEED_SOURCES, DEFAULT_ENABLED_FEEDS } from './sources';
import {
  Container,
  Header,
  Title,
  SettingsToggle,
  FeedTabs,
  FeedTab,
  FeedCardsScroll,
  CardList,
  Card,
  CardTitle,
  CardDescription,
  CardMeta,
  MetaItem,
  Tag,
  SettingsPanel,
  SettingsTitle,
  FeedCheckbox,
  FeedCheckboxIcon,
  FeedCheckboxName,
  StateMessage,
} from './styles';

export function FeedHubPlugin({ api }: PluginProps): JSX.Element {
  const [enabledFeeds, setEnabledFeeds] = useState<string[]>(DEFAULT_ENABLED_FEEDS);
  const [activeFeedId, setActiveFeedId] = useState<string>(DEFAULT_ENABLED_FEEDS[0]);
  const [feedStates, setFeedStates] = useState<Record<string, FeedState>>({});
  const [showSettings, setShowSettings] = useState(false);

  // Load enabled feeds from storage
  useEffect(() => {
    chrome.storage.local.get([FEED_STORAGE_KEY], (result) => {
      const saved = result[FEED_STORAGE_KEY];
      if (Array.isArray(saved) && saved.length > 0) {
        setEnabledFeeds(saved);
        // If current active is not in saved, switch to first
        if (!saved.includes(activeFeedId)) {
          setActiveFeedId(saved[0]);
        }
      }
    });
  }, []);

  // Get the enabled source objects in order
  const enabledSources = useMemo(
    () => FEED_SOURCES.filter((s) => enabledFeeds.includes(s.id)),
    [enabledFeeds]
  );

  // Fetch a specific feed
  const fetchFeed = useCallback(async (feedId: string) => {
    const source = FEED_SOURCES.find((s) => s.id === feedId);
    if (!source) return;

    setFeedStates((prev) => ({
      ...prev,
      [feedId]: { items: prev[feedId]?.items || [], loading: true, error: null },
    }));

    try {
      const items = await source.fetcher();
      setFeedStates((prev) => ({
        ...prev,
        [feedId]: { items, loading: false, error: null },
      }));
      // Cache
      chrome.storage.local.get([FEED_CACHE_KEY], (result) => {
        const cache = result[FEED_CACHE_KEY] || {};
        cache[feedId] = { items, timestamp: Date.now() };
        chrome.storage.local.set({ [FEED_CACHE_KEY]: cache });
      });
    } catch (err: any) {
      setFeedStates((prev) => ({
        ...prev,
        [feedId]: {
          items: prev[feedId]?.items || [],
          loading: false,
          error: 'Failed to load. Try again later.',
        },
      }));
    }
  }, []);

  // Load cache and fetch active feed on mount / active change
  useEffect(() => {
    // Load from cache first
    chrome.storage.local.get([FEED_CACHE_KEY], (result) => {
      const cache = result[FEED_CACHE_KEY] || {};
      const cached = cache[activeFeedId];
      if (cached && cached.items) {
        const age = Date.now() - (cached.timestamp || 0);
        setFeedStates((prev) => ({
          ...prev,
          [activeFeedId]: { items: cached.items, loading: age > 5 * 60 * 1000, error: null },
        }));
        // Re-fetch if cache is older than 5 minutes
        if (age > 5 * 60 * 1000) {
          fetchFeed(activeFeedId);
        }
      } else {
        fetchFeed(activeFeedId);
      }
    });
  }, [activeFeedId, fetchFeed]);

  // Toggle a feed on/off
  const handleToggleFeed = useCallback(
    (feedId: string) => {
      setEnabledFeeds((prev) => {
        let next: string[];
        if (prev.includes(feedId)) {
          // Don't allow disabling the last one
          if (prev.length <= 1) return prev;
          next = prev.filter((id) => id !== feedId);
          // If we just disabled the active feed, switch to first remaining
          if (activeFeedId === feedId) {
            setActiveFeedId(next[0]);
          }
        } else {
          next = [...prev, feedId];
        }
        chrome.storage.local.set({ [FEED_STORAGE_KEY]: next });
        return next;
      });
    },
    [activeFeedId]
  );

  const currentState = feedStates[activeFeedId] || { items: [], loading: true, error: null };
  const activeSource = FEED_SOURCES.find((s) => s.id === activeFeedId);

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>Feeds</Title>
        <SettingsToggle onClick={() => setShowSettings(!showSettings)} title="Feed settings">
          ⚙
        </SettingsToggle>
      </Header>

      {/* Settings panel (toggled) */}
      {showSettings && (
        <SettingsPanel>
          <SettingsTitle>Enable Feeds</SettingsTitle>
          {FEED_SOURCES.map((source) => (
            <FeedCheckbox key={source.id}>
              <input
                type="checkbox"
                checked={enabledFeeds.includes(source.id)}
                onChange={() => handleToggleFeed(source.id)}
              />
              <FeedCheckboxIcon>{source.icon}</FeedCheckboxIcon>
              <FeedCheckboxName>{source.name}</FeedCheckboxName>
            </FeedCheckbox>
          ))}
        </SettingsPanel>
      )}

      {/* Feed tabs — horizontally scrollable */}
      <FeedTabs>
        {enabledSources.map((source) => (
          <FeedTab
            key={source.id}
            active={activeFeedId === source.id}
            accentColor={source.color}
            onClick={() => setActiveFeedId(source.id)}
          >
            {source.icon} {source.name}
          </FeedTab>
        ))}
      </FeedTabs>

      {/* Feed items */}
      <FeedCardsScroll>
        {currentState.loading && currentState.items.length === 0 && (
          <StateMessage>Loading {activeSource?.name || 'feed'}...</StateMessage>
        )}
        {currentState.error && currentState.items.length === 0 && (
          <StateMessage>{currentState.error}</StateMessage>
        )}
        <CardList>
          {currentState.items.map((item) => (
            <Card key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
              <CardTitle>{item.title}</CardTitle>
              {item.description && <CardDescription>{item.description}</CardDescription>}
              <CardMeta>
                {item.author && <MetaItem>{item.author}</MetaItem>}
                {item.score !== undefined && <MetaItem>▲ {item.score.toLocaleString()}</MetaItem>}
                {item.comments !== undefined && <MetaItem>💬 {item.comments}</MetaItem>}
                {item.meta && <MetaItem>{item.meta}</MetaItem>}
                {item.tags &&
                  item.tags.map((tag) => (
                    <Tag key={tag}>#{tag}</Tag>
                  ))}
              </CardMeta>
            </Card>
          ))}
        </CardList>
      </FeedCardsScroll>
    </Container>
  );
}
