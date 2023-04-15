/// <reference types="chrome"/>
import React, { useState, useEffect, Ref } from 'react'
import styled from 'styled-components';

import robotImage from "../../assets/images/robot.png";


const StyledPlaceHolderContainer = styled.div`
    height: 440px;
    position: relative;
    overflow: auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
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
const StyledPlaceholderImage = styled.img`
    width: 150px;
`;
const StyledPlaceholderText = styled.div`
    text-align: center;
`;
export function RandomWallpaperConfigPlaceHolder() {
    return (
        <StyledPlaceHolderContainer>
            <StyledPlaceholderImage src={robotImage}></StyledPlaceholderImage>
            <StyledPlaceholderText>
                You'll get random wallpaper on every new tab. <br/>
                You can try Custom Option to search and select your favorite wallpaper.
            </StyledPlaceholderText>
        </StyledPlaceHolderContainer>
    )
}