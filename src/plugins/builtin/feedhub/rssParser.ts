/**
 * Minimal RSS/Atom parser using DOMParser
 */

import { FeedItem } from './types';

export function parseRSS(xml: string, limit = 20): FeedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const items: FeedItem[] = [];

  // Try RSS 2.0 <item> elements
  const rssItems = doc.querySelectorAll('item');
  if (rssItems.length > 0) {
    rssItems.forEach((item, i) => {
      if (i >= limit) return;
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const creator =
        item.querySelector('dc\\:creator')?.textContent?.trim() ||
        item.querySelector('author')?.textContent?.trim() ||
        '';
      const desc =
        item.querySelector('description')?.textContent?.trim() || '';

      if (title && link) {
        items.push({
          id: `rss-${i}-${link}`,
          title,
          url: link,
          author: creator || undefined,
          description: stripHtml(desc).slice(0, 120) || undefined,
        });
      }
    });
    return items;
  }

  // Try Atom <entry> elements
  const atomEntries = doc.querySelectorAll('entry');
  atomEntries.forEach((entry, i) => {
    if (i >= limit) return;
    const title = entry.querySelector('title')?.textContent?.trim() || '';
    const linkEl = entry.querySelector('link[href]');
    const link = linkEl?.getAttribute('href') || '';
    const author =
      entry.querySelector('author name')?.textContent?.trim() || '';
    const summary =
      entry.querySelector('summary')?.textContent?.trim() ||
      entry.querySelector('content')?.textContent?.trim() ||
      '';

    if (title && link) {
      items.push({
        id: `atom-${i}-${link}`,
        title,
        url: link,
        author: author || undefined,
        description: stripHtml(summary).slice(0, 120) || undefined,
      });
    }
  });

  return items;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
