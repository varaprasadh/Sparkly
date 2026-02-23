/**
 * FeedHub Plugin Component
 *
 * A unified feed reader with multiple sources, horizontal tab switching,
 * topic filtering, custom RSS feeds, and multi-column layout toggle.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PluginProps } from '../../../types/plugin.types';
import {
  FeedItem,
  FeedSource,
  FeedState,
  CustomFeed,
  FEED_STORAGE_KEY,
  FEED_CACHE_KEY,
  TOPIC_STORAGE_KEY,
  CUSTOM_FEEDS_KEY,
  LAYOUT_MODE_KEY,
  TOPIC_LIST,
} from './types';
import { FEED_SOURCES, DEFAULT_ENABLED_FEEDS } from './sources';
import { parseRSS } from './rssParser';
import {
  Container,
  Header,
  Title,
  HeaderActions,
  IconButton,
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
  RetryButton,
  SkeletonCard,
  SkeletonLine,
  SkeletonMeta,
  TopicBar,
  TopicChip,
  CustomFeedSection,
  CustomFeedInputRow,
  CustomFeedInput,
  CustomFeedAddBtn,
  CustomFeedItem,
  CustomFeedDeleteBtn,
  MultiColumnGrid,
  ColumnPane,
  ColumnHeader,
  ColumnScroll,
} from './styles';

// ── Relative time helper ──

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 0) return 'just now';

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

// ── Topic matching helper ──

function matchesTopic(item: FeedItem, topics: string[]): boolean {
  if (topics.length === 0) return true;

  const lowerTopics = topics.map((t) => t.toLowerCase());

  // Check tags
  if (item.tags && item.tags.length > 0) {
    return item.tags.some((tag) =>
      lowerTopics.some(
        (topic) => tag.toLowerCase().includes(topic) || topic.includes(tag.toLowerCase())
      )
    );
  }

  // Check meta field (e.g. GitHub Trending language)
  if (item.meta) {
    return lowerTopics.some((topic) => item.meta!.toLowerCase().includes(topic));
  }

  // Untagged items always pass through
  return true;
}

// ── Skeleton placeholder ──

function SkeletonLoader() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} style={{ animationDelay: `${i * 50}ms` }}>
          <SkeletonLine width={`${75 + Math.random() * 25}%`} height="14px" />
          <SkeletonLine width={`${50 + Math.random() * 40}%`} height="11px" />
          <SkeletonMeta>
            <SkeletonLine width="60px" height="10px" />
            <SkeletonLine width="40px" height="10px" />
            <SkeletonLine width="50px" height="10px" />
          </SkeletonMeta>
        </SkeletonCard>
      ))}
    </>
  );
}

// ── Feed Card Renderer ──

function FeedCardList({
  items,
  cardKey,
}: {
  items: FeedItem[];
  cardKey: number;
}) {
  return (
    <CardList key={cardKey}>
      {items.map((item, index) => (
        <Card key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" delay={index}>
          <CardTitle>{item.title}</CardTitle>
          {item.description && <CardDescription>{item.description}</CardDescription>}
          <CardMeta>
            {item.author && <MetaItem>{item.author}</MetaItem>}
            {item.score !== undefined && <MetaItem>▲ {item.score.toLocaleString()}</MetaItem>}
            {item.comments !== undefined && <MetaItem>💬 {item.comments}</MetaItem>}
            {item.time && <MetaItem>{timeAgo(item.time)}</MetaItem>}
            {item.meta && <MetaItem>{item.meta}</MetaItem>}
            {item.tags &&
              item.tags.slice(0, 3).map((tag) => (
                <Tag key={tag}>#{tag}</Tag>
              ))}
          </CardMeta>
        </Card>
      ))}
    </CardList>
  );
}

// ── Main Component ──

export function FeedHubPlugin({ api }: PluginProps): JSX.Element {
  const [enabledFeeds, setEnabledFeeds] = useState<string[]>(DEFAULT_ENABLED_FEEDS);
  const [activeFeedId, setActiveFeedId] = useState<string>(DEFAULT_ENABLED_FEEDS[0]);
  const [feedStates, setFeedStates] = useState<Record<string, FeedState>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  // Topic filtering
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Custom feeds
  const [customFeeds, setCustomFeeds] = useState<CustomFeed[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);

  // Multi-column layout
  const [multiColumn, setMultiColumn] = useState(false);

  // ── Load persisted state ──

  useEffect(() => {
    chrome.storage.local.get(
      [FEED_STORAGE_KEY, TOPIC_STORAGE_KEY, CUSTOM_FEEDS_KEY, LAYOUT_MODE_KEY],
      (result) => {
        const saved = result[FEED_STORAGE_KEY];
        if (Array.isArray(saved) && saved.length > 0) {
          setEnabledFeeds(saved);
          if (!saved.includes(activeFeedId)) {
            setActiveFeedId(saved[0]);
          }
        }

        const savedTopics = result[TOPIC_STORAGE_KEY];
        if (Array.isArray(savedTopics)) {
          setSelectedTopics(savedTopics);
        }

        const savedCustom = result[CUSTOM_FEEDS_KEY];
        if (Array.isArray(savedCustom)) {
          setCustomFeeds(savedCustom);
        }

        if (result[LAYOUT_MODE_KEY] === 'multi') {
          setMultiColumn(true);
        }
      }
    );
  }, []);

  // ── Build complete source list (built-in + custom) ──

  const customSources: FeedSource[] = useMemo(
    () =>
      customFeeds.map((cf) => ({
        id: cf.id,
        name: cf.name,
        icon: cf.icon || '📡',
        color: cf.color || '#666',
        fetcher: async (): Promise<FeedItem[]> => {
          const res = await fetch(cf.url);
          if (!res.ok) throw new Error(`Failed to fetch ${cf.name}`);
          const xml = await res.text();
          return parseRSS(xml, 20).map((item, i) => ({
            ...item,
            id: `custom-${cf.id}-${i}-${item.url}`,
          }));
        },
      })),
    [customFeeds]
  );

  const allSources = useMemo(
    () => [...FEED_SOURCES, ...customSources],
    [customSources]
  );

  const enabledSources = useMemo(
    () => allSources.filter((s) => enabledFeeds.includes(s.id)),
    [enabledFeeds, allSources]
  );

  // ── Fetch feed ──

  const fetchFeed = useCallback(
    async (feedId: string, isManualRefresh = false) => {
      const source = allSources.find((s) => s.id === feedId);
      if (!source) return;

      if (isManualRefresh) setRefreshing(true);

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
        setCardKey((k) => k + 1);
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
            error: 'Failed to load feed.',
          },
        }));
      } finally {
        if (isManualRefresh) setRefreshing(false);
      }
    },
    [allSources]
  );

  // ── Cache + fetch on active change ──

  useEffect(() => {
    chrome.storage.local.get([FEED_CACHE_KEY], (result) => {
      const cache = result[FEED_CACHE_KEY] || {};
      const cached = cache[activeFeedId];
      if (cached && cached.items) {
        const age = Date.now() - (cached.timestamp || 0);
        setFeedStates((prev) => ({
          ...prev,
          [activeFeedId]: { items: cached.items, loading: age > 5 * 60 * 1000, error: null },
        }));
        setCardKey((k) => k + 1);
        if (age > 5 * 60 * 1000) {
          fetchFeed(activeFeedId);
        }
      } else {
        fetchFeed(activeFeedId);
      }
    });
  }, [activeFeedId, fetchFeed]);

  // ── Multi-column: fetch all enabled feeds on mount ──

  useEffect(() => {
    if (multiColumn) {
      enabledSources.forEach((source) => {
        const state = feedStates[source.id];
        if (!state || (state.items.length === 0 && !state.loading)) {
          // Load from cache or fetch
          chrome.storage.local.get([FEED_CACHE_KEY], (result) => {
            const cache = result[FEED_CACHE_KEY] || {};
            const cached = cache[source.id];
            if (cached && cached.items) {
              const age = Date.now() - (cached.timestamp || 0);
              setFeedStates((prev) => ({
                ...prev,
                [source.id]: { items: cached.items, loading: age > 5 * 60 * 1000, error: null },
              }));
              if (age > 5 * 60 * 1000) {
                fetchFeed(source.id);
              }
            } else {
              fetchFeed(source.id);
            }
          });
        }
      });
    }
  }, [multiColumn, enabledSources.length]);

  // ── Toggle feed on/off ──

  const handleToggleFeed = useCallback(
    (feedId: string) => {
      setEnabledFeeds((prev) => {
        let next: string[];
        if (prev.includes(feedId)) {
          if (prev.length <= 1) return prev;
          next = prev.filter((id) => id !== feedId);
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

  // ── Topic toggle ──

  const handleToggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) => {
      const next = prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic];
      chrome.storage.local.set({ [TOPIC_STORAGE_KEY]: next });
      return next;
    });
  }, []);

  // ── Custom feed add/remove ──

  const handleAddCustomFeed = useCallback(async () => {
    if (!customUrl.trim() || !customName.trim()) return;
    setAddingCustom(true);

    try {
      // Validate by attempting to fetch and parse
      const res = await fetch(customUrl.trim());
      if (!res.ok) throw new Error('Could not fetch URL');
      const xml = await res.text();
      const items = parseRSS(xml, 5);
      if (items.length === 0) throw new Error('No feed items found');

      const newFeed: CustomFeed = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        url: customUrl.trim(),
        icon: '📡',
        color: '#666',
      };

      setCustomFeeds((prev) => {
        const next = [...prev, newFeed];
        chrome.storage.local.set({ [CUSTOM_FEEDS_KEY]: next });
        return next;
      });

      // Auto-enable the new feed
      setEnabledFeeds((prev) => {
        const next = [...prev, newFeed.id];
        chrome.storage.local.set({ [FEED_STORAGE_KEY]: next });
        return next;
      });

      setCustomUrl('');
      setCustomName('');
    } catch (err) {
      alert('Failed to add feed. Make sure the URL is a valid RSS/Atom feed.');
    } finally {
      setAddingCustom(false);
    }
  }, [customUrl, customName]);

  const handleRemoveCustomFeed = useCallback(
    (feedId: string) => {
      setCustomFeeds((prev) => {
        const next = prev.filter((f) => f.id !== feedId);
        chrome.storage.local.set({ [CUSTOM_FEEDS_KEY]: next });
        return next;
      });
      setEnabledFeeds((prev) => {
        const next = prev.filter((id) => id !== feedId);
        chrome.storage.local.set({ [FEED_STORAGE_KEY]: next });
        return next;
      });
      if (activeFeedId === feedId) {
        setActiveFeedId(enabledFeeds[0] || DEFAULT_ENABLED_FEEDS[0]);
      }
    },
    [activeFeedId, enabledFeeds]
  );

  // ── Layout toggle ──

  const handleToggleLayout = useCallback(() => {
    setMultiColumn((prev) => {
      const next = !prev;
      chrome.storage.local.set({ [LAYOUT_MODE_KEY]: next ? 'multi' : 'single' });
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    if (multiColumn) {
      enabledSources.forEach((s) => fetchFeed(s.id, false));
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 2000);
    } else {
      fetchFeed(activeFeedId, true);
    }
  }, [activeFeedId, fetchFeed, multiColumn, enabledSources]);

  const handleTabSwitch = useCallback((feedId: string) => {
    setActiveFeedId(feedId);
    setCardKey((k) => k + 1);
  }, []);

  // ── Filter items by topic ──

  const filterItems = useCallback(
    (items: FeedItem[]): FeedItem[] => {
      if (selectedTopics.length === 0) return items;
      return items.filter((item) => matchesTopic(item, selectedTopics));
    },
    [selectedTopics]
  );

  const currentState = feedStates[activeFeedId] || { items: [], loading: true, error: null };
  const filteredItems = filterItems(currentState.items);

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>Feeds</Title>
        <HeaderActions>
          <IconButton
            onClick={handleToggleLayout}
            title={multiColumn ? 'Single column view' : 'Multi-column view'}
          >
            {multiColumn ? '▤' : '▥'}
          </IconButton>
          <IconButton onClick={handleRefresh} spinning={refreshing} title="Refresh feed">
            ↻
          </IconButton>
          <IconButton onClick={() => setShowSettings(!showSettings)} title="Feed settings">
            ⚙
          </IconButton>
        </HeaderActions>
      </Header>

      {/* Settings panel (toggled) */}
      {showSettings && (
        <SettingsPanel>
          <SettingsTitle>Enable Feeds</SettingsTitle>
          {allSources.map((source) => (
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

          {/* Custom RSS Feeds */}
          <CustomFeedSection>
            <SettingsTitle>Custom RSS Feeds</SettingsTitle>
            {customFeeds.map((cf) => (
              <CustomFeedItem key={cf.id}>
                <span>📡 {cf.name}</span>
                <CustomFeedDeleteBtn onClick={() => handleRemoveCustomFeed(cf.id)} title="Remove">
                  ✕
                </CustomFeedDeleteBtn>
              </CustomFeedItem>
            ))}
            <CustomFeedInputRow>
              <CustomFeedInput
                placeholder="Feed name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{ maxWidth: '120px' }}
              />
              <CustomFeedInput
                placeholder="RSS/Atom URL"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomFeed()}
              />
              <CustomFeedAddBtn
                onClick={handleAddCustomFeed}
                disabled={addingCustom || !customUrl.trim() || !customName.trim()}
              >
                {addingCustom ? '...' : 'Add'}
              </CustomFeedAddBtn>
            </CustomFeedInputRow>
          </CustomFeedSection>
        </SettingsPanel>
      )}

      {/* Topic filter chips */}
      <TopicBar>
        <TopicChip
          active={selectedTopics.length === 0}
          onClick={() => {
            setSelectedTopics([]);
            chrome.storage.local.set({ [TOPIC_STORAGE_KEY]: [] });
          }}
        >
          All
        </TopicChip>
        {TOPIC_LIST.map((topic) => (
          <TopicChip
            key={topic}
            active={selectedTopics.includes(topic)}
            onClick={() => handleToggleTopic(topic)}
          >
            {topic}
          </TopicChip>
        ))}
      </TopicBar>

      {/* Feed tabs — only in single-column mode */}
      {!multiColumn && (
        <FeedTabs>
          {enabledSources.map((source) => (
            <FeedTab
              key={source.id}
              active={activeFeedId === source.id}
              accentColor={source.color}
              onClick={() => handleTabSwitch(source.id)}
            >
              {source.icon} {source.name}
            </FeedTab>
          ))}
        </FeedTabs>
      )}

      {/* Single-column view */}
      {!multiColumn && (
        <FeedCardsScroll>
          {currentState.loading && currentState.items.length === 0 && <SkeletonLoader />}
          {currentState.error && currentState.items.length === 0 && (
            <StateMessage>
              {currentState.error}
              <RetryButton onClick={handleRefresh}>Retry</RetryButton>
            </StateMessage>
          )}
          {filteredItems.length === 0 && currentState.items.length > 0 && !currentState.loading && (
            <StateMessage>No items match the selected topics.</StateMessage>
          )}
          <FeedCardList items={filteredItems} cardKey={cardKey} />
        </FeedCardsScroll>
      )}

      {/* Multi-column view */}
      {multiColumn && (
        <MultiColumnGrid>
          {enabledSources.slice(0, 3).map((source) => {
            const state = feedStates[source.id] || { items: [], loading: true, error: null };
            const filtered = filterItems(state.items);
            return (
              <ColumnPane key={source.id}>
                <ColumnHeader accentColor={source.color}>
                  {source.icon} {source.name}
                </ColumnHeader>
                <ColumnScroll>
                  {state.loading && state.items.length === 0 && <SkeletonLoader />}
                  {state.error && state.items.length === 0 && (
                    <StateMessage>
                      {state.error}
                      <RetryButton onClick={() => fetchFeed(source.id, true)}>Retry</RetryButton>
                    </StateMessage>
                  )}
                  {filtered.length === 0 && state.items.length > 0 && !state.loading && (
                    <StateMessage>No matches.</StateMessage>
                  )}
                  <FeedCardList items={filtered} cardKey={cardKey} />
                </ColumnScroll>
              </ColumnPane>
            );
          })}
        </MultiColumnGrid>
      )}
    </Container>
  );
}
