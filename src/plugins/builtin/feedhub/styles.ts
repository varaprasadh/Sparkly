/**
 * FeedHub Styled Components
 */

import styled from 'styled-components';

const darkScrollbar = `
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
`;

export const SettingsToggle = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

// ── Feed Tabs (horizontal scroll of enabled feed names) ──

export const FeedTabs = styled.div`
  display: flex;
  gap: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow-x: auto;
  flex-shrink: 0;
  ${darkScrollbar}

  &::-webkit-scrollbar {
    height: 3px;
  }
`;

export const FeedTab = styled.button<{ active: boolean; accentColor: string }>`
  padding: 8px 14px;
  background: ${(props) => (props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? props.accentColor : 'transparent')};
  color: ${(props) => (props.active ? 'white' : 'rgba(255, 255, 255, 0.45)')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.06);
  }
`;

// ── Feed Content (the horizontal scrollable card area) ──

export const FeedCardsScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  ${darkScrollbar}
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Card = styled.a`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
  line-height: 1.4;
`;

export const CardDescription = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CardMeta = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

export const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
`;

export const Tag = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
`;

// ── Settings Panel (feed checkboxes) ──

export const SettingsPanel = styled.div`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  max-height: 300px;
  overflow-y: auto;
  ${darkScrollbar}
`;

export const SettingsTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
`;

export const FeedCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  transition: color 0.2s;

  &:hover {
    color: white;
  }

  input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s;

    &:checked {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    &:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
`;

export const FeedCheckboxIcon = styled.span`
  font-size: 16px;
`;

export const FeedCheckboxName = styled.span`
  flex: 1;
`;

export const StateMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 80px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 13px;
  padding: 20px;
  text-align: center;
`;
