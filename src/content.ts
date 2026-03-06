/// <reference types="chrome"/>

const STORAGE_KEY = 'settings:general';

// ── Link Handling ─────────────────────────────────────────────────────────────

function handleClick(e: MouseEvent): void {
  const target = e.target as Element;
  const anchor = target.closest('a');
  if (!anchor) return;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('javascript:') || href.startsWith('#') || href === '') return;
  if (anchor.target === '_blank' || anchor.target === '_self') return;

  if (e.metaKey || e.ctrlKey || e.shiftKey) return;

  e.preventDefault();
  e.stopPropagation();
  window.open(anchor.href, '_blank', 'noopener,noreferrer');
}

function applySettings(enabled: boolean): void {
  if (enabled) {
    document.addEventListener('click', handleClick, true);
  } else {
    document.removeEventListener('click', handleClick, true);
  }
}

chrome.storage.local.get(STORAGE_KEY, (result) => {
  const general = result[STORAGE_KEY] as { openLinksInNewTab?: boolean } | undefined;
  applySettings(!!general?.openLinksInNewTab);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]) return;
  const newValue = changes[STORAGE_KEY].newValue as { openLinksInNewTab?: boolean } | undefined;
  applySettings(!!newValue?.openLinksInNewTab);
});

// ── Global Search (Cmd/Ctrl+Shift+K) ─────────────────────────────────────────

interface TabInfo {
  id?: number;
  title?: string;
  url?: string;
  favIconUrl?: string;
  windowId?: number;
}

interface SearchResult {
  type: 'tab' | 'search';
  title: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  action: () => void;
}

let searchHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let searchInput: HTMLInputElement | null = null;
let resultsContainer: HTMLElement | null = null;
let selectedIndex = 0;
let results: SearchResult[] = [];
let searchEngine = 'google';

const SEARCH_ENGINE_URLS: Record<string, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  yahoo: (q) => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  chatgpt: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
  claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
};

let globalSearchEnabled = true;

function applyGlobalSearchSetting(settings: { searchEngine?: string; globalSearch?: boolean }): void {
  if (settings.searchEngine) searchEngine = settings.searchEngine;
  globalSearchEnabled = settings.globalSearch !== false;
  if (!globalSearchEnabled) closeSearch();
}

chrome.storage.local.get(STORAGE_KEY, (result) => {
  const general = result[STORAGE_KEY] as { searchEngine?: string; globalSearch?: boolean } | undefined;
  if (general) applyGlobalSearchSetting(general);
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]) return;
  const newValue = changes[STORAGE_KEY].newValue as { searchEngine?: string; globalSearch?: boolean } | undefined;
  if (newValue) applyGlobalSearchSetting(newValue);
});

function getSearchURL(q: string): string {
  return SEARCH_ENGINE_URLS[searchEngine]?.(q) || SEARCH_ENGINE_URLS.google(q);
}

async function queryTabs(): Promise<TabInfo[]> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_TABS' }, (tabs: TabInfo[]) => {
      resolve(tabs || []);
    });
  });
}

function switchTab(tabId: number, windowId?: number): void {
  chrome.runtime.sendMessage({ type: 'SWITCH_TAB', tabId, windowId });
}

function navigateToSearch(url: string): void {
  chrome.runtime.sendMessage({ type: 'SEARCH_NAVIGATE', url });
}

async function getSuggestions(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_SUGGESTIONS', query }, (suggestions: string[]) => {
      resolve(suggestions || []);
    });
  });
}

