/**
 * About Tab - Shows app info, links, and version
 */

import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Logo = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 16px;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AppName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const Version = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

// Version will be injected by webpack at build time
declare const __VERSION__: string;

const LinkItem = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
`;

const LinkIcon = styled.span`
  font-size: 20px;
`;

const LinkText = styled.span`
  flex: 1;
`;

const LinkArrow = styled.span`
  color: #9ca3af;
`;

const Description = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

export function AboutTab(): JSX.Element {
  return (
    <Container>
      <Section>
        <LogoSection>
          <Logo src="images/icon-128.png" alt="Sparkly" />
          <LogoText>
            <AppName>Sparkly</AppName>
            <Version>Version {typeof __VERSION__ !== 'undefined' ? __VERSION__ : '4.4.3'}</Version>
          </LogoText>
        </LogoSection>
      </Section>

      <Section>
        <SectionTitle>About</SectionTitle>
        <Description>
          Sparkly replaces your browser's blank new tab with a stunning productivity dashboard. 
          Manage tabs, read dev feeds, launch Google apps, search anything — all from one 
          beautiful, customizable home base.
        </Description>
      </Section>

      <Section>
        <SectionTitle>Links</SectionTitle>
        
        <LinkItem href="https://sparklytab.dev" target="_blank" rel="noopener noreferrer">
          <LinkIcon>🌐</LinkIcon>
          <LinkText>Visit Website</LinkText>
          <LinkArrow>↗</LinkArrow>
        </LinkItem>

        <LinkItem href="https://chromewebstore.google.com/detail/sparkly-new-tab-for-produ/finlildobfdjhkemcieihnkgmgoikgan/reviews" target="_blank" rel="noopener noreferrer">
          <LinkIcon>⭐</LinkIcon>
          <LinkText>Write a Review</LinkText>
          <LinkArrow>↗</LinkArrow>
        </LinkItem>

        {/* <LinkItem href="https://github.com" target="_blank" rel="noopener noreferrer">
          <LinkIcon>🐙</LinkIcon>
          <LinkText>GitHub</LinkText>
          <LinkArrow>↗</LinkArrow>
        </LinkItem> */}
      </Section>

      <Section>
        <SectionTitle>Privacy</SectionTitle>
        <Description>
          Sparkly is privacy-first. No data leaves your device. No ads, no tracking, no account required. 
          Completely free, forever.
        </Description>
      </Section>
    </Container>
  );
}

export default AboutTab;
