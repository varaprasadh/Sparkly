/// <reference types="chrome"/>
// @ts-nocheck
import React, { useState, useEffect, Ref, ReactChildren, createRef } from 'react'
import styled, { css } from 'styled-components';

import { wallpapers, gifs, gradients, ASSET_TYPES } from "./backgroundAssets"
import { preventSelectStyles } from './components';
import { AppContext } from './Context';

import myPhoto from "../icons/vara.jpeg";
import { links } from '../data';


import twitterIcon from "../assets/images/twitter.png";
import linkedinIcon from "../assets/images/linkedin.png";
import githubIcon from "../assets/images/github.png";

const WindowContainer = styled.div`
   position: absolute;
   top: 100%;
   right: 20%;
   background-color: white;
   border-radius: 0.2rem;
   z-index: 99;
`;

const StyledPanel = styled.div`
    min-width: 200px;
`;
const StyledPanelHeader = styled.div`
    font-weight: bold;
    background: #ebf7f7;
    padding: 0.5rem 1rem;
    border: 1px solid #929191;
    position: relative;
    cursor: pointer;
    ${preventSelectStyles};
    ${props => props.showToggleIcon && css`
        &:after,
        &:before {
            content: '';
            position: absolute;
            right: 25px;
            top: 50%;
            width: 22px;
            height: 2px;
            margin-top: -2px;
            background-color: #372717;
        };
        &:before {
            transform:  ${props => props.expanded ? 'rotate(deg)' : 'rotate(-90deg)'} ;
            transition: transform 0.35s cubic-bezier(0.65, 0.05, 0.36, 1);
        };
    `}

`;

const PanelBody = styled.div`
  overflow: hidden;
  will-change: height;
  transition: height 0.4s cubic-bezier(0.65, 0.05, 0.36, 1);
`

function Panel({ title, canToggle = true, children }: { title: any, children:any}){
    const [open, setOpen] = useState(true);
    const [height, setHeight] = useState(0);
    const ref = createRef();

    useEffect(()=>{
        // @ts-ignore file
        let timer = setTimeout(()=>{
            const height = ref.current.scrollHeight;
            setHeight(height);
        },100);

        return ()=>clearTimeout(timer);

    },[]);

    return (
        <StyledPanel>
            <StyledPanelHeader 
                showToggleIcon={canToggle}
                expanded={open}
                onClick={() => canToggle && setOpen(!open)}
            >
                <div>{title}</div>
            </StyledPanelHeader>
            <PanelBody
                ref={ref}
                style={{ height: `${open ?height : 0}px` }}
            >
                {children}
            </PanelBody>
        </StyledPanel>
    )
}

const StyledGradientOptionWrapper = styled.div`
    width: 5rem;
    height: 3rem;
    margin: 0.2rem;
    cursor: pointer;
    background: ${props => props.gradient};
    box-sizing: border-box;
    &:hover{
        border: 2px solid #000000;
    };
    ${preventSelectStyles}
`;
const StyledImageOptionWrapper = styled.img`
    width: 5rem;
    height: 3rem;
    margin: 0.2rem;
    cursor: pointer;
    box-sizing: border-box;
    &:hover{
        border: 2px solid #000000;
    };
    ${preventSelectStyles}
`;

function GradientOption({ gradient , onClick }){
    return  (
        <StyledGradientOptionWrapper gradient={gradient} onClick={onClick}>
            {/*  */}
        </StyledGradientOptionWrapper>
    )
};

function ImageOption({ source, onClick }){
    return  (
        <StyledImageOptionWrapper src={source} onClick={onClick}>
            {/*  */}
        </StyledImageOptionWrapper>
    )
};




const GradientsContainer = styled.div`
    margin: 0.5rem 0rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
`;

export default function SettingsWindow(){
    const [store, dispatch] = React.useContext(AppContext as any);
    const setBackground = (type, key) => {
        console.log("click click");
        dispatch({
            type:'SET_BACKGROUND',
            payload: {
                type,
                key
            }
        })
    }
    return (
        <WindowContainer>
            <Panel title={"Wallpapers"}>
                <GradientsContainer>
                    {
                        wallpapers.map(({ value, key }) => {
                            return (
                                <ImageOption 
                                    key={key} 
                                    source={value} 
                                    onClick={() => setBackground(ASSET_TYPES.IMAGE, key)}
                                />
                            )
                        })
                    }
                </GradientsContainer>
                <GradientsContainer>
                    {
                        gradients.map(({ value, key }) => {
                            return (
                                <GradientOption
                                    key={key}
                                    gradient={value}
                                    onClick={() => setBackground(ASSET_TYPES.GRADIENT, key)}
                                />
                            )
                        })
                    }
                </GradientsContainer>
            </Panel> 
            <Panel title={"Gif"}>
                <GradientsContainer style={{padding:'0rem 1em', justifyContent:'start'}}>
                    {
                        gifs.map(({ value, key }) => {
                            return (
                                <ImageOption 
                                    key={key} 
                                    source={value} 
                                    onClick={() => setBackground(ASSET_TYPES.GIF, key)}
                                />
                            )
                        })
                    }
                </GradientsContainer>
            </Panel> 
            <Panel title={"What's next ?"}>
                    <ul style={{paddingLeft:'2rem', lineHeight:'1.5rem'}}>
                        <li>Custom cursors 😋</li>
                        <li>Custom background! 🌈 </li>
                    </ul>
            </Panel> 
        </WindowContainer>
    )
}


const StyledSocialIcon = styled.img`
  height: 30px;
  margin: 0.2em;
  transition: all 0.2s ease;
  &:active{
      transform: scale(0.8);
  }
`
export function AuthorInfoWindow(){

    return (
        <WindowContainer>
            <Panel title={"🔯 About Me"} canToggle={false}>
                <div style={{display:'flex', padding:"0.5rem 1rem", fontFamily:"sans"}}>
                    <img src={myPhoto} alt="varaprasadh's photo" 
                        style={{width:'8rem', objectFit:"cover"}}/>
                    <div style={{marginLeft:'0.5rem',minWidth: "200px", lineHeight:'1.5em'}}>
                        👋Hi! It's <strong>Varaprasadh ⚡</strong> <br/>
                        A am a software Engineer🤖<br/>
                        And Google Certified Cloud Developer 💻<br/>
                        <strong>Catch me up below</strong> <br/>
                        <div className="social-links">
                            <a href={links.LINKEDIN}>
                                <StyledSocialIcon src={linkedinIcon} alt="linkedin"/>
                            </a>
                            <a href={links.TWITTER}>
                                <StyledSocialIcon src={twitterIcon} alt="twitter"/>
                            </a>
                            <a href={links.GITHUB}>
                                <StyledSocialIcon src={githubIcon} alt="github"/>
                            </a>
                        </div>
                        <div>
                            <a href={links.WEBSITE} style={{fontSize:'1.2em'}}>varaprasadh.dev</a>
                        </div>
                    </div>
                </div>
            </Panel>
        </WindowContainer>
    )
}

/*

<strong><i>Vara.</i> </strong> I'm self-taught programmer(in my point of view 😜).
<br/>
test
if you want to talk with me then,
you can contact me through <strong><a href={socialLinks.linkedin}> LinkedIn</a></strong>

*/