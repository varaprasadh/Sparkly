import styled from 'styled-components';

interface StyledTabManagerContainerProps {
  collapsed: boolean;
}

interface StyledWindowGroupProps {
  color: string;
}

export const StyledTabManagerContainer = styled.div<StyledTabManagerContainerProps>`
  width: ${(props) => (props.collapsed ? 'auto' : '300px')};
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
  }
`;

export const StyledTabItem = styled.div<{ isDuplicate?: boolean }>`
  position: relative;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: ${(props) =>
    props.isDuplicate ? 'rgba(234, 4, 126, 0.12)' : 'rgba(255, 255, 255, 0.05)'};
  color: rgba(255, 255, 255, 0.9);
  margin: 0.4rem 0.5rem;
  border-radius: 8px;
  border: 1px solid ${(props) =>
    props.isDuplicate ? 'rgba(234, 4, 126, 0.25)' : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  &:hover .styled-tab-actions {
    right: 0px;
  }
`;

export const StyledWindowGroup = styled.div<StyledWindowGroupProps>`
  border-left: 3px solid ${(props) => props.color};
  margin: 1rem 0;
  padding-left: 2px;
`;

export const StyledTabThumbnailBG = styled.a`
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  margin-right: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &:active {
    transform: scale(0.9);
  }
`;

export const StyledTabThumbnail = styled.img`
  width: 16px;
  height: 16px;
`;

export const StyledTabTitle = styled.div<{ width?: string }>`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${(props) => props.width || '100%'};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
`;

export const StyledTabManagerHeader = styled.div`
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  color: white;
  padding: 1rem 1rem 0 1rem;
  min-height: 52px;
  margin-bottom: 0.5rem;
`;

export const StyledCollapse = styled.div`
  margin-left: auto;
`;

export const StyledActions = styled.div`
  position: absolute;
  top: 0;
  right: -70px;
  height: 100%;
  width: 70px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.8));
  transition: right 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  gap: 4px;
`;

export const StyledActionIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.8);
    transform: scale(1.1);
  }
`;

export const CollapseButton = styled.div`
  margin: 0rem 0.5rem;
  cursor: pointer;
  color: white;
`;

export const StyledTabCountBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.9);
`;

export const StyledSearchInput = styled.div`
  margin: 0 0.5rem 0.5rem;
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    padding: 8px 32px 8px 12px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 12px;
    outline: none;
    transition: all 0.2s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    &:focus {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

export const StyledSearchClear = styled.div`
  position: absolute;
  right: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.15);
  }
`;

export const StyledDuplicatesBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0.5rem 0.5rem;
  padding: 6px 10px;
  background: rgba(234, 4, 126, 0.15);
  border: 1px solid rgba(234, 4, 126, 0.3);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
`;

export const StyledDuplicatesCloseAll = styled.button`
  background: rgba(234, 4, 126, 0.6);
  border: none;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(234, 4, 126, 0.8);
  }
`;

export const StyledGroupingToggle = styled.div`
  display: flex;
  margin: 0 0.5rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const StyledGroupingOption = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 4px 0;
  font-size: 11px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${(props) => (props.active ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  background: ${(props) => (props.active ? 'rgba(255, 255, 255, 0.15)' : 'transparent')};

  &:hover {
    color: white;
  }
`;

export const StyledSuspendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: calc(100% - 1rem);
  margin: 0.5rem 0.5rem;
  padding: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
`;

export const StyledSuspendIndicator = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 4px;
  font-weight: 600;
  letter-spacing: 1px;
`;

export const StyledSuspendAction = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  font-size: 10px;

  &:hover {
    background: rgba(100, 149, 237, 0.8);
    transform: scale(1.1);
  }
`;

export const StyledCollapsibleSection = styled.div`
  margin: 0.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

export const StyledCollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

export const StyledCollapsibleArrow = styled.span<{ open: boolean }>`
  margin-right: 6px;
  font-size: 10px;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.open ? 'rotate(90deg)' : 'rotate(0deg)')};
`;

export const StyledRecentTabItem = styled.div`
  padding: 6px 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  margin: 2px 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }
`;

export const StyledRestoreButton = styled.div`
  margin-left: auto;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.15);
  }
`;

export const StyledSessionPanel = styled.div`
  margin: 0.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

export const StyledSessionSaveRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 0.5rem;
  margin-bottom: 6px;

  input {
    flex: 1;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: white;
    font-size: 12px;
    outline: none;

    &::placeholder {
      color: rgba(255, 255, 255, 0.35);
    }

    &:focus {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  button {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

export const StyledSessionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 0.75rem;
  margin: 2px 0.5rem;
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const StyledSessionName = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledSessionDate = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  margin-left: 8px;
  flex-shrink: 0;
`;

export const StyledSessionActions = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 8px;
  flex-shrink: 0;
`;

export const StyledSessionActionBtn = styled.div<{ danger?: boolean }>`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${(props) => (props.danger ? '#ef4444' : 'white')};
    background: ${(props) =>
      props.danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.15)'};
  }
`;
