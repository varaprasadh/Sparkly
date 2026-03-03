/// <reference types="chrome"/>
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useSettings } from '../../store/hooks';
import { useTabQuery } from './TabManager/useTabQuery';
import googleIcon from '../../assets/images/google.png';
import yahooIcon from '../../assets/images/yahoo.png';
import bingIcon from '../../assets/images/bing.png';
import duckDuckGoIcon from '../../assets/images/duckduckgo.png';
import chatgptIcon from '../../assets/images/chatgpt.png';
import claudeIcon from '../../assets/images/claude.png';

const SEARCH_ENGINE_ICONS: Record<string, string> = {
  google: googleIcon,
  bing: bingIcon,
  yahoo: yahooIcon,
  duckduckgo: duckDuckGoIcon,
  chatgpt: chatgptIcon,
  claude: claudeIcon,
};


interface SearchResult {
  type: 'tab' | 'suggestion' | 'search';
  title: string;
  subtitle?: string;
  icon?: string;
  url?: string;
  action: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 1000;
`;

const SearchContainer = styled.div`
  width: 600px;
  max-width: 90vw;
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideIn 0.15s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: contain;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  font-size: 18px;
  color: white;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ShortcutHint = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 12px;
`;

const ResultsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const ResultItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  background: ${(props) => props.selected ? 'rgba(59, 130, 246, 0.2)' : 'transparent'};
  transition: background 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ResultIcon = styled.div<{ isTab?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${(props) => props.isTab ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
  overflow: hidden;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
`;

const ResultText = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  color: white;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSubtitle = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultAction = styled.div`
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  margin-left: 12px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
`;

const FooterHint = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const KeyboardKey = styled.span`
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
`;

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalSearch({ isOpen, onClose }: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  const isMounted = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { general } = useSettings();
  const { allTabs } = useTabQuery();
  const allTabsRef = useRef(allTabs);

  // Keep refs current without triggering effects
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { allTabsRef.current = allTabs; }, [allTabs]);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Get search engine URL
  const getSearchURL = useCallback((q: string) => {
    const engines: Record<string, (q: string) => string> = {
      google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
      yahoo: (q) => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}`,
      duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      chatgpt: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
      claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
    };
    return engines[general.searchEngine]?.(q) || engines.google(q);
  }, [general.searchEngine]);

  // Fetch auto-suggestions with debounce
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();
        const results = data[1] as string[];
        if (isMounted.current) {
          setSuggestions(results.slice(0, 4));
        }
      } catch {
        if (isMounted.current) {
          setSuggestions([]);
        }
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, isOpen]);

  // Build results - computed directly, no effect needed
  const buildResults = useCallback((): SearchResult[] => {
    const tabs = allTabsRef.current;
    const close = () => onCloseRef.current();
    const newResults: SearchResult[] = [];

    if (query.trim()) {
      // Matched tabs
      const matchedTabs = tabs
        .filter(tab =>
          tab.title?.toLowerCase().includes(query.toLowerCase()) ||
          tab.url?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map(tab => ({
          type: 'tab' as const,
          title: tab.title || tab.url || 'Untitled',
          subtitle: tab.url,
          icon: tab.favIconUrl,
          action: () => {
            if (tab.id) {
              chrome.tabs.update(tab.id, { active: true });
            }
            close();
          }
        }));

      if (matchedTabs.length > 0) {
        newResults.push(...matchedTabs);
      }

      // Search option for current query
      newResults.push({
        type: 'search',
        title: `Search "${query}"`,
        subtitle: general.searchEngine,
        action: () => {
          window.open(getSearchURL(query), '_blank');
          close();
        }
      });

      // Auto-suggestions
      suggestions.forEach(s => {
        if (s.toLowerCase() !== query.toLowerCase()) {
          newResults.push({
            type: 'suggestion',
            title: s,
            action: () => {
              window.open(getSearchURL(s), '_blank');
              close();
            }
          });
        }
      });
    } else {
      // Show recent tabs when no query
      const recentTabs = tabs.slice(0, 5).map(tab => ({
        type: 'tab' as const,
        title: tab.title || tab.url || 'Untitled',
        subtitle: tab.url,
        icon: tab.favIconUrl,
        action: () => {
          if (tab.id) {
            chrome.tabs.update(tab.id, { active: true });
          }
          close();
        }
      }));

      if (recentTabs.length > 0) {
        newResults.push(...recentTabs);
      }

      newResults.push({
        type: 'suggestion',
        title: 'Type to search the web',
        action: () => {}
      });
    }

    return newResults;
  }, [query, suggestions, general.searchEngine, getSearchURL]);

  const results = buildResults();

  // Reset selected index only when query changes
  const prevQueryRef = useRef(query);
  useEffect(() => {
    if (prevQueryRef.current !== query) {
      prevQueryRef.current = query;
      setSelectedIndex(0);
    }
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle keyboard from input's onKeyDown
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Handle Escape at document level
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <SearchContainer onClick={e => e.stopPropagation()}>
        <SearchInputWrapper>
          <SearchIcon>
            <img src={SEARCH_ENGINE_ICONS[general.searchEngine] || SEARCH_ENGINE_ICONS.google} alt="" />
          </SearchIcon>
          <SearchInput
            ref={inputRef}
            defaultValue=""
            onChange={e => {
              const val = e.target.value;
              setQuery(val);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search tabs, or type to search..."
            autoFocus
          />
          <ShortcutHint>esc to close</ShortcutHint>
        </SearchInputWrapper>

        <ResultsList>
          {results.map((result, index) => (
            <ResultItem
              key={index}
              selected={index === selectedIndex}
              onClick={result.action}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <ResultIcon isTab={result.type === 'tab'}>
                {result.type === 'tab' ? (
                  result.icon ? (
                    <img src={result.icon} alt="" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  ) : '📄'
                ) : '🔍'}
              </ResultIcon>
              <ResultText>
                <ResultTitle>{result.title}</ResultTitle>
                {result.subtitle && <ResultSubtitle>{result.subtitle}</ResultSubtitle>}
              </ResultText>
              {result.type === 'search' && <ResultAction>Enter to search</ResultAction>}
            </ResultItem>
          ))}
        </ResultsList>

        <Footer>
          <FooterHint>
            <KeyboardKey>↑</KeyboardKey>
            <KeyboardKey>↓</KeyboardKey>
            to navigate
          </FooterHint>
          <FooterHint>
            <KeyboardKey>↵</KeyboardKey>
            to select
          </FooterHint>
        </Footer>
      </SearchContainer>
    </Overlay>
  );
}

export default UniversalSearch;
