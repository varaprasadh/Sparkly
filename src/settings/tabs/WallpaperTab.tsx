/**
 * Wallpaper Settings Tab
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { WallpaperSettings, WallpaperSource, WallpaperFrequency } from '../../types/settings.types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--accent-color, #3b82f6);
    box-shadow: 0 0 0 3px var(--accent-color-light, rgba(59, 130, 246, 0.1));
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const ToggleSwitch = styled.div<{ checked: boolean }>`
  width: 48px;
  height: 26px;
  background: ${(props) => (props.checked ? 'var(--accent-color, #3b82f6)' : '#d1d5db')};
  border-radius: 13px;
  position: relative;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: ${(props) => (props.checked ? '25px' : '3px')};
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #374151;
`;

const SourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const SourceCard = styled.button<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid ${(props) => (props.selected ? 'var(--accent-color, #3b82f6)' : '#e5e7eb')};
  border-radius: 12px;
  background: ${(props) => (props.selected ? 'var(--accent-color-light, #eff6ff)' : 'white')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => (props.selected ? 'var(--accent-color, #3b82f6)' : '#d1d5db')};
  }
`;

const SourceIcon = styled.span`
  font-size: 24px;
`;

const SourceLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ColorSwatch = styled.button<{ color: string; selected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid ${(props) => (props.selected ? '#1f2937' : 'transparent')};
  background: ${(props) => props.color};
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const WALLPAPER_SOURCES: { id: WallpaperSource; label: string; icon: string }[] = [
  { id: 'random', label: 'Random', icon: '🎲' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'history', label: 'From History', icon: '📚' },
  { id: 'upload', label: 'Upload', icon: '📁' },
  { id: 'color', label: 'Solid Color', icon: '🎨' },
];

const REFRESH_OPTIONS: { id: WallpaperFrequency; label: string }[] = [
  { id: 'never', label: 'Never' },
  { id: 'every-tab', label: 'Every new tab' },
  { id: 'hourly', label: 'Every hour' },
  { id: 'daily', label: 'Once a day' },
];

const SOLID_COLORS = [
  '#1f2937', '#374151', '#4b5563', '#6b7280',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e',
];

// History wallpaper grid styles
const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const HistoryCard = styled.button<{ selected: boolean }>`
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid ${(props) => (props.selected ? 'var(--accent-color, #3b82f6)' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const HistoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HistoryOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  font-size: 10px;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const EmptyHistory = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 14px;
`;

const UploadArea = styled.div<{ isDragging?: boolean }>`
  border: 2px dashed ${(props) => (props.isDragging ? 'var(--accent-color, #3b82f6)' : '#d1d5db')};
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.isDragging ? 'var(--accent-color-light, #eff6ff)' : '#f9fafb')};

  &:hover {
    border-color: var(--accent-color, #3b82f6);
    background: var(--accent-color-light, #eff6ff);
  }
`;

const UploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const UploadText = styled.div`
  font-size: 14px;
  color: #374151;
  font-weight: 500;
`;

const UploadHint = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const UploadPreview = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--accent-color, #3b82f6);
`;

const UploadPreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  display: block;
`;

const UploadPreviewActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  gap: 8px;
  background: #f9fafb;
`;

const UploadButton = styled.button`
  padding: 6px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: white;
  color: #374151;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

const HiddenFileInput = styled.input.attrs({ type: 'file', accept: 'image/*' })`
  display: none;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent-color, #3b82f6);
    box-shadow: 0 0 0 3px var(--accent-color-light, rgba(59, 130, 246, 0.1));
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: var(--accent-color, #3b82f6);
  color: white;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const SearchResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const SearchResultCard = styled.button<{ selected: boolean }>`
  position: relative;
  aspect-ratio: 16/10;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid ${(props) => (props.selected ? 'var(--accent-color, #3b82f6)' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  background: #f3f4f6;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SearchResultImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SearchResultOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  font-size: 10px;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const SearchStatus = styled.div`
  text-align: center;
  padding: 24px;
  color: #6b7280;
  font-size: 14px;
`;

const SearchChips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SearchChip = styled.button`
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  background: white;
  color: #374151;
  transition: all 0.2s;

  &:hover {
    background: var(--accent-color-light, #eff6ff);
    border-color: var(--accent-color, #3b82f6);
    color: var(--accent-color, #3b82f6);
  }
`;

const CurrentWallpaperPreview = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const CurrentWallpaperImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
`;

const CurrentWallpaperInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f9fafb;
  font-size: 12px;
  color: #6b7280;
`;

const CurrentWallpaperLabel = styled.span`
  font-weight: 500;
  color: #374151;
`;

const SEARCH_SUGGESTIONS = ['nature', 'mountains', 'ocean', 'city', 'space', 'forest', 'sunset', 'abstract'];

interface WallpaperHistoryItem {
  id: string;
  urls?: {
    thumb?: string;
    small?: string;
    regular?: string;
    full?: string;
  };
  user?: {
    username?: string;
  };
}

interface WallpaperTabProps {
  settings: WallpaperSettings;
  onUpdate: (updates: Partial<WallpaperSettings>) => void;
}

export function WallpaperTab({ settings, onUpdate }: WallpaperTabProps): JSX.Element {
  const [historyWallpapers, setHistoryWallpapers] = useState<WallpaperHistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(settings.uploadedImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WallpaperHistoryItem[]>([]);
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Current wallpaper preview
  const [currentWallpaper, setCurrentWallpaper] = useState<{ thumb: string; author: string } | null>(null);

  // Load current wallpaper preview from storage
  useEffect(() => {
    if (settings.source === 'search' || settings.source === 'history') {
      chrome.storage.local.get(['bufferedImageMetadata'], (result) => {
        try {
          const meta = result.bufferedImageMetadata;
          const parsed = typeof meta === 'string' ? JSON.parse(meta) : meta;
          if (parsed && parsed.urls) {
            setCurrentWallpaper({
              thumb: parsed.urls.small || parsed.urls.thumb || parsed.urls.regular,
              author: parsed.user?.username || 'Unknown',
            });
            if (parsed.id) setSelectedSearchId(parsed.id);
          }
        } catch {
          // ignore
        }
      });
    }
  }, [settings.source]);

  // Search Unsplash
  const handleSearch = async (query?: string) => {
    const q = (query || searchQuery).trim();
    if (!q) return;

    if (query) setSearchQuery(query);
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      const results = (data.results || []) as WallpaperHistoryItem[];
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No results found. Try a different search term.');
      }
    } catch {
      setSearchError('Failed to search. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Select a search result as wallpaper
  const handleSelectSearchResult = (wallpaper: WallpaperHistoryItem) => {
    setSelectedSearchId(wallpaper.id);
    setCurrentWallpaper({
      thumb: wallpaper.urls?.small || wallpaper.urls?.thumb || '',
      author: wallpaper.user?.username || 'Unknown',
    });

    const imageUrl = wallpaper.urls?.full || wallpaper.urls?.regular;
    if (imageUrl) {
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            chrome.storage.local.set({
              bufferedImage: reader.result,
              bufferedImageMetadata: JSON.stringify(wallpaper),
            });
          });
          reader.readAsDataURL(blob);
        })
        .catch(err => console.error('Failed to cache wallpaper:', err));
    }

    onUpdate({ source: 'search' });
  };

  // Load wallpaper history from storage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        chrome.storage.local.get(['wallpapersTrail'], (result) => {
          const trail = result.wallpapersTrail;
          if (trail) {
            const parsed = typeof trail === 'string' ? JSON.parse(trail) : trail;
            // Get last 5 wallpapers, most recent first
            const recent = Array.isArray(parsed) ? parsed.slice(-5).reverse() : [];
            setHistoryWallpapers(recent);
          }
        });
      } catch (error) {
        console.error('Failed to load wallpaper history:', error);
      }
    };

    if (settings.source === 'history') {
      loadHistory();
    }
  }, [settings.source]);

  // Handle selecting a wallpaper from history
  const handleSelectHistoryWallpaper = (wallpaper: WallpaperHistoryItem) => {
    setSelectedHistoryId(wallpaper.id);
    setLoadingHistoryId(wallpaper.id);

    // Cache the selected image so it shows on next load
    const imageUrl = wallpaper.urls?.full || wallpaper.urls?.regular;
    if (imageUrl) {
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            // Cache the image data for display
            chrome.storage.local.set({
              bufferedImage: reader.result,
              bufferedImageMetadata: JSON.stringify(wallpaper),
            });
            setLoadingHistoryId(null);
          });
          reader.readAsDataURL(blob);
        })
        .catch(err => {
          console.error('Failed to cache wallpaper:', err);
          setLoadingHistoryId(null);
        });
    }

    // Update the draft source to 'history' through the normal draft pattern
    onUpdate({ source: 'history' });
  };

  // Handle file upload
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const dataUrl = reader.result as string;
      setUploadPreview(dataUrl);
      // Store the uploaded image as data URL and cache it for display
      onUpdate({ uploadedImage: dataUrl, source: 'upload' });
      chrome.storage.local.set({
        bufferedImage: dataUrl,
        bufferedImageMetadata: JSON.stringify({}),
      });
    });
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveUpload = () => {
    setUploadPreview(null);
    onUpdate({ uploadedImage: null, source: 'random' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Container>
      <Section>
        <SectionTitle>Wallpaper Source</SectionTitle>
        <SourceGrid>
          {WALLPAPER_SOURCES.map((source) => (
            <SourceCard
              key={source.id}
              selected={settings.source === source.id}
              onClick={() => onUpdate({ source: source.id })}
            >
              <SourceIcon>{source.icon}</SourceIcon>
              <SourceLabel>{source.label}</SourceLabel>
            </SourceCard>
          ))}
        </SourceGrid>
      </Section>

      {settings.source === 'search' && (
        <Section>
          <SectionTitle>Search Unsplash</SectionTitle>
          <SearchContainer>
            {currentWallpaper && (
              <CurrentWallpaperPreview>
                <CurrentWallpaperImage src={currentWallpaper.thumb} alt="Current wallpaper" />
                <CurrentWallpaperInfo>
                  <CurrentWallpaperLabel>Current wallpaper</CurrentWallpaperLabel>
                  <span>by {currentWallpaper.author}</span>
                </CurrentWallpaperInfo>
              </CurrentWallpaperPreview>
            )}
            <SearchInputWrapper>
              <SearchInput
                type="text"
                placeholder="Search wallpapers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
              <SearchButton onClick={() => handleSearch()} disabled={searchLoading || !searchQuery.trim()}>
                {searchLoading ? 'Searching...' : 'Search'}
              </SearchButton>
            </SearchInputWrapper>
            <SearchChips>
              {SEARCH_SUGGESTIONS.map((term) => (
                <SearchChip key={term} onClick={() => handleSearch(term)}>
                  {term}
                </SearchChip>
              ))}
            </SearchChips>
            {searchLoading && <SearchStatus>Searching...</SearchStatus>}
            {searchError && <SearchStatus>{searchError}</SearchStatus>}
            {searchResults.length > 0 && (
              <SearchResultsGrid>
                {searchResults.map((result) => (
                  <SearchResultCard
                    key={result.id}
                    selected={selectedSearchId === result.id}
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <SearchResultImage
                      src={result.urls?.small || result.urls?.thumb}
                      alt="Wallpaper"
                    />
                    <SearchResultOverlay>
                      by {result.user?.username || 'Unknown'}
                    </SearchResultOverlay>
                  </SearchResultCard>
                ))}
              </SearchResultsGrid>
            )}
          </SearchContainer>
        </Section>
      )}

      {settings.source === 'history' && (
        <Section>
          <SectionTitle>Recent Wallpapers</SectionTitle>
          <Description>Select from your last 5 wallpapers</Description>
          {historyWallpapers.length === 0 ? (
            <EmptyHistory>
              No wallpaper history yet. Browse some wallpapers first!
            </EmptyHistory>
          ) : (
            <HistoryGrid>
              {historyWallpapers.map((wallpaper) => (
                <HistoryCard
                  key={wallpaper.id}
                  selected={selectedHistoryId === wallpaper.id}
                  onClick={() => handleSelectHistoryWallpaper(wallpaper)}
                >
                  <HistoryImage
                    src={wallpaper.urls?.small || wallpaper.urls?.thumb}
                    alt="Wallpaper"
                  />
                  <HistoryOverlay>
                    by {wallpaper.user?.username || 'Unknown'}
                  </HistoryOverlay>
                </HistoryCard>
              ))}
            </HistoryGrid>
          )}
        </Section>
      )}

      {settings.source === 'upload' && (
        <Section>
          <SectionTitle>Upload Image</SectionTitle>
          <HiddenFileInput
            ref={fileInputRef}
            onChange={handleFileInputChange}
          />
          {uploadPreview ? (
            <UploadPreview>
              <UploadPreviewImage src={uploadPreview} alt="Uploaded wallpaper" />
              <UploadPreviewActions>
                <UploadButton onClick={() => fileInputRef.current?.click()}>
                  Change Image
                </UploadButton>
                <UploadButton onClick={handleRemoveUpload}>
                  Remove
                </UploadButton>
              </UploadPreviewActions>
            </UploadPreview>
          ) : (
            <UploadArea
              isDragging={isDragging}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <UploadIcon>📁</UploadIcon>
              <UploadText>Click to upload or drag and drop</UploadText>
              <UploadHint>PNG, JPG, or WebP</UploadHint>
            </UploadArea>
          )}
        </Section>
      )}

      {settings.source === 'color' && (
        <Section>
          <SectionTitle>Solid Color</SectionTitle>
          <FormGroup>
            <Label>Choose a color</Label>
            <ColorPicker>
              {SOLID_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={settings.solidColor === color}
                  onClick={() => onUpdate({ solidColor: color })}
                />
              ))}
            </ColorPicker>
          </FormGroup>
        </Section>
      )}

      <Section>
        <SectionTitle>Refresh Settings</SectionTitle>

        <FormGroup>
          <Label>Refresh frequency</Label>
          <Select
            value={settings.refreshFrequency}
            onChange={(e) => onUpdate({ refreshFrequency: e.target.value as WallpaperFrequency })}
          >
            {REFRESH_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          <Description>How often to change the wallpaper</Description>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Display Options</SectionTitle>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.blur}
              onChange={(e) => onUpdate({ blur: e.target.checked })}
            />
            <ToggleSwitch checked={settings.blur} />
            <ToggleLabel>Enable blur effect</ToggleLabel>
          </Toggle>
          <Description>Apply a subtle blur to the wallpaper</Description>
        </FormGroup>

        <FormGroup>
          <Toggle>
            <HiddenCheckbox
              checked={settings.dim}
              onChange={(e) => onUpdate({ dim: e.target.checked })}
            />
            <ToggleSwitch checked={settings.dim} />
            <ToggleLabel>Enable dimming</ToggleLabel>
          </Toggle>
          <Description>Darken the wallpaper for better readability</Description>
        </FormGroup>
      </Section>
    </Container>
  );
}

export default WallpaperTab;
