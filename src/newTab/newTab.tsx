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
import { useUI, useSettings, useInitialization } from '../store/hooks';
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
    gap: var(--layout-gap, 24px);
    padding: var(--layout-padding, 24px);
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
`;

const WidgetContainer = styled.div`
    height: 380px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(16px);
    border-radius: var(--widget-border-radius, 12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transition: border-radius var(--transition-duration, 0.2s);

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

function PageBackground({ availableImage, onError, solidColor, blur, dim }: {
    availableImage: string | null;
    onError: () => void;
    solidColor?: string;
    blur?: boolean;
    dim?: boolean;
}) {
    if (solidColor) {
        return <StyledBackgroundGradient gradient={solidColor} />;
    }

    if (availableImage) {
        return (
            <StyledBackgroundWrapper>
                <StyledBackgroundImage
                    src={availableImage}
                    onError={onError}
                    style={{
                        filter: blur ? 'blur(6px)' : undefined,
                        transform: blur ? 'scale(1.05)' : undefined,
                    }}
                />
                {dim && <StyledBackgroundOverlay />}
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
    border-radius: var(--default-radius, 12px);
    cursor: pointer;
    transition: all var(--transition-duration, 0.3s) cubic-bezier(0.25, 0.8, 0.25, 1);

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
    margin: 0 auto 24px auto;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--default-radius, 12px);
    cursor: pointer;
    transition: all var(--transition-duration, 0.3s) cubic-bezier(0.25, 0.8, 0.25, 1);

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

// Chrome footer tip banner
const TipBanner = styled.div`
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 15, 20, 0.92);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 520px;
    z-index: 200;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    animation: tipSlideUp 0.3s ease;

    @keyframes tipSlideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;

const TipText = styled.div`
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    line-height: 1.4;
    flex: 1;
`;

const TipDismiss = styled.button`
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }
`;

function ChromeFooterTip() {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        chrome.storage.local.get(['sparkly_footer_tip_dismissed'], (result) => {
            if (!result.sparkly_footer_tip_dismissed) {
                setVisible(true);
            }
        });
    }, []);

    const dismiss = () => {
        setVisible(false);
        chrome.storage.local.set({ sparkly_footer_tip_dismissed: true });
    };

    if (!visible) return null;

    return (
        <TipBanner>
            <TipText>
                Seeing a bar at the bottom? Right-click it and select <strong style={{ color: 'white' }}>"Hide footer on New Tab page"</strong> for a cleaner look.
            </TipText>
            <TipDismiss onClick={dismiss}>Got it</TipDismiss>
        </TipBanner>
    );
}

// Action Bar component with quick access bookmarks, apps, and settings
function ActionBar({ onOpenSettings }: { onOpenSettings: () => void }) {
    const { general } = useSettings();

    return (
        <StyledActionBar>
            {/* Quick Access Bookmarks - respect showBookmarks setting */}
            {general.showBookmarks && (
                <StyledBookMarks>
                    {defaultBookMarks.map((bookmark) => (
                        <StyledBookMark href={bookmark.url} title={bookmark.title} key={bookmark.url}>
                            <StyledBookMarkThumbnail src={bookmark.thumbnail} />
                        </StyledBookMark>
                    ))}
                </StyledBookMarks>
            )}

            {general.showBookmarks && <Divider />}

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

    // Use the new store for settings
    const { openSettings } = useUI();
    const { wallpaper } = useSettings();
    const { initialized } = useInitialization();
    const hasBooted = React.useRef(false);

    // Load wallpaper from chrome storage and display it
    const loadBufferedWallpaper = React.useCallback(async () => {
        const { bufferedImage } = await getObjectFromStorageLocal("bufferedImage");
        const { bufferedImageMetadata } = await getObjectFromStorageLocal("bufferedImageMetadata");

        const imageMetaData = JSON.parse(bufferedImageMetadata || '{}');
        const displayableImage = bufferedImage ? URL.createObjectURL(dataURItoBlob(bufferedImage)) : fallBackWallpaper;
        setImageInfo(imageMetaData);
        setAvailableImage(displayableImage);

        // Track wallpaper history
        if (Object.keys(imageMetaData).length > 0) {
            let { wallpapersTrail = '[]' } = await getObjectFromStorageLocal("wallpapersTrail");
            wallpapersTrail = JSON.parse(wallpapersTrail);
            const isAlreadyInTrail = wallpapersTrail.find(o => o.id === imageMetaData.id);
            if (!isAlreadyInTrail) {
                wallpapersTrail.push(imageMetaData);
            }
            if (wallpapersTrail.length > 10) wallpapersTrail.shift();
            chrome.storage.local.set({ wallpapersTrail: JSON.stringify(wallpapersTrail) });
        }
    }, []);

    // Boot once after store is initialized (so we read the correct wallpaper.source)
    useEffect(() => {
        if (!initialized || hasBooted.current) return;
        hasBooted.current = true;

        const source = wallpaper.source || 'random';

        if (source === 'color') {
            setAvailableImage(null);
            setImageInfo(null);
            return;
        }

        // Only fetch a new random wallpaper when source is 'random'
        if (source === 'random') {
            (async () => {
                try {
                    const randomUrl = `https://unsplash.com/napi/photos/random?query=nature,sky,cosmos,illustrations&per_page=20&page=1&orientation=landscape`;
                    const imageObject = await fetch(randomUrl).then(res => res.json());
                    const imageURL = imageObject?.urls?.full;
                    fetch(imageURL).then(res => res.blob()).then(blob => {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            chrome.storage.local.set({ bufferedImage: reader.result });
                            chrome.storage.local.set({ bufferedImageMetadata: JSON.stringify(imageObject) });
                        });
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.error('Failed to fetch random wallpaper:', err);
                }
            })();
        }

        // For all image-based sources, display the currently cached image
        loadBufferedWallpaper();
    }, [initialized]); // eslint-disable-line react-hooks/exhaustive-deps

    // Re-apply wallpaper whenever wallpaper settings change in the store (i.e. after save)
    const wallpaperJson = JSON.stringify(wallpaper);
    useEffect(() => {
        if (!hasBooted.current) return;

        const source = wallpaper.source || 'random';

        if (source === 'color') {
            setAvailableImage(null);
            setImageInfo(null);
        } else {
            loadBufferedWallpaper();
        }
    }, [wallpaperJson]); // eslint-disable-line react-hooks/exhaustive-deps

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
                <PageBackground
                    availableImage={availableImage}
                    onError={handleImageLoadError}
                    solidColor={wallpaper.source === 'color' ? (wallpaper.solidColor || '#1f2937') : undefined}
                    blur={wallpaper.blur}
                    dim={wallpaper.dim}
                />
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

                {/* One-time tip about Chrome's footer bar */}
                <ChromeFooterTip />
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
