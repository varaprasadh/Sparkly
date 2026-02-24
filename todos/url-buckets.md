# URL Buckets / Link Groups

## Status: Draft / Brainstorm

## Concept
Named collections of links that open together in one click. A "workspace launcher" — contextual link groups for different parts of your day.

## Examples
- Work: Jira, GitHub, Gmail, Slack, Notion
- Personal: Twitter, Reddit, YouTube
- Learning: Udemy, Coursera, MDN Docs
- Finance: Bank, Robinhood, Mint

## UX
- Click bucket name → opens all links in new tabs at once
- Expand bucket → see individual links, click one at a time
- Edit mode → add/remove/reorder links, rename bucket
- Drag-and-drop a link from top sites into a bucket (stretch)
- Assign emoji icon + color per bucket
- Optional "Open in new window" toggle per bucket

## Why better than Chrome bookmark folders
1. One-click open all (no right-click menu)
2. Visual — emoji icons, colors, always visible on new tab
3. Grouped by workflow, not Chrome's bookmark hierarchy
4. Quick add — paste URL, type name, done

## Data model
```
Bucket {
  id: string
  name: string
  icon: string (emoji)
  color: string
  links: Array<{ title, url, favicon? }>
}
```

## Technical
- Stored in chrome.storage.local
- Favicon via chrome://favicon/ or Google favicon service
- chrome.tabs.create() to open links (tabs permission exists)
- chrome.windows.create() for "open as new window" option

## Placement options
- Right Action Bar (alongside Google service bookmarks)
- Own widget area below top sites
- Dropdown/popover from header icon

## Future enhancements
- Import from Chrome bookmarks folder
- Share/export buckets as JSON
- Usage stats — most used buckets, time-of-day suggestions
- Keyboard shortcuts — Ctrl+1 through Ctrl+9 to launch buckets
