/// <reference types="chrome"/>
// @ts-nocheck
import React, { useState, useReducer, useEffect } from 'react'
import { render } from 'react-dom';
import styled, { css } from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';

import { Page } from "./components/index";

import SearchBar from './components/SearchBar';
import { TopSites } from './components/Tiles'; 
import { AuthorInfoWindow } from './SettingsWindow';
import { AppContext, reducer, initialState } from './Context';
import { getObjectFromStorageSync } from '../helpers/storage';
import list1 from '../data/list1.json';
import list2 from '../data/list2.json';
import list3 from '../data/list3.json';

import appIcon from '../icons/Sparkly_x.png';

const images = [...list1, ...list2, ...list3];

const TopSection = styled.section`
  /* clock + setting icon on right */
  padding: 1rem; 
  display: flex;
`;
const MiddleSection = styled.section`
    /* main search bar + top sites */
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const BottomSection = styled.section`
    /* author + info */
    display: flex;
    justify-content: center;
    padding:1em;
`;


const Right = styled.div`
    margin-left: auto;
    justify-self: end;
    display: flex;
`;

const Left = styled.div`
    justify-self: start;
    display: flex;
`;

const RoundedIcon = styled.div`
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1.5rem;
    color: white;
    position: relative;
    transition: transform 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
    &:active{
        transform: scale(0.8);
    }
    background: #ffffff33;
    width: 32px;
    height: 32px;
`;

const ActionButton = ({ icon, title, children }: any) => {
    const [open, setOpen] = useState(false);
    return (
        <OutsideClickHandler onOutsideClick={()=>setOpen(false)}>
        <div style={{position:'relative'}}>
            <RoundedIcon title={title} onClick={e=>setOpen(!open)}>
                {icon}
            </RoundedIcon>
            {open && children}
        </div>
        </OutsideClickHandler>

    )
};


const StyledBackgroundImage = styled.img<{src:any}>`
    position: absolute;
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
    z-index: -1;
`;
 
const StyledBackgroundGradient = styled.div<{ gradient:any}>`
    position: absolute;
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
    z-index: -1;
    background: ${props => props.gradient};
`;

function PageBackground({ availableImage, onError }){
    if (availableImage) {
        return <StyledBackgroundImage src={availableImage} onError={onError}/>
    }

    return <StyledBackgroundGradient gradient={'#000'} />
}

const AppTitle = styled.div`
    & > img {
        width: 300px;
    }
`;

function NewTab() {
    const [store, dispatch] = useReducer(reducer, initialState);
    const [availableImage, setAvailableImage] = React.useState(null);
    const [imageInfo, setImageInfo] = React.useState(null);
    useEffect(async () => {
        const { activeImageIndex = 0 } = await getObjectFromStorageSync();
        const image = images[activeImageIndex];
        const regularURL = image.urls.regular; // change it to full once buffered loading implimented.
        setImageInfo(image);
        setAvailableImage(regularURL);
        chrome.storage.sync.set({ activeImageIndex: (activeImageIndex + 1) % images.length })
    }, []);
    const imageAuthor = imageInfo?.user?.username;
    const imageAuthorUnsplashLink = imageInfo?.user?.links?.html;
    const showBottomBar = imageAuthor && imageAuthorUnsplashLink;
    const handleImageLoadError = () => {
        setImageInfo(null);
        setAvailableImage(null);
    }
    return ( 
        <AppContext.Provider value={[store, dispatch]}>
        <Page relative style={{background:'black'}}>
            <PageBackground availableImage={availableImage} onError={handleImageLoadError}/>
            <TopSection>
                <Right>  
                    <ActionButton icon={'i'} title={'About'}>
                        <AuthorInfoWindow />
                    </ActionButton>
                </Right>
            </TopSection> 
            <MiddleSection> 
                <div style={{ textAlign: 'center' }}>
                    <AppTitle>
                       <img src={appIcon} alt="sparky logo"/>
                    </AppTitle>
                    <SearchBar />
                    <TopSites />
                </div>
            </MiddleSection>
            { showBottomBar && <BottomSection>
                <div style={{ background:"#0101012b", color: "white", padding:"0.2rem 0.5rem" }}>
                    Photo by <a style={{ color: "white" }} href={imageAuthorUnsplashLink}>{imageAuthor}</a> - Unsplash
                </div>
            </BottomSection>}
        </Page>
        </AppContext.Provider> 
    )
} 

render(<NewTab />, document.getElementById("app")); 