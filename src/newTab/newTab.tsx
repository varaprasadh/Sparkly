/// <reference types="chrome"/>
// @ts-nocheck
import React, { useState, useReducer, useEffect } from 'react'
import { render } from 'react-dom';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';

import { Page } from "./components/index";

import SearchBar from './components/SearchBar';
import { TopSites } from './components/Tiles'; 
import { AuthorInfoWindow } from './SettingsWindow';
import { AppContext, reducer } from './Context';
import { getObjectFromStorageLocal, getObjectFromStorageSync } from '../helpers/storage';
import list1 from '../data/list1.json';
import list2 from '../data/list2.json';
import list3 from '../data/list3.json';

import appIcon from '../icons/Sparkly_x.png';
import fallBackWallpaper from '../assets/images/fallback_wallpaper.jpg';
import { defaultBookMarks } from '../data/index';
import settingsIcon from "../assets/svg/settings_filled.svg";
import closeIcon from "../assets/svg/close.svg";
import plusIcon from "../assets/svg/plus.svg";
import cursorIcon from "../icons/cursor.png"
import { WallpaperHistory, WallpaperSelector } from './components/WallpaperSelector';
import { RandomWallpaperConfigPlaceHolder } from './components/RandomWallpaperConfigPlaceHolder';
import AddBookMarkForm from './components/Forms/AddBookMarkForm';

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const images = [...list1, ...list2, ...list3];

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
    padding: 0.1rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    color: black;
    position: relative;
    transition: transform 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
    &:active{
        transform: scale(0.8);
    }
    background: white;
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
    & > img {
        width: 300px;
        -webkit-user-drag: none;
    }
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


const StyledBookMarkBarWrapper = styled.div`
    background: rgb(0 0 0 / 50%);
    display: flex;
    flex-direction: column;
`;

const StyledBookMarks = styled.div`
    flex: 1;
    overflow: auto;
    &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }
`;
const StyledBookMark = styled.a`
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
const StyledBookMarkThumbnail = styled.img`
    width: 24px;
`;

const StyledSettingsAction = styled.div`
    height: 24px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    display: block;
    background: white;
    margin: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease 0s;
    padding: 0.2rem
`;
const StyledSettingsIcon = styled.img`
    width: 24px;
`;


function ActionBar({ userBookmarks = [], onOpenSettings = () => {}, onOpenAddBookMark = () => {} }) {

    return (
        <StyledBookMarkBarWrapper>
            <StyledBookMarks>
                {
                    defaultBookMarks.map((bookmark) => (
                        <StyledBookMark href={bookmark.url} title={bookmark.title} key={bookmark.url}>
                            <StyledBookMarkThumbnail src={bookmark.thumbnail}/>
                        </StyledBookMark>
                    ))
                }
                {
                    userBookmarks.map((bookmark) => (
                        <StyledBookMark href={bookmark.url} title={bookmark.title} key={bookmark.url}>
                            <StyledBookMarkThumbnail src={bookmark.thumbnail || cursorIcon}/>
                        </StyledBookMark>
                    ))
                }
                <StyledBookMark onClick={onOpenAddBookMark}>
                    <img src={plusIcon} />
                </StyledBookMark>
            </StyledBookMarks>
            <StyledSettingsAction onClick={onOpenSettings}>
                <StyledSettingsIcon src={settingsIcon}/>
            </StyledSettingsAction>
        </StyledBookMarkBarWrapper>
    );
}

const StyledSettingsContainer = styled.div`
    background: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    padding: 0.5rem 1rem;
    border-radius: 0.2rem;
    max-width: 800px;
`;
const StyledSettingsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0px;
    border-bottom: 1px solid #dedde1;
`;
const StyledSettingsBody = styled.div``;
const StyledTitle = styled.div`
    font-size: 1.2rem;
`;
const StyledCloseIcon = styled.img`
    width: 24px;
    cursor: pointer;
`;
const StyledSettingsSection = styled.div`

`;
const StyledRadioGroup = styled.div`
    display:flex;
    align-items: center;
`;
const StyledWallpaperConfigSelector = styled.div`
    display:flex;
    align-items: center;
`;
const StyledSettingsActionSection = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0.5rem 0rem;
    margin-top: 0.5rem;
    border-top: 1px solid #dedde1;
`;
const StyledCloseButton = styled.div`
    color: tomato;
    text-decoration: underline;
    cursor: pointer;
    font-size: 1.1em;
