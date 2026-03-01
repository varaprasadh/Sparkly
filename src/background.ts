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
        },
      });
    }
  });
}

export {};
