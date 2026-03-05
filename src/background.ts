/**
 * Sparkly Background Script
 */

const OFFSCREEN_URL = chrome.runtime.getURL('offscreen.html');

// ── Offscreen document management ────────────────────────────────────────────

async function ensureOffscreen(): Promise<void> {
  const offscreen = (chrome as any).offscreen;
  if (!offscreen) return;
  try {
    const contexts = await (chrome as any).runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [OFFSCREEN_URL],
    });
    if (contexts && contexts.length > 0) return;
  } catch (_) {}
  try {
    await offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: ['USER_MEDIA'],
      justification: 'Run local AI model for page summarization',
    });
  } catch (_) {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const pendingTabs = new Map<string, number>();

function forwardToTab(tabId: number, message: unknown): void {
  chrome.tabs.sendMessage(tabId, message, () => void chrome.runtime.lastError);
}

function forwardToOffscreen(message: unknown): void {
  chrome.runtime.sendMessage(message, () => void chrome.runtime.lastError);
}

// ── Message routing ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  // ── FROM content script / new tab → forward to offscreen ──
  if (message.type === 'AI_LOAD_MODEL' || message.type === 'AI_CHECK_COMPAT') {
    ensureOffscreen().then(() => {
      if (tabId) pendingTabs.set('status', tabId);
      forwardToOffscreen(message);
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'AI_GET_STATUS') {
    ensureOffscreen().then(() => {
      if (tabId) pendingTabs.set('status_query', tabId);
      forwardToOffscreen(message);
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'AI_DELETE_MODEL') {
    ensureOffscreen().then(() => {
      if (tabId) pendingTabs.set('delete', tabId);
      forwardToOffscreen(message);
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'AI_INFER') {
    ensureOffscreen().then(() => {
      if (tabId) pendingTabs.set(message.requestId, tabId);
      forwardToOffscreen(message);
    });
    sendResponse({ ok: true });
    return true;
  }

  // ── FROM offscreen → forward back to the right tab ──
  if (message.type === 'AI_STATUS') {
    const tid = pendingTabs.get('status');
    if (tid) forwardToTab(tid, message);
    return;
  }

  if (message.type === 'AI_STATUS_RESULT') {
    const tid = pendingTabs.get('status_query');
    if (tid) { forwardToTab(tid, message); pendingTabs.delete('status_query'); }
    return;
  }

  if (message.type === 'AI_DELETE_RESULT') {
    const tid = pendingTabs.get('delete');
    if (tid) { forwardToTab(tid, message); pendingTabs.delete('delete'); }
    return;
  }

  if (message.type === 'AI_COMPAT_RESULT') {
    const tid = pendingTabs.get('status');
    if (tid) forwardToTab(tid, message);
    return;
  }

  if (message.type === 'AI_RESULT') {
    const tid = pendingTabs.get(message.requestId);
    if (tid) { forwardToTab(tid, message); pendingTabs.delete(message.requestId); }
    return;
  }
});

// ── Install handler ───────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener((reason) => {
  if (reason.reason === 'install') {
    chrome.runtime.setUninstallURL('https://forms.gle/tKbaLR1QeEMsmKkN7');
    initializeDefaults();
  }
});

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
          showAI: false,
        },
      });
    }
  });
}

export {};