`;
const StyledSaveButton = styled.div`
    background: black;
    color: white;
    padding: 0.2rem 0.5rem;
    margin-left: 0.5rem;
    border-radius: 0.1rem;
    cursor: pointer;
    font-size: 1.1em;
`;
function Settings({ onClose = () => {}, onReloadWallpaper = () => {} }) {
    const [wallpaperConfigType, setWallpaperConfigType] = useState('random')// get from store;
    const [customWallpaperInfo, setCustomWallpaperInfo] = useState(null); // load from store if exist;
    const [bufferingImage, setBufferingImage] = useState(false); 
    const onCustomWallpaperSelected = (imageInfo) => {
        setCustomWallpaperInfo(imageInfo);
    }
    useEffect(async () => {
        const { wallpaperConfigType = 'random' } = await getObjectFromStorageLocal("wallpaperConfigType");
        setWallpaperConfigType(wallpaperConfigType);
    }, []);
    const handleSaveAndClose = async () => {
        // process the current configuration
        // if random image
        /*
            fetch the random image object, load and cache
        */
        if (wallpaperConfigType === 'random') {
            const randomUrl = `https://unsplash.com/napi/photos/random?query=nature,sky,cosmos,illustrations&per_page=20&page=1&orientation=landscape`;
            const imageObject = await fetch(randomUrl).then(res => res.json());
            // cache the imageObject
            const imageURL = imageObject.urls.full;
            setBufferingImage(true);
            fetch(imageURL).then(res => res.blob()).then(blob => {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    chrome.storage.local.set({ bufferedImage: reader.result });
                    chrome.storage.local.set({ bufferedImageMetadata: JSON.stringify(imageObject) });
                    chrome.storage.local.set({ wallpaperConfigType: wallpaperConfigType });
                    setBufferingImage(false);
                    onClose();
                });
                reader.readAsDataURL(blob);
            });
            // save the config to storage.
        } else if (['custom', 'history'].includes(wallpaperConfigType)) {
            if (customWallpaperInfo === null) return onClose();
            const imageURL = customWallpaperInfo.urls.full;
            setBufferingImage(true);
            fetch(imageURL).then(res => res.blob()).then(blob => {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    chrome.storage.local.set({ bufferedImage: reader.result });
                    chrome.storage.local.set({ bufferedImageMetadata: JSON.stringify(customWallpaperInfo) });
                    chrome.storage.local.set({ wallpaperConfigType: wallpaperConfigType });
                    onReloadWallpaper();
                    setBufferingImage(false);
                    onClose();
                });
                reader.readAsDataURL(blob);
            });
        }
    }
    return (
        <StyledSettingsContainer>
            <StyledSettingsHeader>
                <StyledTitle>Settings <sup style={{fontWeight: 'bold', fontSize: '0.6rem', letterSpacing: '1px'}}>Beta</sup></StyledTitle>
                <StyledCloseIcon src={closeIcon} onClick={onClose}></StyledCloseIcon>
            </StyledSettingsHeader>
            <StyledSettingsBody>
              <StyledSettingsSection>
                    <StyledTitle>Wallpaper Preference</StyledTitle>
                    <StyledWallpaperConfigSelector>
                        <StyledRadioGroup>
                            <input type="radio" name="wallpaperConfig" id="random"
                                value={'random'}
                                checked={wallpaperConfigType === 'random'}
                                onChange={e => setWallpaperConfigType(e.target.value)}
                            />
                            <label htmlFor='random'>Random</label>
                        </StyledRadioGroup>
                        <StyledRadioGroup>
                            <input type="radio" name="wallpaperConfig" id="custom"
                                value={'custom'}
                                checked={wallpaperConfigType === 'custom'}
                                onChange={e => setWallpaperConfigType(e.target.value)}
                            />
                            <label htmlFor='custom'>Custom</label>
                        </StyledRadioGroup>
                        <StyledRadioGroup>
                            <input type="radio" name="wallpaperConfig" id="history"
                                value={'history'}
                                checked={wallpaperConfigType === 'history'}
                                onChange={e => setWallpaperConfigType(e.target.value)}
                            />
                            <label htmlFor='history'>From Your Wallpaper History</label>
                        </StyledRadioGroup>
                    </StyledWallpaperConfigSelector>
                    {wallpaperConfigType === 'random' && <RandomWallpaperConfigPlaceHolder /> }
                    {wallpaperConfigType === 'custom' && <WallpaperSelector onSelect={onCustomWallpaperSelected}/> }
                    {wallpaperConfigType === 'history' && <WallpaperHistory onSelect={onCustomWallpaperSelected}/> }
              </StyledSettingsSection>
                <StyledSettingsActionSection>
                    <StyledCloseButton onClick={onClose}>Close</StyledCloseButton>
                    <StyledSaveButton onClick={handleSaveAndClose}>{bufferingImage ? 'Saving...' : 'Save & Close'}</StyledSaveButton>
                </StyledSettingsActionSection>
            </StyledSettingsBody>
        </StyledSettingsContainer>
    )
}


