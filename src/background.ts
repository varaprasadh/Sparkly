/**
 * Sparkly Background Script
 */

// On install handler
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason.reason === 'install') {
    chrome.runtime.setUninstallURL('https://forms.gle/tKbaLR1QeEMsmKkN7');
    initializeDefaults();
  }
});

/**
 * Initialize default settings on first install
 */
function initializeDefaults(): void {
  chrome.storage.local.get(['settings:general'], (result) => {
    if (!result['settings:general']) {
      chrome.storage.local.set({
        'settings:general': {
          searchEngine: 'google',
          openLinksInNewTab: true,
          showGreeting: true,
          userName: '',
          showTopSites: true,
          topSitesCount: 8,
          showTabManager: true,
          clockFormat: '12h',
          showSeconds: false,
          showDate: true,
          dateFormat: 'long',
          showBookmarks: true,
          maxQuickLinks: 8,
          globalSearch: true,
        },
      });
    }
  });
}

// ── Global search command ─────────────────────────────────────────────────────

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_global_search') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SEARCH' });
      }
    });
  }
});

// ── Message handlers for content script ───────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TABS') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse(tabs.map(t => ({
        id: t.id,
        title: t.title,
        url: t.url,
        favIconUrl: t.favIconUrl,
        windowId: t.windowId,
      })));
    });
    return true; // async response
  }

  if (message.type === 'SWITCH_TAB') {
    const { tabId, windowId } = message;
    if (windowId) {
      chrome.windows.get(windowId, (win) => {
        const doFocusAndActivate = () => {
          chrome.windows.update(windowId, { focused: true }, () => {
            chrome.windows.update(windowId, { drawAttention: true });
            chrome.tabs.update(tabId, { active: true });
            sendResponse({ ok: true });
          });
        };
        if (win.state === 'minimized') {
          chrome.windows.update(windowId, { state: 'normal' }, doFocusAndActivate);
        } else {
          doFocusAndActivate();
        }
      });
    } else {
      chrome.tabs.update(tabId, { active: true });
      sendResponse({ ok: true });
    }
    return true;
  }

  if (message.type === 'GET_SUGGESTIONS') {
    fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(message.query)}`)
      .then(res => res.json())
      .then(data => sendResponse((data[1] as string[]).slice(0, 5)))
      .catch(() => sendResponse([]));
    return true;
  }

  if (message.type === 'SEARCH_NAVIGATE') {
    chrome.tabs.create({ url: message.url });
    sendResponse({ ok: true });
    return true;
  }
});

export {};
