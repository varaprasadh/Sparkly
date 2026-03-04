/**
 * Google Workspace Plugin
 *
 * Provides widgets for Google Calendar, Drive, and Gmail
 * Requires OAuth2 authentication via chrome.identity
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { PluginProps } from '../../../types/plugin.types';
import { useGoogleAuth } from './useGoogleAuth';

/// <reference types="chrome"/>

// ── Types ──

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType: string; uri: string }>;
  };
  description?: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  modifiedTime: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  labelIds: string[];
}

type GmailFilter = 'all' | 'unread';

type SectionId = 'calendar' | 'drive' | 'gmail';

// ── Helpers ──

function decodeHtml(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

const LABEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  IMPORTANT:            { label: 'Important',   color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  STARRED:              { label: 'Starred',      color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  CATEGORY_PROMOTIONS:  { label: 'Promotions',   color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  CATEGORY_SOCIAL:      { label: 'Social',       color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  CATEGORY_UPDATES:     { label: 'Updates',      color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  CATEGORY_FORUMS:      { label: 'Forums',       color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
  CATEGORY_PERSONAL:    { label: 'Personal',     color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
};

const MEETING_URL_PATTERN = /https?:\/\/(meet\.google\.com|zoom\.us|teams\.microsoft\.com|webex\.com|whereby\.com)[^\s"<]*/i;

function getMeetingLink(event: CalendarEvent): string | null {
  if (event.hangoutLink) return event.hangoutLink;
  const videoEntry = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video');
  if (videoEntry) return videoEntry.uri;
  if (event.description) {
    const match = event.description.match(MEETING_URL_PATTERN);
    if (match) return match[0];
  }
  return null;
}

// ── Constants ──

const GW_LAYOUT_KEY = 'gw_layout_mode';
const GW_SECTIONS_KEY = 'gw_enabled_sections';
const GW_GMAIL_FILTER_KEY = 'gw_gmail_filter';

const GMAIL_FILTER_URLS: Record<GmailFilter, string> = {
  all:    'https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&maxResults=10',
  unread: 'https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&labelIds=UNREAD&maxResults=10',
};

const SECTIONS: { id: SectionId; name: string; icon: string; color: string }[] = [
  { id: 'calendar', name: 'Calendar', icon: '📅', color: '#4285f4' },
  { id: 'drive',    name: 'Drive',    icon: '💾', color: '#34a853' },
  { id: 'gmail',    name: 'Gmail',    icon: '📧', color: '#ea4335' },
];

// ── Styles ──

const darkScrollbar = `
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  &:hover { scrollbar-color: rgba(255,255,255,0.2) transparent; }
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; }
  &:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
  &::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconButton = styled.button<{ spinning?: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  ${(p) => p.spinning && css`animation: ${spin} 1s linear infinite;`}

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-width: 0;
`;

const AccountEmail = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const SignOutBtn = styled.button`
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: rgba(248, 113, 113, 0.8);
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    background: rgba(248, 113, 113, 0.2);
    color: #f87171;
  }
`;

const SettingsPanel = styled.div`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
`;

const SettingsTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
`;

const SectionCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  transition: color 0.2s;

  &:hover { color: white; }

  input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s;

    &:checked {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    &:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
`;

const FeedTabs = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow-x: auto;
  flex-shrink: 0;
  ${darkScrollbar}
  &::-webkit-scrollbar { height: 3px; }
