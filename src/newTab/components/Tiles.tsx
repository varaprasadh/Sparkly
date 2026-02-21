/// <reference types="chrome"/>
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Tile from './Tile';
import { defaultTopSites } from '../../data/';

// Types
interface TopSite {
  title: string;
  url: string;
}

interface TileData {
  title: string;
  url: string;
  favicon: string;
}

// Styled components
const TilesContainer = styled.div`
  display: flex;
  max-width: 600px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1rem auto 0 auto;
  gap: 1.5rem;
`;

const LoadingText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-top: 1rem;
`;

// Constants
const MAX_TILES = 8;

/**
 * Get hostname without www prefix
 */
function getNormalizedHostname(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Convert top sites to tile data with favicon paths
 */
function mapToTileData(sites: TopSite[]): TileData[] {
  return sites.map((site) => {
    try {
      const url = new URL(site.url);
      const faviconPath = `${url.origin}/favicon.ico`;
      return {
        title: site.title,
        url: site.url,
        favicon: faviconPath,
      };
    } catch {
      return {
        title: site.title,
        url: site.url,
        favicon: '',
      };
    }
  });
}

/**
 * Fill missing slots with default sites
 */
function fillWithDefaults(topSites: TopSite[]): TopSite[] {
  if (topSites.length >= MAX_TILES) {
    return topSites.slice(0, MAX_TILES);
  }

  // Create a set of existing hostnames for deduplication
  const existingHostnames = new Set<string>(
    topSites.map((site) => getNormalizedHostname(site.url))
  );

  const filledSites = [...topSites];

  // Add default sites that don't already exist
  for (const site of defaultTopSites) {
    if (filledSites.length >= MAX_TILES) break;

    const hostname = getNormalizedHostname(site.url);
    if (!existingHostnames.has(hostname)) {
      filledSites.push(site);
      existingHostnames.add(hostname);
    }
  }

  return filledSites;
}

export function TopSites(): JSX.Element {
  const [sites, setSites] = useState<TileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopSites = (): void => {
      chrome.topSites.get((topSites: chrome.topSites.MostVisitedURL[]) => {
        const filledSites = fillWithDefaults(topSites);
        const tiles = mapToTileData(filledSites);
        setSites(tiles);
        setLoading(false);
      });
    };

    loadTopSites();
  }, []);

  if (loading) {
    return <LoadingText>Loading...</LoadingText>;
  }

  return (
    <TilesContainer>
      {sites.map((site) => (
        <Tile
          key={site.url}
          title={site.title}
          url={site.url}
          icon={site.favicon}
        />
      ))}
    </TilesContainer>
  );
}
