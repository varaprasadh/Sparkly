/**
 * GitHub Trending Plugin Component
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const RepoList = styled.div`
  display: flex;
  flex-direction: column;
`;

const RepoItem = styled.a`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RepoName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #58a6ff;
  margin-bottom: 4px;
  word-break: break-all;
`;

const RepoDesc = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  line-height: 1.4;
`;

const RepoMeta = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 12px;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
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

interface Repository {
  id: number;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
}

export function GitHubPlugin({ api }: PluginProps): JSX.Element {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date 7 days ago
      const date = new Date();
      date.setDate(date.getDate() - 7);
      const dateStr = date.toISOString().split('T')[0];

      const res = await fetch(`https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc`);

      if (!res.ok) {
        throw new Error('Rate limit exceeded or API error');
      }

      const data = await res.json();
      setRepos(data.items.slice(0, 20));
    } catch (err) {
      console.error('Failed to fetch GitHub trending:', err);
      setError('Failed to load repositories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>GitHub Trending</Title>
      </Header>
      <Content>
        {loading && <StateMessage>Fetching trending repositories...</StateMessage>}
        {error && <StateMessage>{error}</StateMessage>}
        {!loading && !error && (
          <RepoList>
            {repos.map(repo => (
              <RepoItem key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer">
                <RepoName>{repo.full_name}</RepoName>
                {repo.description && <RepoDesc>{repo.description}</RepoDesc>}
                <RepoMeta>
                  <MetaItem>⭐ {repo.stargazers_count.toLocaleString()}</MetaItem>
                  {repo.language && <MetaItem>👾 {repo.language}</MetaItem>}
                </RepoMeta>
              </RepoItem>
            ))}
          </RepoList>
        )}
      </Content>
    </Container>
  );
}