function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function search(query: string): Promise<void> {
  if (!resultsContainer) return;

  results = [];
  selectedIndex = 0;

  try {
    const tabs = await queryTabs();

    if (!query.trim()) {
      results = tabs.slice(0, 10).map((tab) => ({
        type: 'tab' as const,
        title: tab.title || 'Untitled',
        subtitle: tab.url ? new URL(tab.url).hostname : '',
        url: tab.url,
        icon: tab.favIconUrl || '',
        action: () => { if (tab.id) switchTab(tab.id, tab.windowId); closeSearch(); },
      }));
    } else {
      const q = query.toLowerCase();
      const matchedTabs = tabs
        .filter((tab) => (tab.title?.toLowerCase().includes(q) || tab.url?.toLowerCase().includes(q)))
        .slice(0, 5)
        .map((tab) => ({
          type: 'tab' as const,
          title: tab.title || 'Untitled',
          subtitle: tab.url ? new URL(tab.url).hostname : '',
          url: tab.url,
          icon: tab.favIconUrl || '',
          action: () => { if (tab.id) switchTab(tab.id, tab.windowId); closeSearch(); },
        }));

      // Always include "Search <query>" option
      const searchOption: SearchResult = {
        type: 'search',
        title: `Search "${query}"`,
        subtitle: searchEngine,
        action: () => { navigateToSearch(getSearchURL(query)); closeSearch(); },
      };

      const suggestions = await getSuggestions(query);
      const suggestionResults = suggestions
        .filter((s) => s.toLowerCase() !== query.toLowerCase())
        .map((s) => ({
          type: 'search' as const,
          title: s,
          subtitle: `Search ${searchEngine}`,
          action: () => { navigateToSearch(getSearchURL(s)); closeSearch(); },
        }));

      results = [...matchedTabs, searchOption, ...suggestionResults];
    }
  } catch (err) {
    console.error('Sparkly search error:', err);
  }

  renderResults();
}

function renderResults(): void {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'gs-empty';
    empty.textContent = 'No results';
    resultsContainer.appendChild(empty);
    return;
  }

  results.forEach((r, i) => {
    const el = document.createElement('div');
    el.className = `gs-result${i === selectedIndex ? ' selected' : ''}`;

    const icon = document.createElement('span');
    icon.className = 'gs-icon';
    if (r.type === 'tab' && r.icon) {
      const img = document.createElement('img');
      img.src = r.icon;
      img.onerror = () => { img.style.display = 'none'; icon.textContent = '\u{1F4C4}'; };
      icon.appendChild(img);
    } else {
      icon.textContent = r.type === 'tab' ? '\u{1F4C4}' : '\u{1F50D}';
    }

    const title = document.createElement('span');
    title.className = 'gs-title';
    title.textContent = r.title;

    const subtitle = document.createElement('span');
    subtitle.className = 'gs-subtitle';
    subtitle.textContent = r.subtitle || '';

    el.appendChild(icon);
    el.appendChild(title);
    el.appendChild(subtitle);
    el.onclick = () => r.action();
    el.onmouseenter = () => { selectedIndex = i; updateSelection(); };
    resultsContainer!.appendChild(el);
  });

  // Scroll selected into view
  const selected = resultsContainer.querySelector('.gs-result.selected');
  if (selected) selected.scrollIntoView({ block: 'nearest' });
}

function updateSelection(): void {
  if (!resultsContainer) return;
  const els = resultsContainer.querySelectorAll('.gs-result');
  els.forEach((el, i) => el.classList.toggle('selected', i === selectedIndex));
  const selected = resultsContainer.querySelector('.gs-result.selected');
  if (selected) selected.scrollIntoView({ block: 'nearest' });
}

// Block the page from stealing focus while the search overlay is open
function trapFocus(e: FocusEvent): void {
  if (!searchHost || !searchInput) return;
  // If focus is moving to something outside our shadow DOM, reclaim it
  const target = e.target as Node;
  if (!searchHost.contains(target) && !searchHost.shadowRoot?.contains(target)) {
    e.stopImmediatePropagation();
    searchInput.focus();
  }
}

function swallowEvent(e: Event): void {
  e.stopImmediatePropagation();
}

function closeSearch(): void {
  document.removeEventListener('focus', trapFocus, true);
  document.removeEventListener('keydown', handleSearchKeydown, true);
  document.removeEventListener('keyup', swallowEvent, true);
  document.removeEventListener('keypress', swallowEvent, true);
  if (searchHost) {
    searchHost.remove();
    searchHost = null;
    shadowRoot = null;
    searchInput = null;
    resultsContainer = null;
  }
}