function NewTab() {
    const [store, dispatch] = useReducer(reducer, {});
    const [availableImage, setAvailableImage] = React.useState(null);
    const [imageInfo, setImageInfo] = React.useState(null);
    const [showSettings, setShowSettings] = React.useState(false);
    const [showBookmarkForm, setShowBookmarkForm] = React.useState(false);
    const [userBookmarks, setUserBookmarks] = useState([]);
    useEffect(async () => {
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
            const imageURL = imageObject.urls.full;
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
        if(Object.keys(imageMetaData).length > 0) {
            wallpapersTrail = JSON.parse(wallpapersTrail);
            const isAlreadyInTrail = wallpapersTrail.find(o=>o.id === imageMetaData.id);
            if (!isAlreadyInTrail) {
                wallpapersTrail.push(imageMetaData);
            }
            if (wallpapersTrail.length > 10) wallpapersTrail.shift();
            chrome.storage.local.set({ wallpapersTrail: JSON.stringify(wallpapersTrail) });
        }

        // read the user bookmarks
        const { userBookmarks: ub = [] } = await getObjectFromStorageLocal("userBookmarks");
        setUserBookmarks(ub);
    }
    const imageAuthor = imageInfo?.user?.username;
    const imageAuthorUnsplashLink = imageInfo?.user?.links?.html;
    const showBottomBar = imageAuthor && imageAuthorUnsplashLink;
    const handleImageLoadError = () => {
        setImageInfo(null);
        setAvailableImage(fallBackWallpaper);
    }
    const onOpenSettings = () => {
        setShowSettings(true);
    };
    const onCloseSettings = () => {
        setShowSettings(false);
    };

    const onOpenAddBookMark = () => {
        setShowBookmarkForm(true);
    }

    const addNewBookMark = async (bookmark) => {
        const existing = userBookmarks.some(b => b.url === bookmark.url);
        if (existing) {
            toast.warning("You've added the similar bookmark before, sparkly will not add this item now.")
            setShowBookmarkForm(false);
            return;
        }
        const updatedBookmarks =  [...userBookmarks, bookmark];
        chrome.storage.local.set({
            userBookmarks: updatedBookmarks
        });
    
        setUserBookmarks(updatedBookmarks);
        setShowBookmarkForm(false);
        toast.success("Bookmark has been saved!");
    }

    return ( 
        <AppContext.Provider value={[store, dispatch]}>
            <Page relative style={{background:'black'}}>
                <PageBackground availableImage={availableImage} onError={handleImageLoadError}/>
                <StyledMainColumn>
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
                                <img src={appIcon} alt="sparkly logo" />
                            </AppTitle>
                            <SearchBar />
                            <TopSites />
                        </div>
                    </MiddleSection>
                    {showBottomBar && <BottomSection>
                        <div style={{ background: "#0101012b", color: "white", padding: "0.2rem 0.5rem" }}>
                            Photo by <a style={{ color: "white" }} href={imageAuthorUnsplashLink}>{imageAuthor}</a> - Unsplash
                        </div>
                    </BottomSection>}
                </StyledMainColumn>
                <ActionBar
                    userBookmarks={userBookmarks}
                    onOpenSettings={onOpenSettings}
                    onOpenAddBookMark={onOpenAddBookMark}
                />
                {showSettings && <Settings onClose={onCloseSettings} onReloadWallpaper={boot}/>}
                {showBookmarkForm  && <AddBookMarkForm
                    open={showBookmarkForm}
                    handleCancel={() => setShowBookmarkForm(false)}
                    onAddBookMark={addNewBookMark}
                />}
            </Page>
            <ToastContainer />
        </AppContext.Provider> 
    )
} 

render(<NewTab />, document.getElementById("app")); 