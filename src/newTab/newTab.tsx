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

const images = [...list1, ...list2, ...list3];

const StyledMainColumn = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    flex: 1;
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
`;

const StyledBookMarks = styled.div`
    
`;
const StyledBookMark = styled.a`
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


function BookMarkBar() {
    return (
        <StyledBookMarkBarWrapper>
            <StyledBookMarks>
                {
                    defaultBookMarks.map((bookmark) => (
                        <StyledBookMark href={bookmark.url} title={bookmark.title}>
                            <StyledBookMarkThumbnail src={bookmark.thumbnail}/>
                        </StyledBookMark>
                    ))
                }
            </StyledBookMarks>
        </StyledBookMarkBarWrapper>
    );
}


function NewTab() {
    const [store, dispatch] = useReducer(reducer, {});
    const [availableImage, setAvailableImage] = React.useState(null);
    const [imageInfo, setImageInfo] = React.useState(null);
    useEffect(async () => {
        const { activeImageIndex = 0 } = await getObjectFromStorageSync();
        const { bufferedImage } = await getObjectFromStorageLocal("bufferedImage");
        const image = images[activeImageIndex];
        const displayableImage = bufferedImage ? URL.createObjectURL(dataURItoBlob(bufferedImage)) : fallBackWallpaper;
        const imageInfo = bufferedImage ? image : null;
        setImageInfo(imageInfo);
        setAvailableImage(displayableImage);
        // activeImageIndex is buffered and loaded, load the next image.
        const nextImageIndex = bufferedImage ? (activeImageIndex + 1) % images.length : activeImageIndex;
        const nextImage = images[nextImageIndex];
        const imageURL = nextImage.urls.full;
        fetch(imageURL).then(res => res.blob()).then(blob => {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                chrome.storage.local.set({ bufferedImage: reader.result });
                chrome.storage.sync.set({ activeImageIndex: nextImageIndex });
            });
            reader.readAsDataURL(blob);
        });
    }, []);
    const imageAuthor = imageInfo?.user?.username;
    const imageAuthorUnsplashLink = imageInfo?.user?.links?.html;
    const showBottomBar = imageAuthor && imageAuthorUnsplashLink;
    const handleImageLoadError = () => {
        setImageInfo(null);
        setAvailableImage(fallBackWallpaper);
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
                                <img src={appIcon} alt="sparky logo" />
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
                <BookMarkBar></BookMarkBar>
            </Page>
        </AppContext.Provider> 
    )
} 

render(<NewTab />, document.getElementById("app")); 