function handleSearchKeydown(e: KeyboardEvent): void {
  // Stop ALL keyboard events from reaching the page while overlay is open
  e.stopImmediatePropagation();

  if (e.key === 'Escape') {
    e.preventDefault();
    closeSearch();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    updateSelection();
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, 0);
    updateSelection();
    return;
  }
  if (e.key === 'Enter' && results[selectedIndex]) {
    e.preventDefault();
    results[selectedIndex].action();
    return;
  }
}

let searchTimeout: number;
function handleSearchInput(e: Event): void {
  const query = (e.target as HTMLInputElement).value;
  clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(() => search(query), 150);
}

const SEARCH_STYLES = `
  :host {
    all: initial;
    position: fixed; inset: 0; z-index: 2147483647;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .gs-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 15vh;
  }
  .gs-container {
    width: 600px; max-width: 90vw; background: rgba(30,30,30,0.98);
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5); overflow: hidden;
    animation: slideIn 0.15s ease-out;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .gs-input-wrap {
    display: flex; align-items: center; padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .gs-search-icon { margin-right: 12px; color: rgba(255,255,255,0.5); font-size: 18px; }
  .gs-input {
    flex: 1; background: transparent; border: none; font-size: 18px;
    color: white; outline: none; font-family: inherit;
  }
  .gs-input::placeholder { color: rgba(255,255,255,0.4); }
  .gs-esc-hint {
    font-size: 12px; color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 4px;
    margin-left: 12px; white-space: nowrap;
  }
  .gs-results { max-height: 400px; overflow-y: auto; }
  .gs-empty { padding: 20px; text-align: center; color: rgba(255,255,255,0.5); }
  .gs-result {
    display: flex; align-items: center; padding: 10px 16px; cursor: pointer;
    gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .gs-result:hover, .gs-result.selected { background: rgba(59,130,246,0.2); }
  .gs-icon {
    width: 20px; height: 20px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .gs-icon img { width: 16px; height: 16px; border-radius: 3px; object-fit: contain; }
  .gs-title {
    flex: 1; color: white; font-size: 14px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .gs-subtitle {
    color: rgba(255,255,255,0.4); font-size: 12px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;
  }
  .gs-hint {
    padding: 8px 16px; font-size: 11px; color: rgba(255,255,255,0.3);
    border-top: 1px solid rgba(255,255,255,0.1);
  }
`;

function openSearch(): void {
  if (searchHost) return;

  // Use shadow DOM to isolate from page styles
  searchHost = document.createElement('sparkly-search');
  shadowRoot = searchHost.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = SEARCH_STYLES;

  const overlay = document.createElement('div');
  overlay.className = 'gs-overlay';
  overlay.innerHTML = `
    <div class="gs-container">
      <div class="gs-input-wrap">
        <span class="gs-search-icon">\u{1F50D}</span>
        <input class="gs-input" type="text" placeholder="Search tabs or type to search..." />
        <span class="gs-esc-hint">esc to close</span>
      </div>
      <div class="gs-results"></div>
      <div class="gs-hint">\u2191\u2193 navigate \u2022 Enter select \u2022 Esc close</div>
    </div>
  `;

  shadowRoot.appendChild(style);
  shadowRoot.appendChild(overlay);
  document.body.appendChild(searchHost);

  searchInput = shadowRoot.querySelector('.gs-input') as HTMLInputElement;
  resultsContainer = shadowRoot.querySelector('.gs-results') as HTMLElement;

  searchInput.addEventListener('input', handleSearchInput);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });

  // Blur whatever the page currently has focused to prevent focus fights
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  document.addEventListener('keydown', handleSearchKeydown, true);
  document.addEventListener('keyup', swallowEvent, true);
  document.addEventListener('keypress', swallowEvent, true);
  document.addEventListener('focus', trapFocus, true);

  searchInput.focus();
  search('');
}

// Listen for the command from the background script (triggered via chrome.commands)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_SEARCH') {
    if (!globalSearchEnabled) return;
    if (searchHost) {
      closeSearch();
    } else {
      openSearch();
    }
  }
});
