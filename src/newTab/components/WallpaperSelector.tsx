// @ts-nocheck
/// <reference types="chrome"/>
import React, { useState, useEffect, Ref } from 'react'
import { getObjectFromStorageLocal } from '../../helpers/storage';
import styled, { css } from 'styled-components';


const StyledWallpaperSelectorContainer = styled.div`
`;
const StyledWallpaperSearchBarContainer = styled.div`
    display: flex;
    padding: 0.5rem 0rem;
`;
const StyledSearchBarGroup = styled.div`
    display: flex;
    align-items: center;
    border: 1px solid black;
`;
const StyledWallpaperSearchBar = styled.input`
    border: none;
    &:focus {
        outline: none;
        border: none;
    }
`;

const StyledWallpaperGridContainer = styled.div`
    height: 400px;
    position: relative;
    overflow: auto;
    &::-webkit-scrollbar-track
    {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        border-radius: 10px;
        background-color: #F5F5F5;
    }
    &::-webkit-scrollbar
    {
        width: 12px;
        background-color: #F5F5F5;
    }
    &::-webkit-scrollbar-thumb
    {
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #555;
    }
`;

const StyledSearchButton = styled.button`
    cursor: pointer;
    background: black;
    color: white;
    outline: none;
    border: none;
    padding: 0.2rem;
`;
const StyledWallpaperGrid: any = styled.div`
    display: flex;
    flex-wrap: wrap;
`;
const StyledWallpaperMiniPreview = styled.div<{ active: boolean }>`
    width: 150px;
    cursor: pointer;
    margin: 0.2rem;
    box-sizing: border-box;
    border: 2px solid ${props => props.active ? 'black' : 'transparent'};
`;
const StyledWallpaperMiniPreviewImage = styled.img`
    width: 100%;
    aspect-ratio: 16 / 9;
    height: 100%;
`;

const StyledLoader = styled.div`
    padding: 0.5rem;
    display: flex;
    justify-content: center;
`;

const StyledLoadMore = styled.div`
    margin: auto;
    width: fit-content;
    padding: 0.5rem 1rem;
    text-decoration: underline;
    border-radius: 0.5rem;
    cursor: pointer;f
`;

export function WallpaperSelector({ onSelect = (a: any) => a }) {
    const randomIndex = Math.floor(Math.random()*5);
    const [query, setQuery] = useState(['Nature', 'Sky', 'Illustrations', 'Cartoons', 'Animals'][randomIndex]);
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState<Array<any>>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedImage, setSelectedImage] = useState({ id: null,});
    // @ts-ignore
    useEffect(async () => {
        // get random image set
        await fetchImages(query, page);
    }, []);

    const fetchImages = async (query: String, page: Number, append: Boolean = true) => {
        const url = `https://unsplash.com/napi/search/photos?query=${query}&per_page=20&page=${page}&orientation=landscape`;
        try {
            setLoading(true);
            const response = await fetch(url).then(res => res.json());
            if (append) {
                setImages([...images, ...response.results]);
            } else {
                setImages([...response.results]);
            }
            setTotalPages(response.total_pages);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    const search = async () => {
        setImages([]);
        setTotalPages(1);
        setPage(1);
        await fetchImages(query, page, false);
    }
    const loadMore = async () => {
        console.log(page, totalPages);
        if (page >= totalPages) return;
        await fetchImages(query, page+1, true);
        setPage(page + 1); 
        
    }
    const select = (image: any) => {
        setSelectedImage(image);
        onSelect(image);
    }
    return (
        <StyledWallpaperSelectorContainer>
            <StyledWallpaperSearchBarContainer>
                <StyledSearchBarGroup>
                    <StyledWallpaperSearchBar
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyUp={e => e.key === 'Enter' && search()}
                    />
                    <StyledSearchButton onClick={search}>Search</StyledSearchButton>
                </StyledSearchBarGroup>
            </StyledWallpaperSearchBarContainer>
            <StyledWallpaperGridContainer>
                <StyledWallpaperGrid>
                    {
                        images.map(image => (
                            <StyledWallpaperMiniPreview
                                active={selectedImage && (selectedImage.id === image.id)}
                                onClick={() => select(image)}
                            >
                                <StyledWallpaperMiniPreviewImage src={image.urls.thumb}/>
                            </StyledWallpaperMiniPreview>
                        ))
                    }
                </StyledWallpaperGrid>
                { !loading && (page < totalPages) && <StyledLoadMore onClick={loadMore}>Load More</StyledLoadMore> }
                { loading && <StyledLoader>Please Wait...</StyledLoader> }
            </StyledWallpaperGridContainer>
        </StyledWallpaperSelectorContainer>
    )
};

export function WallpaperHistory({ onSelect = () => {} }){
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState({ id: null, });
    // @ts-ignore
    useEffect(async () => {
        let { wallpapersTrail = '[]' } = await getObjectFromStorageLocal("wallpapersTrail");
        wallpapersTrail = JSON.parse(wallpapersTrail);
        setImages(wallpapersTrail);
    }, []);
    const select = (image: any) => {
        setSelectedImage(image);
        onSelect(image);
    }
    return (
        <div style={{height: '440px'}}>
            <StyledWallpaperGridContainer >
                <StyledWallpaperGrid>
                    {
                        images.map(image => (
                            <StyledWallpaperMiniPreview
                                active={selectedImage && (selectedImage.id === image.id)}
                                onClick={() => select(image)}
                            >
                                <StyledWallpaperMiniPreviewImage src={image.urls.thumb} />
                            </StyledWallpaperMiniPreview>
                        ))
                    }
                </StyledWallpaperGrid>
            </StyledWallpaperGridContainer>
        </div>
    )
}