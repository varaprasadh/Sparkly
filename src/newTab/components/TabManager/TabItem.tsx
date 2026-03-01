/// <reference types="chrome"/>
import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import type { TabInfo } from './types';
import sparklyIcon from '../../../icons/Sparkly_x.png';
import {
  StyledTabItem,
  StyledTabThumbnailBG,
  StyledTabThumbnail,
  StyledTabTitle,
  StyledActions,
  StyledActionIconWrapper,
  StyledSuspendIndicator,
  StyledSuspendAction,
} from './styles';

interface TabItemProps {
  tab: TabInfo;
  collapsed: boolean;
  isDuplicate: boolean;
  onTabClick: (tab: TabInfo) => void;
  onCloseTab: (e: React.MouseEvent, tabId: number | undefined) => void;
  onSuspendTab?: (e: React.MouseEvent, tabId: number | undefined) => void;
}

function TabItem({ tab, collapsed, isDuplicate, onTabClick, onCloseTab, onSuspendTab }: TabItemProps): JSX.Element {
  return (
    <StyledTabItem isDuplicate={isDuplicate} onClick={() => onTabClick(tab)}>
      <StyledTabThumbnailBG as="div">
        <StyledTabThumbnail
          src={tab.favIconUrl || sparklyIcon}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).src = sparklyIcon;
          }}
        />
      </StyledTabThumbnailBG>
      <StyledTabTitle width={collapsed ? '0px' : '100%'}>
        {tab.title || 'Sparkly New Tab'}
        {tab.discarded && <StyledSuspendIndicator>zzz</StyledSuspendIndicator>}
      </StyledTabTitle>
      <StyledActions className="styled-tab-actions">
        {onSuspendTab && !tab.discarded && !tab.active && (
          <StyledSuspendAction onClick={(e) => onSuspendTab(e, tab.id)} title="Suspend tab">
            💤
          </StyledSuspendAction>
        )}
        <StyledActionIconWrapper onClick={(e) => onCloseTab(e, tab.id)}>
          <CloseOutlined style={{ color: 'white' }} />
        </StyledActionIconWrapper>
      </StyledActions>
    </StyledTabItem>
  );
}

export default TabItem;
