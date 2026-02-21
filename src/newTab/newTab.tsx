/// <reference types="chrome"/>
// @ts-nocheck
import React, { useState, useReducer, useEffect } from 'react'
import { render } from 'react-dom';
import styled from 'styled-components';

import { Page } from "./components/index";

import SearchBar from './components/SearchBar';
import { TopSites } from './components/Tiles';
import { AppContext, reducer } from './Context';
import { getObjectFromStorageLocal } from '../helpers/storage';

import appIcon from '../icons/Sparkly_x.png';
import fallBackWallpaper from '../assets/images/fallback_wallpaper.jpg';
import { defaultBookMarks } from '../data/index';
import settingsIcon from "../assets/svg/settings_filled.svg";

import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import TabManager from './components/TabManager';
import LocalDateTime from './components/LocalDatetime';

// New plugin system imports
import { AppProvider } from '../store/AppContext';
import { PluginProvider, pluginRegistry } from '../plugins';
import { registerBuiltinPlugins } from '../plugins/builtin';
import { SettingsModal } from '../settings';
import { useUI } from '../store/hooks';
import { ThemeProvider } from '../components/ThemeProvider';
import { hackerNewsInstance } from '../plugins/builtin/hackernews';
import { githubInstance } from '../plugins/builtin/github';
import { devtoInstance } from '../plugins/builtin/devto';

const HackerNewsWidget = hackerNewsInstance.Component;
const GitHubWidget = githubInstance.Component;
const DevToWidget = devtoInstance.Component;

const StyledMainColumn = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    flex: 1;
    overflow:auto;
    &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }
`;

const TopSection = styled.section`
  /* clock + setting icon on right */
  padding: 1rem;
  display: flex;
`;
const MiddleSection = styled.section`
    /* main search bar + top sites */
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 4rem;
    padding-bottom: 2rem;
`;

const DashboardGrid = styled.section`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
`;

const WidgetContainer = styled.div`
    height: 380px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(16px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    
    /* Make internal container fill the space with a blur */
    & > div {
       background: transparent !important;
       color: white;
       height: 100% !important;
    }
    
    /* Modify specific widget internal elements */
    & h3 { color: white !important; }
    & a { color: rgba(255,255,255,0.9) !important; }
    & a:hover { background: rgba(255,255,255,0.1) !important; }
    & div { border-color: rgba(255,255,255,0.1) !important; }
`;

const BottomSection = styled.section`
    /* author + info */
    display: flex;
    justify-content: center;
    padding: 0 1em 1em 1em;
`;


const Right = styled.div`
    margin-left: auto;
    justify-self: end;
    display: flex;
`;

const StyledBackgroundImage = styled.img<{ src: any }>`
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
    z-index: -1;
`;
const StyledBackgroundWrapper = styled.div`
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: hidden;
    z-index: -1;
`;
const StyledBackgroundOverlay = styled.div`
    width: 100%;
    height: 100%;
    background: rgb(0 0 0 / 10%);
    left: 0%;
    top: 0%;
    position: absolute;
 `;
const StyledBackgroundGradient = styled.div<{ gradient: any }>`
    position: absolute;
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
    z-index: -1;
    background: ${props => props.gradient};
`;

function PageBackground({ availableImage, onError }) {
    if (availableImage) {
        return (
            <StyledBackgroundWrapper>
                <StyledBackgroundImage src={availableImage} onError={onError} />
                <StyledBackgroundOverlay></StyledBackgroundOverlay>
            </StyledBackgroundWrapper>
        );
    }

    return <StyledBackgroundGradient gradient={'#000'} />
}

const AppTitle = styled.div`
    display: none;
`;
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;

}


// Styled components for the Action Bar (right sidebar with quick access)
const StyledActionBar = styled.div`
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    z-index: 50;
    padding: 16px 8px;
`;

const StyledBookMarks = styled.div`
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }
`;

const StyledBookMark = styled.a`
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

const StyledBookMarkThumbnail = styled.img`
    width: 24px;
    height: 24px;
    border-radius: 4px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const Divider = styled.div`
    height: 1px;
    background: rgba(255, 255, 255, 0.15);
    margin: 12px 0;
`;

const StyledSettingsAction = styled.div`
    width: 44px;
    height: 44px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(45deg);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
        transform: scale(0.95) rotate(45deg);
    }
`;

const StyledSettingsIcon = styled.img`
    width: 24px;
    height: 24px;
    filter: invert(1);
    opacity: 0.9;
