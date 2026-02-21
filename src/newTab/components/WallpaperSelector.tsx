/// <reference types="chrome"/>
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { getObjectFromStorageLocal } from '../../helpers/storage';

// Types
interface UnsplashImage {
  id: string;
  urls: {
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  alt_description?: string;
}

interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

interface WallpaperSelectorProps {
  onSelect?: (image: UnsplashImage) => void;
}

interface WallpaperHistoryProps {
  onSelect?: (image: UnsplashImage) => void;
}

// Constants
const SEARCH_CATEGORIES = ['Nature', 'Sky', 'Illustrations', 'Cartoons', 'Animals'];
const IMAGES_PER_PAGE = 20;

// Styled components
const StyledWallpaperSelectorContainer = styled.div``;

const StyledWallpaperSearchBarContainer = styled.div`
  display: flex;
  padding: 0.5rem 0rem;
`;

const StyledSearchBarGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid black;
`;

const StyledWallpaperSearchBar = styled.input`
  border: none;
  padding: 0.5rem;
  &:focus {
    outline: none;
    border: none;
  }
`;

const StyledWallpaperGridContainer = styled.div`
  height: 400px;
  position: relative;
  overflow: auto;
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar {
    width: 12px;
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #555;
  }
`;

const StyledSearchButton = styled.button`
  cursor: pointer;
  background: black;
  color: white;
  outline: none;
  border: none;
  padding: 0.5rem 1rem;
`;

const StyledWallpaperGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StyledWallpaperMiniPreview = styled.div<{ active: boolean }>`
  width: 150px;
  cursor: pointer;
  margin: 0.2rem;
  box-sizing: border-box;
  border: 2px solid ${(props) => (props.active ? 'black' : 'transparent')};
`;

const StyledWallpaperMiniPreviewImage = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  height: 100%;
  object-fit: cover;
`;

const StyledLoader = styled.div`
  padding: 0.5rem;
  display: flex;
  justify-content: center;
`;

const StyledLoadMore = styled.div`
  margin: auto;
  width: fit-content;
  padding: 0.5rem 1rem;
  text-decoration: underline;
  border-radius: 0.5rem;
  cursor: pointer;
`;

const StyledHistoryContainer = styled.div`
  height: 440px;
`;

/**
 * Get random category for initial search
 */
function getRandomCategory(): string {
  const randomIndex = Math.floor(Math.random() * SEARCH_CATEGORIES.length);
  return SEARCH_CATEGORIES[randomIndex];
}

/**
 * Wallpaper Selector Component
 */
export function WallpaperSelector({ onSelect }: WallpaperSelectorProps): JSX.Element {
  const [query, setQuery] = useState(() => getRandomCategory());
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const isMounted = useRef(true);

  const fetchImages = useCallback(
    async (searchQuery: string, pageNum: number, append = true): Promise<void> => {
      const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${IMAGES_PER_PAGE}&page=${pageNum}&orientation=landscape`;

      try {
        setLoading(true);
        const response = await fetch(url);
        const data: UnsplashSearchResponse = await response.json();

        if (isMounted.current) {
          if (append) {
            setImages((prev) => [...prev, ...data.results]);
          } else {
            setImages(data.results);
          }
          setTotalPages(data.total_pages);
        }
      } catch {
        // Silently fail - user can retry
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    isMounted.current = true;
    fetchImages(query, 1, false);

    return () => {
      isMounted.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const search = useCallback(async (): Promise<void> => {
    setImages([]);
    setTotalPages(1);
    setPage(1);
    await fetchImages(query, 1, false);
  }, [query, fetchImages]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (page >= totalPages) return;
    const nextPage = page + 1;
    await fetchImages(query, nextPage, true);
    setPage(nextPage);
  }, [page, totalPages, query, fetchImages]);

  const handleSelect = useCallback(
    (image: UnsplashImage): void => {
      setSelectedImage(image);
      onSelect?.(image);
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        search();
      }
    },
    [search]
  );

  return (
    <StyledWallpaperSelectorContainer>
      <StyledWallpaperSearchBarContainer>
        <StyledSearchBarGroup>
          <StyledWallpaperSearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={handleKeyDown}
            placeholder="Search wallpapers..."
          />
          <StyledSearchButton onClick={search}>Search</StyledSearchButton>
        </StyledSearchBarGroup>
      </StyledWallpaperSearchBarContainer>
      <StyledWallpaperGridContainer>
        <StyledWallpaperGrid>
          {images.map((image) => (
            <StyledWallpaperMiniPreview
              key={image.id}
              active={selectedImage?.id === image.id}
              onClick={() => handleSelect(image)}
            >
              <StyledWallpaperMiniPreviewImage
                src={image.urls.thumb}
                alt={image.alt_description || 'Wallpaper'}
              />
            </StyledWallpaperMiniPreview>
          ))}
        </StyledWallpaperGrid>
        {!loading && page < totalPages && (
          <StyledLoadMore onClick={loadMore}>Load More</StyledLoadMore>
        )}
        {loading && <StyledLoader>Please Wait...</StyledLoader>}
      </StyledWallpaperGridContainer>
    </StyledWallpaperSelectorContainer>
  );
}

/**
 * Wallpaper History Component
 */
export function WallpaperHistory({ onSelect }: WallpaperHistoryProps): JSX.Element {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const loadHistory = async (): Promise<void> => {
      try {
        const result = await getObjectFromStorageLocal('wallpapersTrail');
        const trailString = (result as { wallpapersTrail?: string })?.wallpapersTrail || '[]';
        const trail = JSON.parse(trailString) as UnsplashImage[];

        if (isMounted.current) {
          setImages(trail);
        }
      } catch {
        // Use empty array on error
        if (isMounted.current) {
          setImages([]);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSelect = useCallback(
    (image: UnsplashImage): void => {
      setSelectedImage(image);
      onSelect?.(image);
    },
    [onSelect]
  );

  return (
    <StyledHistoryContainer>
      <StyledWallpaperGridContainer>
        <StyledWallpaperGrid>
          {images.map((image) => (
            <StyledWallpaperMiniPreview
              key={image.id}
              active={selectedImage?.id === image.id}
              onClick={() => handleSelect(image)}
            >
              <StyledWallpaperMiniPreviewImage
                src={image.urls.thumb}
                alt="Wallpaper from history"
              />
            </StyledWallpaperMiniPreview>
          ))}
        </StyledWallpaperGrid>
        {images.length === 0 && (
          <StyledLoader>No wallpaper history yet</StyledLoader>
        )}
      </StyledWallpaperGridContainer>
    </StyledHistoryContainer>
  );
}
