// @ts-nocheck

import { Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import sparklyIcon from '../../icons/Sparkly.png'
import { DoubleRightOutlined, DoubleLeftOutlined, CloseOutlined  } from '@ant-design/icons';


const StyledTabManagerContainer = styled.div`
  width: ${props => props.collapsed ? 'auto': '300px'};
  background: rgba(0, 0, 0, 0.5);
  height: 100vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
  }
`

const StyledTabItem = styled.div`
  position: relative;
  padding: 0.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: black;
  color: white;
  margin: 0.1rem 0rem;
  border-radius: 0.5rem;
  &:hover {
    background: #323232;
  }
  &:hover .styled-tab-actions {
    right: 0px;
    display: flex;
  }
  
`
const StyledWindowGroup = styled.div`
  border-left: 2px solid ${props => props.color};
  margin: 1rem 0rem;
`;

const StyledTabThumbnailBG = styled.a`
    height: 24px;
    display: block;
    background: white;
    margin: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.2rem;
    &:active {
        transform: scale(0.8);
    }
`;
const StyledTabThumbnail = styled.img`
    width: 24px;
`;

const StyledTabTitle = styled.div`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const StyledTabManagerHeader = styled.div`
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  color: white;
  min-height: 52px;
`;

const StyledCollapse = styled.div`
    margin-left: auto;
`;

const StyledActions = styled.div`
    position: absolute;
    top: 0;
    right: -50px;
    right: 0px;
    height: 100%;
    width: 50px;
    background: #323232;;
    transition: right 0.3s cubic-bezier(0.4, 0, 1, 1) 0s;
    display: none;
    align-items: center;
`;

const StyledActionIconWrapper = styled.div`
 display: flex;
 justify-content: center;
 align-items: center;
 margin-left: 0.5rem;
 border-radius: 50%;
 width: 28px;
 height: 28px;
 border: 1px solid white;
 &: hover{
    background: black;
 }
`;


function TabManager() {
    const [tabs, setTabs] = useState([]);
    const [windowGroups, setWindowGroups] = useState([]);
    const [collapsed, setCollapsed] = useState(false);

    const colors = ['#EA047E', '#ABD9FF', '#FF6D28', '#00F5FF', '#A7FFE4']
    const queryTabs = () => {
        chrome.tabs.query({}, (tabs) => {
            // group the tabs by window id.
            const tabsGroupedByWindow = tabs.reduce((group, tab) => {
                const windowId = tab.windowId;
                if (!group[windowId]) {
                    group[windowId] = [];
                }
                group[windowId].push(tab);
                return group;
            }, {});
            // convert the object into array
            const windowGroupsAsList = [];
            for (const key in tabsGroupedByWindow) {
                windowGroupsAsList.push({
                    windowId: key,
                    tabs: tabsGroupedByWindow[key],
                    color: 'white'
                });
            }
            // now assign color,
            windowGroupsAsList.forEach((windowGroup, index) => {
                windowGroup.color = colors[index % colors.length];
            });
            setTabs(tabs);
            setWindowGroups(windowGroupsAsList);
        });
    }
    useEffect(() => {
        // Get a list of all open tabs across all windows
        queryTabs();
        chrome.windows.onCreated.addListener(queryTabs);
        chrome.windows.onRemoved.addListener(queryTabs);
        chrome.tabs.onUpdated.addListener(queryTabs);
        chrome.tabs.onRemoved.addListener(queryTabs);

        return () => {
            chrome.windows.onCreated.removeListener(queryTabs);
            chrome.windows.onRemoved.removeListener(queryTabs);
            chrome.tabs.onUpdated.removeListener(queryTabs);
            chrome.tabs.onRemoved.removeListener(queryTabs);
        }
    }, []);

    function handleClick(tab) {
        // Switch to the window and activate the tab
        chrome.windows.update(tab.windowId, { focused: true }, () => {
            chrome.tabs.update(tab.id, { active: true });
        });
    }

    const closeTab = (e, tabId) => {
        e.stopPropagation();
        chrome.tabs.remove(tabId);
    }

    return (
        <StyledTabManagerContainer className="tab-manager" collapsed={collapsed}>
            <StyledTabManagerHeader>
                {
                    !collapsed && (
                        <StyledTabThumbnailBG>
                            <StyledTabThumbnail src={sparklyIcon} />
                        </StyledTabThumbnailBG>
                    )
                }
                {
                    !collapsed && <StyledTabTitle>
                        {'Sparkly'} <br/>
                        Tab Manager
                    </StyledTabTitle>
                }
                <StyledCollapse>
                    <div style={{ margin: '0rem 0.5rem', cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
                    </div>
                </StyledCollapse>
            </StyledTabManagerHeader>
            {
                windowGroups.map(windowGroup => (
                    <StyledWindowGroup color={windowGroup.color}>
                        {
                            windowGroup.tabs.map(tab => (
                                <StyledTabItem key={tab.id} onClick={() => handleClick(tab)}>
                                    <StyledTabThumbnailBG>
                                        <StyledTabThumbnail src={tab.favIconUrl || sparklyIcon}/>
                                    </StyledTabThumbnailBG> 
                                    <StyledTabTitle style={{ width: collapsed ? '0px': '100%' }}>
                                        {tab.title || 'Sparkly New Tab'}
                                    </StyledTabTitle>
                                    <StyledActions className='styled-tab-actions'>
                                        <StyledActionIconWrapper onClick={(e) =>  closeTab(e,tab.id)}>
                                            <CloseOutlined style={{ color: 'white' }} />
                                        </StyledActionIconWrapper>
                                    </StyledActions>
                                </StyledTabItem>
                            ))
                        }
                    </StyledWindowGroup>
                ))
            }
        </StyledTabManagerContainer>
    );
}


export default TabManager;
