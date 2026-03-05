/// <reference types="chrome"/>

const STORAGE_KEY = 'settings:general';

function handleClick(e: MouseEvent): void {
  const target = e.target as Element;
  const anchor = target.closest('a');
  if (!anchor) return;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('javascript:') || href.startsWith('#') || href === '') return;
  if (anchor.target === '_blank' || anchor.target === '_self') return;

  // Let modifier-key clicks pass through (user's own intent)
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

// Read initial setting and apply
chrome.storage.local.get(STORAGE_KEY, (result) => {
  const general = result[STORAGE_KEY] as { openLinksInNewTab?: boolean } | undefined;
  applySettings(!!general?.openLinksInNewTab);
});

// Keep in sync when the setting changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]) return;
  const newValue = changes[STORAGE_KEY].newValue as { openLinksInNewTab?: boolean } | undefined;
  applySettings(!!newValue?.openLinksInNewTab);
});
