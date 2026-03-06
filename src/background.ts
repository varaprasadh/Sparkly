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
    chrome.tabs.update(message.tabId, { active: true });
    if (message.windowId) {
      chrome.windows.update(message.windowId, { focused: true });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'SEARCH_NAVIGATE') {
    chrome.tabs.create({ url: message.url });
    sendResponse({ ok: true });
    return true;
  }
});

export {};
