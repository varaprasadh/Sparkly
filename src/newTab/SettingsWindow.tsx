/// <reference types="chrome"/>
// @ts-nocheck
import React, { useState, useEffect, createRef } from 'react'
import styled, { css } from 'styled-components';

import { preventSelectStyles } from './components';

import myPhoto from "../icons/vara.jpg";
import { links } from '../data';
import {  Typography } from 'antd'

import linkedinIcon from "../assets/images/linkedin.png";
import githubIcon from "../assets/images/github.png";
import instagramIcon from "../assets/images/instagram.png";

const WindowContainer = styled.div`
   position: absolute;
   top: 100%;
   right: 20%;
   background-color: white;
   border-radius: 0.2rem;
   z-index: 99;
   font-family: Arial,Sans;
   margin-top: 0.5rem;
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
            <Panel title={"🔯 About Developer"} canToggle={false}>
                <div style={{display:'flex', padding:"0.5rem 1rem", fontFamily:"sans"}}>
                    <img src={myPhoto} alt="varaprasadh's photo" 
                        style={{width:'8rem', objectFit:"cover"}}/>
                    <Typography.Text style={{marginLeft:'0.5rem',minWidth: "200px", lineHeight:'1.5em'}}>
                        👋Hi! It's <strong>Varaprasadh ⚡</strong> <br/>
                        Software Engineer🤖<br/>
                        <strong>Catch me up below</strong> <br/>
                        <div className="social-links">
                            <a href={links.INSTAGRAM}>
                                <StyledSocialIcon src={instagramIcon} alt="instagram"/>
                            </a>
                            <a href={links.LINKEDIN}>
                                <StyledSocialIcon src={linkedinIcon} alt="linkedin"/>
                            </a>
                            <a href={links.GITHUB}>
                                <StyledSocialIcon src={githubIcon} alt="github"/>
                            </a>
                        </div>
                        <div>
                            <a href={links.WEBSITE} style={{fontSize:'1.2em'}}>varaprasadh.dev</a>
                        </div>
                    </Typography.Text>
                </div>
            </Panel>
        </WindowContainer>
    )
}
