<p align="center">
  <img width="80px" src="public/images/icon.png" alt="Sparkly" />
</p>

<h1 align="center">Sparkly</h1>

<p align="center">
  <strong>New Tab for Productive People</strong><br/>
  Replace your new tab with a beautiful dashboard — wallpapers, news feed, tab manager, and search — all in one place.
</p>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/finlildobfdjhkemcieihnkgmgoikgan">
    <img src="https://img.shields.io/chrome-web-store/v/finlildobfdjhkemcieihnkgmgoikgan?label=Chrome%20Web%20Store" alt="Chrome Web Store Version" />
  </a>
  <a href="https://chrome.google.com/webstore/detail/finlildobfdjhkemcieihnkgmgoikgan">
    <img src="https://img.shields.io/chrome-web-store/users/finlildobfdjhkemcieihnkgmgoikgan?label=Users" alt="Chrome Web Store Users" />
  </a>
  <img src="https://img.shields.io/badge/license-ISC-blue" alt="License" />
</p>

---

## Features

### Stunning Wallpapers
- HD wallpapers from **Unsplash** on every new tab
- **Search** wallpapers by keyword
- Browse your **wallpaper history**
- Pick a **solid color** background
- Blur and dim options for better readability

### Developer News Feeds
- **Hacker News** — top stories from the front page
- **GitHub Trending** — trending repositories
- **DEV Community** — latest articles from dev.to

### Smart Search Bar
- Switch between **Google, Bing, Yahoo, and DuckDuckGo**
- Instant search suggestions as you type
- Keyboard navigation with arrow keys

### Tab Manager
- Quickly find and switch to any open tab
- Collapsible sidebar that remembers its state

### Top Sites & Bookmarks
- Frequently visited sites displayed as quick-access tiles
- Bookmarks sidebar for one-click access

### Customizable Settings
- **Appearance** — accent color, font size, layout density, border radius
- **Themes** — light, dark, or system auto
- **Glass-effect UI** with smooth animations
- Toggle top sites, bookmarks, greeting, and more

### Privacy First
- No data leaves your device
- No ads, no tracking, no account required
- Completely free

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI Framework** | React 17 + TypeScript |
| **Styling** | styled-components |
| **State Management** | React Context + useReducer |
| **Storage** | Chrome Storage API (`chrome.storage.local`) |
| **Bundler** | Webpack 5 |
| **Extension** | Chrome Manifest V3 |
| **APIs** | Unsplash (wallpapers), Google (search suggestions), Hacker News, GitHub, DEV.to |

---

## Project Structure

```
src/
├── newTab/                  # Main new tab page
│   ├── newTab.tsx           # Entry point & layout
│   ├── components/          # SearchBar, Tiles, TabManager, Clock
│   └── Context.tsx          # Legacy context provider
├── settings/                # Settings modal
│   ├── SettingsModal.tsx     # Modal container with tabs
│   └── tabs/                # General, Wallpaper, Appearance, Widgets
├── store/                   # App state management
│   ├── AppContext.tsx        # Main store provider
│   ├── hooks.ts             # useSettings, useStore hooks
│   └── reducer.ts           # State reducer
├── plugins/                 # Widget plugin system
│   ├── builtin/             # Hacker News, GitHub, DEV.to widgets
│   └── core/                # Plugin API & registry
├── components/              # Shared components (ThemeProvider, AppDock)
├── types/                   # TypeScript type definitions
│   ├── common.types.ts      # Shared types (WallpaperSource, etc.)
│   └── settings.types.ts    # Settings interfaces & defaults
├── services/                # Migration service
└── assets/                  # Icons, SVGs, images
public/
├── manifest.json            # Chrome extension manifest (MV3)
└── images/                  # Extension icons
```

---

## Development

### Prerequisites

- Node.js (v18+)
- npm
- Chrome browser

### Setup

```bash
# Clone the repo
git clone https://github.com/varaprasadh/Sparkly.git
cd Sparkly

# Install dependencies
npm install

# Build the extension
npm run build

# Or watch for changes during development
npm run dev
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` directory

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode — rebuilds on file changes |
| `npm run build` | Production build to `dist/` |
| `npm run publish` | Build, zip, upload & publish to Chrome Web Store |
| `npm run build-publish` | Build + publish in one command |

---

## Publishing

The project includes a publish utility (`upload.js`) that zips the `dist/` folder and uploads it to the Chrome Web Store API.

You can also publish manually:

1. Run `npm run build`
2. Run `node createzip.js` to generate `extension.zip`
3. Upload `extension.zip` on the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## License

ISC