`;

const AppDockSection = styled.div`
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin-top: 8px;
`;

// Action Bar component with quick access bookmarks, apps, and settings
function ActionBar({ onOpenSettings }: { onOpenSettings: () => void }) {
    return (
        <StyledActionBar>
            {/* Quick Access Bookmarks */}
            <StyledBookMarks>
                {defaultBookMarks.map((bookmark) => (
                    <StyledBookMark href={bookmark.url} title={bookmark.title} key={bookmark.url}>
                        <StyledBookMarkThumbnail src={bookmark.thumbnail} />
                    </StyledBookMark>
                ))}
            </StyledBookMarks>

            {/* App Dock (Removed OS-like apps) */}

            <Divider />

            {/* Settings Button */}
            <StyledSettingsAction onClick={onOpenSettings} title="Settings">
                <StyledSettingsIcon src={settingsIcon} />
            </StyledSettingsAction>
        </StyledActionBar>
    );
}

// Main content component that uses the new store
function NewTabContent() {
    const [store, dispatch] = useReducer(reducer, {});
    const [availableImage, setAvailableImage] = React.useState(null);
    const [imageInfo, setImageInfo] = React.useState(null);

    // Use the new UI store for settings
    const { openSettings } = useUI();

    useEffect(() => {
        boot();
    }, []);

    const boot = async () => {
        const { bufferedImage } = await getObjectFromStorageLocal("bufferedImage");
        const { bufferedImageMetadata } = await getObjectFromStorageLocal("bufferedImageMetadata");
        const { wallpaperConfigType = 'random' } = await getObjectFromStorageLocal("wallpaperConfigType");
        let { wallpapersTrail = '[]' } = await getObjectFromStorageLocal("wallpapersTrail");
        if (wallpaperConfigType === 'random') {
            // load the next wallpaper and cache it.
            const randomUrl = `https://unsplash.com/napi/photos/random?query=nature,sky,cosmos,illustrations&per_page=20&page=1&orientation=landscape`;
            const imageObject = await fetch(randomUrl).then(res => res.json());
            // cache the imageObject
            const imageURL = imageObject?.urls?.full;
            fetch(imageURL).then(res => res.blob()).then(blob => {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    chrome.storage.local.set({ bufferedImage: reader.result });
                    chrome.storage.local.set({ bufferedImageMetadata: JSON.stringify(imageObject) });
                    chrome.storage.local.set({ wallpaperConfigType: wallpaperConfigType });
                });
                reader.readAsDataURL(blob);
            });
        }
        const imageMetaData = JSON.parse(bufferedImageMetadata || '{}');
        const displayableImage = bufferedImage ? URL.createObjectURL(dataURItoBlob(bufferedImage)) : fallBackWallpaper;
        setImageInfo(imageMetaData);
        setAvailableImage(displayableImage);
        // keep track of last 5 wallpapers
        if (Object.keys(imageMetaData).length > 0) {
            wallpapersTrail = JSON.parse(wallpapersTrail);
            const isAlreadyInTrail = wallpapersTrail.find(o => o.id === imageMetaData.id);
            if (!isAlreadyInTrail) {
                wallpapersTrail.push(imageMetaData);
            }
            if (wallpapersTrail.length > 10) wallpapersTrail.shift();
            chrome.storage.local.set({ wallpapersTrail: JSON.stringify(wallpapersTrail) });
        }

    }

    const imageAuthor = imageInfo?.user?.username;
    const imageAuthorUnsplashLink = imageInfo?.user?.links?.html;
    const showBottomBar = imageAuthor && imageAuthorUnsplashLink;

    const handleImageLoadError = () => {
        setImageInfo(null);
        setAvailableImage(fallBackWallpaper);
    }

    const onOpenSettings = () => {
        openSettings();
    };

    return (
        <AppContext.Provider value={[store, dispatch]}>
            <Page relative style={{ background: 'black' }}>
                <PageBackground availableImage={availableImage} onError={handleImageLoadError} />
                <TabManager />
                <StyledMainColumn>
                    <MiddleSection>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <LocalDateTime />
                            <SearchBar />
                            <TopSites />
                        </div>
                    </MiddleSection>
                    <DashboardGrid>
                        <WidgetContainer>
                            <HackerNewsWidget api={null as any} />
                        </WidgetContainer>
                        <WidgetContainer>
                            <GitHubWidget api={null as any} />
                        </WidgetContainer>
                        <WidgetContainer>
                            <DevToWidget api={null as any} />
                        </WidgetContainer>
                    </DashboardGrid>
                    {showBottomBar && <BottomSection>
                        <div style={{ background: "#0101012b", color: "white", padding: "0.2rem 0.5rem", borderRadius: "8px" }}>
                            Photo by <a style={{ color: "white" }} href={imageAuthorUnsplashLink}>{imageAuthor}</a> - Unsplash
                        </div>
                    </BottomSection>}
                </StyledMainColumn>

                {/* Right Action Bar with quick access apps, bookmarks, and settings */}
                <ActionBar onOpenSettings={onOpenSettings} />

                {/* Settings Modal */}
                <SettingsModal />
            </Page>
            <ToastContainer />
        </AppContext.Provider>
    )
}

// App wrapper that initializes plugins
function NewTab() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Register built-in plugins
        registerBuiltinPlugins(pluginRegistry);
        setReady(true);
    }, []);

    if (!ready) {
        return <div style={{ background: 'black', minHeight: '100vh' }} />;
    }

    return (
        <AppProvider>
            <PluginProvider>
                <ThemeProvider>
                    <NewTabContent />
                </ThemeProvider>
            </PluginProvider>
        </AppProvider>
    );
}

render(<NewTab />, document.getElementById("app"));
