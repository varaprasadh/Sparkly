/// <reference types="chrome"/>
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { preventSelectStyles } from '.';
import cursorIcon from '../../icons/cursor.png';

// Props interface
interface TileProps {
  title: string;
  url: string;
  icon: string;
}

// Styled components
const TileContainer = styled.a`
  position: relative;
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  padding: 0.5rem;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &:active {
    transform: scale(0.95);
  }
  ${preventSelectStyles}
`;

const TileTitle = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.8rem;
  width: 100%;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
`;

const TileImageContainer = styled.div`
  position: relative;
  width: fit-content;
  margin: auto;
`;

const TileImage = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  object-fit: contain;
  transition: all 0.3s ease;
  
  ${TileContainer}:hover & {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  ${preventSelectStyles}
`;

const NotificationBadge = styled.span`
  background: tomato;
  color: white;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.8rem;
  position: absolute;
  top: -0.5rem;
  right: -1rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`;

/**
 * Extract notification count from title (e.g., "Gmail (5)" -> 5)
 */
function extractNotificationCount(title: string): number {
  const match = title.match(/\((\d[\d,.]*)\)/);
  if (match && match[1]) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 0;
}

/**
 * Format notification count for display
 */
function formatNotificationCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}

export default function Tile({ title, url, icon }: TileProps): JSX.Element {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgElement = imageRef.current;

    const handleError = (event: Event): void => {
      const target = event.target as HTMLImageElement;
      if (target) {
        target.src = cursorIcon;
      }
    };

    if (imgElement) {
      imgElement.addEventListener('error', handleError);
    }

    return () => {
      if (imgElement) {
        imgElement.removeEventListener('error', handleError);
      }
    };
  }, []);

  const notificationCount = extractNotificationCount(title);
  const formattedCount = formatNotificationCount(notificationCount);

  return (
    <TileContainer href={url}>
      <TileImageContainer>
        <TileImage
          ref={imageRef}
          src={icon}
          alt={`${title} icon`}
        />
        {notificationCount > 0 && (
          <NotificationBadge>{formattedCount}</NotificationBadge>
        )}
      </TileImageContainer>
      <TileTitle title={title}>{title}</TileTitle>
    </TileContainer>
  );
}
