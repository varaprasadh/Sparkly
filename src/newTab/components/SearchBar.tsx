/// <reference types="chrome"/>
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';

import searchIcon from '../../icons/search_icon.png';
import downArrow from '../../assets/svg/down_arrow.svg';
import returnKey from '../../assets/svg/return-key.svg';
import googleIcon from '../../assets/images/google.png';
import yahooIcon from '../../assets/images/yahoo.png';
import bingIcon from '../../assets/images/bing.png';
import duckDuckGoIcon from '../../assets/images/duckduckgo.png';
import { getObjectFromStorageLocal } from '../../helpers/storage';

// Types
interface SearchEngine {
  id: string;
  label: string;
  icon: string;
  getSearchURL: (query: string) => string;
}

interface SearchEngineSelectorProps {
  onEngineChange: (engineId: string) => void;
  searchEngines: SearchEngine[];
  currentEngineId: string;
}

// Constants
const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    label: 'Google',
    icon: googleIcon,
    getSearchURL: (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'bing',
    label: 'Bing',
    icon: bingIcon,
    getSearchURL: (query: string) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'yahoo',
    label: 'Yahoo',
    icon: yahooIcon,
    getSearchURL: (query: string) => `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`,
  },
  {
    id: 'duckduckgo',
    label: 'Duck Duck Go',
    icon: duckDuckGoIcon,
    getSearchURL: (query: string) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  },
];

const DEBOUNCE_DELAY = 300;

// Styled components
const StyledSearchBar = styled.div`
  box-sizing: border-box;
  border-radius: 50px;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  margin: 1.5rem auto;
  position: relative;
  z-index: 100;
  max-width: 600px;
  width: 100%;
  padding: 0.2rem 0.5rem;
  transition: all 0.3s ease;
  
  &:focus-within {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const StyledSearchWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  flex: 1;
  margin-left: -0.5rem;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.8rem 1rem;
  font-size: 1.25rem;
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
  }
`;

const StyledSearchIcon = styled.img`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  margin-right: 0.8rem;
  transition: all 0.2s ease;
  filter: invert(1);
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.9);
  }
`;

const StyledSuggestionsWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0%;
  right: 0%;
  z-index: 99;
  background: white;
  margin-top: 0.2rem;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const StyledSuggestion = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  background: ${(props) => (props.isActive ? '#efefef' : 'transparent')};
  &:hover {
    background: #efefef;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

const StyledSuggestionPreIcon = styled.div`
  width: 5rem;
  display: flex;
  justify-content: center;
`;

const StyledSuggestionPostIcon = styled.div<{ isVisible: boolean }>`
  justify-self: flex-end;
  margin-left: auto;
  margin-right: 0.5rem;
  & > img {
    width: 24px;
    display: ${(props) => (props.isVisible ? 'block' : 'none')};
  }
`;

const StyledSearchEngineSelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem;
`;

const StyledSearchEngineSelectValue = styled.div`
  display: flex;
  align-items: center;
  & > img {
    width: 24px;
    border-radius: 50%;
  }
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StyledSearchEngineOptions = styled.div`
  position: absolute;
  top: 100%;
  left: 0%;
  background: white;
  margin-top: 0.5rem;
  z-index: 99;
  margin-left: 0.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  width: 150px;
  border: 1px solid #efefef;
  filter: drop-shadow(2px 2px 4px black);
`;

const StyledSearchEngineOption = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem 0.5rem;
  cursor: pointer;
  & > img {
    width: 24px;
  }
  & > span {
    font-size: 1rem;
    margin-left: 0.5rem;
  }
  &:hover {
    background: #efefef;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

/**
 * Debounce utility function
 */
function debounce<T extends (...args: string[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Search Engine Selector Component
 */
function SearchEngineSelector({
  onEngineChange,
  searchEngines,
  currentEngineId = 'google',
}: SearchEngineSelectorProps): JSX.Element {
  const [show, setShow] = useState(false);

  const setEngine = (engineId: string): void => {
    setShow(false);
    onEngineChange(engineId);
  };

  const currentEngineInfo = searchEngines.find((e) => e.id === currentEngineId);

  return (
    <OutsideClickHandler onOutsideClick={() => setShow(false)}>
      <StyledSearchEngineSelectWrapper>
        <StyledSearchEngineSelectValue onClick={() => setShow(!show)} title="Select Search Engine">
          <img src={currentEngineInfo?.icon} alt="search engine" />
        </StyledSearchEngineSelectValue>
        {show && (
          <StyledSearchEngineOptions>
            {searchEngines.map((engine) => (
              <StyledSearchEngineOption
                key={engine.id}
                onClick={() => setEngine(engine.id)}
              >
                <img src={engine.icon} alt={engine.label} />
                <span>{engine.label}</span>
              </StyledSearchEngineOption>
            ))}
          </StyledSearchEngineOptions>
        )}
      </StyledSearchEngineSelectWrapper>
    </OutsideClickHandler>
  );
}

/**
 * Main SearchBar Component
 */
export default function SearchBar(): JSX.Element {
  const [queryText, setQueryText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [engineId, setSearchEngineId] = useState('google');
  const isMounted = useRef(true);

  const doSearch = useCallback(
    (query: string): void => {
      const engine = SEARCH_ENGINES.find((e) => e.id === engineId);
      if (engine) {
        window.location.href = engine.getSearchURL(query);
      }
    },
    [engineId]
  );

  const search = useCallback((): void => {
    const trimmedQuery = queryText.trim();
    if (trimmedQuery === '') return;
    doSearch(trimmedQuery);
  }, [queryText, doSearch]);

  const selectAndSearch = useCallback(
    (value: string): void => {
      doSearch(value);
    },
    [doSearch]
  );

  const getSuggestions = useCallback(async (value: string): Promise<void> => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Use HTTPS for security
      const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(value)}`;
      const response = await fetch(url);
      const data = await response.json();
      const results = data[1] as string[];

      if (isMounted.current) {
        setShowSuggestions(results.length > 0);
        setSuggestions(results);
      }
    } catch {
      // Silently fail - suggestions are not critical
      if (isMounted.current) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetSuggestions = useCallback(
    debounce((value: string) => getSuggestions(value), DEBOUNCE_DELAY),
    [getSuggestions]
  );

  const onSearchEngineChange = useCallback((newEngineId: string): void => {
    setSearchEngineId(newEngineId);
    chrome.storage.local.set({ searchEngineId: newEngineId });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        search();
      }
    },
    [search]
  );

  // Load saved search engine on mount
  useEffect(() => {
    isMounted.current = true;

    const loadSearchEngine = async (): Promise<void> => {
      try {
        const result = await getObjectFromStorageLocal('searchEngineId');
        const savedEngineId = (result as { searchEngineId?: string })?.searchEngineId;
        if (savedEngineId && isMounted.current) {
          setSearchEngineId(savedEngineId);
        }
      } catch {
        // Use default engine
      }
    };

    loadSearchEngine();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    setActiveSuggestionIndex(-1);
    debouncedGetSuggestions(queryText);
  }, [queryText, debouncedGetSuggestions]);

  // Handle keyboard navigation in suggestions
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev <= 0 ? suggestions.length - 1 : prev - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev >= suggestions.length - 1 ? 0 : prev + 1
          );
          break;
        case 'Enter':
          if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
            e.preventDefault();
            const query = suggestions[activeSuggestionIndex];
            doSearch(query);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [suggestions, activeSuggestionIndex, doSearch]);

  return (
    <StyledSearchBar>
      <SearchEngineSelector
        onEngineChange={onSearchEngineChange}
        currentEngineId={engineId}
        searchEngines={SEARCH_ENGINES}
      />
      <StyledSearchWrapper>
        <StyledInput
          type="text"
          placeholder="Search here..."
          value={queryText}
          onKeyDown={handleKeyDown}
          onChange={(e) => setQueryText(e.target.value)}
        />
        <StyledSearchIcon src={searchIcon} alt="search" onClick={search} />
      </StyledSearchWrapper>
      {showSuggestions && (
        <OutsideClickHandler onOutsideClick={() => setShowSuggestions(false)}>
          <StyledSuggestionsWrapper>
            {suggestions.map((suggestion, i) => (
              <StyledSuggestion
                key={suggestion}
                isActive={i === activeSuggestionIndex}
                onClick={() => selectAndSearch(suggestion)}
              >
                <StyledSuggestionPreIcon />
                <div>{suggestion}</div>
                <StyledSuggestionPostIcon isVisible={i === activeSuggestionIndex}>
                  <img src={returnKey} alt="enter" />
                </StyledSuggestionPostIcon>
              </StyledSuggestion>
            ))}
          </StyledSuggestionsWrapper>
        </OutsideClickHandler>
      )}
    </StyledSearchBar>
  );
}
