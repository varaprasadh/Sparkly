/**
 * Hacker News Plugin Component
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PluginProps } from '../../../types/plugin.types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 102, 0, 0.2);
  backdrop-filter: blur(8px);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const StoryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StoryItem = styled.a`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StoryTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
  line-height: 1.4;
`;

const StoryMeta = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 8px;
`;

const StateMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 14px;
  padding: 20px;
  text-align: center;
`;

interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  descendants: number;
}

export function HackerNewsPlugin({ api }: PluginProps): JSX.Element {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopStories();
  }, []);

  const fetchTopStories = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch top 500 story IDs
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids: number[] = await res.json();

      // Get detail for top 20
      const top20Ids = ids.slice(0, 20);
      const storyPromises = top20Ids.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      );

      const storiesData = await Promise.all(storyPromises);
      setStories(storiesData.filter(s => s && s.url)); // only stories with urls
    } catch (err) {
      console.error('Failed to fetch Hacker News:', err);
      setError('Failed to load stories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Hacker News</Title>
      </Header>
      <Content>
        {loading && <StateMessage>Fetching top stories...</StateMessage>}
        {error && <StateMessage>{error}</StateMessage>}
        {!loading && !error && (
          <StoryList>
            {stories.map(story => (
              <StoryItem key={story.id} href={story.url} target="_blank" rel="noopener noreferrer">
                <StoryTitle>{story.title}</StoryTitle>
                <StoryMeta>
                  <span>▲ {story.score} points</span>
                  <span>by {story.by}</span>
                  <span>{story.descendants || 0} comments</span>
                </StoryMeta>
              </StoryItem>
            ))}
          </StoryList>
        )}
      </Content>
    </Container>
  );
}
