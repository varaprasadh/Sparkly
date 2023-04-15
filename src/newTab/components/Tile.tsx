/// <reference types="chrome"/>
// @ts-nocheck

import React, { useState, useEffect, Ref } from 'react'
import styled, { css } from 'styled-components';
import { preventSelectStyles } from '.';

import cursorIcon from "../../icons/cursor.png";

const TileContainer = styled.a`
    position: relative;
    width: 100px;
    // background-color: white;
    margin: 0.4rem;
    padding: 0.5rem  1rem;
    text-decoration: none;
    border-radius: 0.2rem;
    color: white;
    &:hover{
        background: rgb(255 255 255 / 13%);
    };
    transition: scale 0.4s ease;
    &:active{
        transform: scale(0.9);
    }
    ${preventSelectStyles}
`;
const TileTitle = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 1rem;
    padding: 0.1rem 0rem;
    text-transform: capitalize;
    text-shadow: 1px 1px black;
`;
const TileImageContainer = styled.div`
    position: relative;
    width: fit-content;
    margin: auto;
`;
const TileImage = styled.img`
    width: 1.5rem;
    height: 1.5rem;
    background: white;
    padding: 0.6rem;
    overflow: hidden;
    border-radius: 50%;
    ${preventSelectStyles}
`;


export default function Tile({ title, url, icon }: { title: string, url: string, icon: any }) {
    const imageRef: Ref<HTMLImageElement> = React.createRef();
    const [imageLoadErrorHandled, setImageLoadErrorHandled] = useState(false);
    useEffect(() => {
        imageRef.current?.addEventListener('error', ({ target }) => {
            imageRef.current?.removeEventListener('error', () => { });
            // @ts-ignore
            target?.src = cursorIcon;
        });
        return () => {
            imageRef.current?.removeEventListener('error', () => { });
        }
    }, [])
    const titleMatchParts = title.match(/\((?<count>\b\d[\d,.]*\b)\)/);
    const notificationCount = titleMatchParts?.groups?.count ? parseInt(titleMatchParts?.groups?.count.replace(/,/g, '')) : 0;
    const formattedNotificationCount = notificationCount > 99 ? '99+' : notificationCount;
    return (
        <TileContainer key={url} href={url}>
            <TileImageContainer>
                <TileImage
                    ref={imageRef}
                    src={icon}
                    alt={`tile-icon ${title}`}
                    badgeCount={notificationCount}
                />
                {notificationCount > 0 && <span style={{
                    background: 'tomato',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '0.2rem',
                    fontSize: '0.8rem',
                    position: 'absolute',
                    top: '-0.5rem',
                    right: '-1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: '20px',
                    minHeight: '20px',
                }}
                >{formattedNotificationCount}</span>
                }
            </TileImageContainer>
            <TileTitle title={title}>{title}</TileTitle>
        </TileContainer>
    )
}