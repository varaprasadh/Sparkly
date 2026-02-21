/// <reference types="chrome"/>
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { preventSelectStyles } from './components';

import myPhoto from '../icons/vara.jpg';
import { links } from '../data';

import linkedinIcon from '../assets/images/linkedin.png';
import githubIcon from '../assets/images/github.png';
import instagramIcon from '../assets/images/instagram.png';

// Types
interface PanelProps {
  title: ReactNode;
  canToggle?: boolean;
  children: ReactNode;
}

interface StyledPanelHeaderProps {
  showToggleIcon: boolean;
  expanded: boolean;
}

// Styled components
const WindowContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 20%;
  background-color: white;
  border-radius: 0.2rem;
  z-index: 99;
  font-family: Arial, Sans;
  margin-top: 0.5rem;
`;

const StyledPanel = styled.div`
  min-width: 200px;
`;

const StyledPanelHeader = styled.div<StyledPanelHeaderProps>`
  font-weight: bold;
  background: #ebf7f7;
  padding: 0.5rem 1rem;
  border: 1px solid #929191;
  position: relative;
  cursor: pointer;
  ${preventSelectStyles};
  ${(props) =>
    props.showToggleIcon &&
    css`
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
      }
      &:before {
        transform: ${props.expanded ? 'rotate(0deg)' : 'rotate(-90deg)'};
        transition: transform 0.35s cubic-bezier(0.65, 0.05, 0.36, 1);
      }
    `}
`;

const PanelBody = styled.div`
  overflow: hidden;
  will-change: height;
  transition: height 0.4s cubic-bezier(0.65, 0.05, 0.36, 1);
`;

const StyledSocialIcon = styled.img`
  height: 30px;
  margin: 0.2em;
  transition: all 0.2s ease;
  &:active {
    transform: scale(0.8);
  }
`;

const AuthorContainer = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  font-family: sans-serif;
`;

const AuthorPhoto = styled.img`
  width: 8rem;
  object-fit: cover;
`;

const AuthorInfo = styled.div`
  margin-left: 0.5rem;
  min-width: 200px;
  line-height: 1.5em;
`;

const SocialLinks = styled.div`
  display: flex;
  margin-top: 0.5rem;
`;

const WebsiteLink = styled.a`
  font-size: 1.2em;
  display: block;
  margin-top: 0.5rem;
`;

/**
 * Collapsible Panel Component
 */
function Panel({ title, canToggle = true, children }: PanelProps): JSX.Element {
  const [open, setOpen] = useState(true);
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        const contentHeight = ref.current.scrollHeight;
        setHeight(contentHeight);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = (): void => {
    if (canToggle) {
      setOpen(!open);
    }
  };

  return (
    <StyledPanel>
      <StyledPanelHeader
        showToggleIcon={canToggle}
        expanded={open}
        onClick={handleClick}
      >
        <div>{title}</div>
      </StyledPanelHeader>
      <PanelBody ref={ref} style={{ height: open ? `${height}px` : '0px' }}>
        {children}
      </PanelBody>
    </StyledPanel>
  );
}

/**
 * Author Info Window Component
 */
export function AuthorInfoWindow(): JSX.Element {
  return (
    <WindowContainer>
      <Panel title="About Developer" canToggle={false}>
        <AuthorContainer>
          <AuthorPhoto src={myPhoto} alt="Varaprasadh" />
          <AuthorInfo>
            <div>
              Hi! It&apos;s <strong>Varaprasadh</strong>
              <br />
              Software Engineer
              <br />
              <strong>Catch me up below</strong>
            </div>
            <SocialLinks>
              <a href={links.INSTAGRAM} target="_blank" rel="noopener noreferrer">
                <StyledSocialIcon src={instagramIcon} alt="Instagram" />
              </a>
              <a href={links.LINKEDIN} target="_blank" rel="noopener noreferrer">
                <StyledSocialIcon src={linkedinIcon} alt="LinkedIn" />
              </a>
              <a href={links.GITHUB} target="_blank" rel="noopener noreferrer">
                <StyledSocialIcon src={githubIcon} alt="GitHub" />
              </a>
            </SocialLinks>
            <WebsiteLink href={links.WEBSITE} target="_blank" rel="noopener noreferrer">
              varaprasadh.dev
            </WebsiteLink>
          </AuthorInfo>
        </AuthorContainer>
      </Panel>
    </WindowContainer>
  );
}