`;

const FeedTab = styled.button<{ active: boolean; accentColor: string }>`
  padding: 8px 14px;
  background: ${(p) => (p.active ? 'rgba(255,255,255,0.1)' : 'transparent')};
  border: none;
  border-bottom: 2px solid ${(p) => (p.active ? p.accentColor : 'transparent')};
  color: ${(p) => (p.active ? 'white' : 'rgba(255,255,255,0.45)')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  ${darkScrollbar}
`;

const MultiColumnGrid = styled.div`
  flex: 1;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
`;

const ColumnPane = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 220px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  flex: 1;
  &:last-child { border-right: none; }
`;

const ColumnHeader = styled.div<{ accentColor: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 2px solid ${(p) => p.accentColor};
  color: white;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ColumnScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  ${darkScrollbar}
`;

const Section = styled.div`
  padding: 8px;
`;

const EventItem = styled.a`
  display: block;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 6px;
  text-decoration: none;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const EventTitle = styled.div`
  font-size: 13px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EventTime = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
`;

const EventDescription = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const FileItem = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 4px;
  text-decoration: none;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const FileIcon = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const FileName = styled.div`
  font-size: 12px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GmailFilterBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
`;

const GmailFilterChip = styled.button<{ active: boolean }>`
  padding: 3px 10px;
  background: ${(p) => (p.active ? 'rgba(234,67,53,0.25)' : 'rgba(255,255,255,0.06)')};
  border: 1px solid ${(p) => (p.active ? 'rgba(234,67,53,0.5)' : 'rgba(255,255,255,0.1)')};
  color: ${(p) => (p.active ? '#fca5a5' : 'rgba(255,255,255,0.45)')};
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: ${(p) => (p.active ? 'rgba(234,67,53,0.35)' : 'rgba(255,255,255,0.12)')};
    color: ${(p) => (p.active ? '#fca5a5' : 'rgba(255,255,255,0.7)')};
  }
`;

const GmailItem = styled.a`
  display: block;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 6px;
  text-decoration: none;
  cursor: pointer;

  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const GmailSubject = styled.div`
  font-size: 12px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GmailSnippet = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LabelRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
`;

const LabelChip = styled.span<{ color: string; bg: string }>`
  font-size: 10px;
  font-weight: 500;
  color: ${(p) => p.color};
  background: ${(p) => p.bg};
  border: 1px solid ${(p) => p.color}44;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
`;

const JoinButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 10px;
  background: rgba(66, 133, 244, 0.2);
  border: 1px solid rgba(66, 133, 244, 0.4);
  border-radius: 5px;
  color: #93c5fd;
  font-size: 11px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(66, 133, 244, 0.35) !important;
    color: white !important;
  }
`;


const Loading = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  text-align: center;
  padding: 20px;
`;

const ErrorMsg = styled.div`
  color: #f28b82;
  font-size: 11px;
  text-align: center;
  padding: 12px;
`;

const EmptyState = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  text-align: center;
  padding: 16px 12px;
`;

const SignInButton = styled.button`
  background: #4285f4;
  border: none;
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;

  &:hover { background: #3367d6; }
`;

// ── Component ──

export function GoogleWorkspacePlugin({ api }: PluginProps): JSX.Element {
  const { authState, isLoading, error, signIn, signOut, makeApiRequest } = useGoogleAuth();

  const [multiColumn, setMultiColumn] = useState(false);
  const [enabledSections, setEnabledSections] = useState<SectionId[]>(['calendar', 'drive', 'gmail']);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionId>('calendar');
  const [gmailFilter, setGmailFilter] = useState<GmailFilter>('all');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load persisted settings
  useEffect(() => {
    chrome.storage.local.get([GW_LAYOUT_KEY, GW_SECTIONS_KEY, GW_GMAIL_FILTER_KEY], (result) => {
      if (result[GW_LAYOUT_KEY]) setMultiColumn(result[GW_LAYOUT_KEY] === 'multi');
      if (result[GW_SECTIONS_KEY]) setEnabledSections(result[GW_SECTIONS_KEY]);
      if (result[GW_GMAIL_FILTER_KEY]) setGmailFilter(result[GW_GMAIL_FILTER_KEY]);
    });
  }, []);

  // Keep activeTab valid when sections change
  useEffect(() => {
    if (enabledSections.length > 0 && !enabledSections.includes(activeTab)) {
      setActiveTab(enabledSections[0]);
    }
  }, [enabledSections]);

  useEffect(() => {
    if (authState.isAuthenticated) fetchAllData();
  }, [authState.isAuthenticated]);

  const fetchCalendarEvents = useCallback(async () => {
    const now = new Date().toISOString();
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${nextWeek}&maxResults=10&orderBy=startTime&singleEvents=true`;
    const res = await makeApiRequest(url);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.items || []);
    }
  }, [makeApiRequest]);

  const fetchDriveFiles = useCallback(async () => {
    const url = 'https://www.googleapis.com/drive/v3/files?pageSize=10&orderBy=viewedByMeTime desc&fields=files(id,name,mimeType,webViewLink,iconLink,modifiedTime,viewedByMeTime)';
    const res = await makeApiRequest(url);
    if (res.ok) {
      const data = await res.json();
      setFiles(data.files || []);
    }
  }, [makeApiRequest]);

  const fetchGmailMessages = useCallback(async (filter: GmailFilter = gmailFilter) => {
    const res = await makeApiRequest(GMAIL_FILTER_URLS[filter]);
    if (!res.ok) return;
    const data = await res.json();
    const msgs = data.messages || [];

    const details = await Promise.all(
      msgs.map(async (msg: { id: string }) => {
        const r = await makeApiRequest(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`
        );
        return r.json();
      })
    );

    setMessages(
      details.map((d: any) => ({
        id: d.id,
        threadId: d.threadId,
        snippet: decodeHtml(d.snippet || ''),
        subject: d.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)',
        from: d.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'from')?.value || '',
        labelIds: d.labelIds || [],
      }))
    );

  }, [makeApiRequest]);

  const fetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([fetchCalendarEvents(), fetchDriveFiles(), fetchGmailMessages()]);
    } catch (err) {
      console.error('Error fetching Google data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [fetchCalendarEvents, fetchDriveFiles, fetchGmailMessages]);

  const handleToggleLayout = useCallback(() => {
    setMultiColumn((prev) => {
      const next = !prev;
      chrome.storage.local.set({ [GW_LAYOUT_KEY]: next ? 'multi' : 'single' });
      return next;
    });
  }, []);

  const handleToggleSection = useCallback((id: SectionId) => {
    setEnabledSections((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      chrome.storage.local.set({ [GW_SECTIONS_KEY]: next });
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchAllData();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, [fetchAllData]);

  const handleGmailFilter = useCallback((filter: GmailFilter) => {
    setGmailFilter(filter);
    chrome.storage.local.set({ [GW_GMAIL_FILTER_KEY]: filter });
    fetchGmailMessages(filter);
  }, [fetchGmailMessages]);

  const formatEventTime = (event: CalendarEvent) => {
    if (event.start?.dateTime) {
      return new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'All day';
  };

  const renderSectionContent = (sectionId: SectionId) => {
    if (isLoadingData) return <Loading>Loading...</Loading>;

    if (sectionId === 'calendar') {
      return events.length === 0 ? (
        <EmptyState>No upcoming events today</EmptyState>
      ) : (
        events.map((event) => {
          const meetLink = getMeetingLink(event);
          return (
            <EventItem key={event.id} href={event.htmlLink} target="_blank">
              <EventTitle>{event.summary}</EventTitle>
              <EventTime>{formatEventTime(event)}</EventTime>
              {event.description && (
                <EventDescription>{decodeHtml(event.description.replace(/<[^>]*>/g, ''))}</EventDescription>
              )}
              {meetLink && (
                <JoinButton
                  href={meetLink}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  🎥 Join Meeting
                </JoinButton>
              )}
            </EventItem>
          );
        })
      );
    }

    if (sectionId === 'drive') {
      return files.length === 0 ? (
        <EmptyState>No recent files</EmptyState>
      ) : (
        files.map((file) => (
          <FileItem key={file.id} href={file.webViewLink} target="_blank">
            <FileIcon src={file.iconLink} alt="" />
            <FileName>{file.name}</FileName>
          </FileItem>
        ))
      );
    }

    if (sectionId === 'gmail') {
      return (
        <>
          <GmailFilterBar>
            {(['all', 'unread'] as GmailFilter[]).map((f) => (
              <GmailFilterChip key={f} active={gmailFilter === f} onClick={() => handleGmailFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </GmailFilterChip>
            ))}
          </GmailFilterBar>
          {messages.length === 0 ? (
            <EmptyState>No emails</EmptyState>
          ) : (
            messages.map((msg) => {
              const visibleLabels = msg.labelIds
                .filter((id) => LABEL_CONFIG[id])
                .map((id) => ({ id, ...LABEL_CONFIG[id] }));
              return (
                <GmailItem
                  key={msg.id}
                  href={`https://mail.google.com/mail/u/0/#all/${msg.threadId}`}
                  target="_blank"
                >
                  <GmailSubject>{msg.subject}</GmailSubject>
                  <GmailSnippet>{msg.snippet}</GmailSnippet>
                  {visibleLabels.length > 0 && (
                    <LabelRow>
                      {visibleLabels.map((l) => (
                        <LabelChip key={l.id} color={l.color} bg={l.bg}>
                          {l.label}
                        </LabelChip>
                      ))}
                    </LabelRow>
                  )}
                </GmailItem>
              );
            })
          )}
        </>
      );
    }
  };

  const enabledSectionDefs = SECTIONS.filter((s) => enabledSections.includes(s.id));

  if (isLoading) {
    return (
      <Container>
        <Loading>Loading...</Loading>
      </Container>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Container>
        <Header>
          <Title>Google Workspace</Title>
        </Header>
        <Section style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EmptyState style={{ padding: '0 0 4px' }}>
            Connect your Google account to see Calendar, Drive, and Gmail
          </EmptyState>
          <SignInButton onClick={signIn}>Connect Google Account</SignInButton>
          {error && <ErrorMsg>{error.message}</ErrorMsg>}
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>Google Workspace</Title>
        <HeaderActions>
          <IconButton
            onClick={handleToggleLayout}
            title={multiColumn ? 'Single column' : 'Multi-column'}
          >
            {multiColumn ? '☰' : '⊞'}
          </IconButton>
          <IconButton onClick={handleRefresh} spinning={refreshing} title="Refresh">
            ↻
          </IconButton>
          <IconButton onClick={() => setShowSettings((s) => !s)} title="Settings">
            ⚙
          </IconButton>
        </HeaderActions>
      </Header>

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel>
          {authState.email && (
            <AccountRow>
              <AccountEmail>Signed in as {authState.email}</AccountEmail>
              <SignOutBtn onClick={signOut}>Sign out</SignOutBtn>
            </AccountRow>
          )}
          <SettingsTitle>Show Sections</SettingsTitle>
          {SECTIONS.map((section) => (
            <SectionCheckbox key={section.id}>
              <input
                type="checkbox"
                checked={enabledSections.includes(section.id)}
                onChange={() => handleToggleSection(section.id)}
              />
              <span>{section.icon}</span>
              <span>{section.name}</span>
            </SectionCheckbox>
          ))}
        </SettingsPanel>
      )}

      {/* Single-column: tabs */}
      {!multiColumn && enabledSectionDefs.length > 0 && (
        <FeedTabs>
          {enabledSectionDefs.map((s) => (
            <FeedTab
              key={s.id}
              active={activeTab === s.id}
              accentColor={s.color}
              onClick={() => setActiveTab(s.id)}
            >
              {s.icon} {s.name}
            </FeedTab>
          ))}
        </FeedTabs>
      )}

      {/* Single-column: content */}
      {!multiColumn && (
        <ScrollArea>
          <Section>
            {enabledSectionDefs.length === 0 ? (
              <EmptyState>No sections enabled. Open ⚙ to enable sections.</EmptyState>
            ) : (
              renderSectionContent(activeTab)
            )}
          </Section>
        </ScrollArea>
      )}

      {/* Multi-column: content */}
      {multiColumn && (
        <MultiColumnGrid>
          {enabledSectionDefs.length === 0 ? (
            <EmptyState style={{ width: '100%' }}>No sections enabled. Open ⚙ to enable sections.</EmptyState>
          ) : (
            enabledSectionDefs.map((s) => (
              <ColumnPane key={s.id}>
                <ColumnHeader accentColor={s.color}>
                  {s.icon} {s.name}
                </ColumnHeader>
                <ColumnScroll>
                  <Section>{renderSectionContent(s.id)}</Section>
                </ColumnScroll>
              </ColumnPane>
            ))
          )}
        </MultiColumnGrid>
      )}
    </Container>
  );
}

export default GoogleWorkspacePlugin;
