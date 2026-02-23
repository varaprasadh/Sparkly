/**
 * Dev.to Plugin Component
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
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

const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArticleItem = styled.a`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ArticleTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  line-height: 1.4;
`;

const ArticleTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
`;

const Tag = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
`;

const ArticleMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AuthorAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const Stats = styled.div`
  display: flex;
  gap: 12px;
`;

const StatItem = styled.span`
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

interface DevArticle {
  id: number;
  title: string;
  url: string;
  public_reactions_count: number;
  comments_count: number;
  tag_list: string[];
  user: {
    name: string;
    profile_image_90: string;
  };
}

export function DevToPlugin({ api }: PluginProps): JSX.Element {
  const [articles, setArticles] = useState<DevArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch top articles from the last N days
      const res = await fetch('https://dev.to/api/articles?top=1&per_page=20');

      if (!res.ok) {
        throw new Error('API error');
      }

      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error('Failed to fetch Dev.to articles:', err);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>DEV Community</Title>
      </Header>
      <Content>
        {loading && <StateMessage>Fetching top articles...</StateMessage>}
        {error && <StateMessage>{error}</StateMessage>}
        {!loading && !error && (
          <ArticleList>
            {articles.map(article => (
              <ArticleItem key={article.id} href={article.url} target="_blank" rel="noopener noreferrer">
                <ArticleTitle>{article.title}</ArticleTitle>
                <ArticleTags>
                  {article.tag_list.slice(0, 3).map(tag => (
                    <Tag key={tag}>#{tag}</Tag>
                  ))}
                </ArticleTags>
                <ArticleMeta>
                  <AuthorInfo>
                    <AuthorAvatar src={article.user.profile_image_90} alt={article.user.name} />
                    <span>{article.user.name}</span>
                  </AuthorInfo>
                  <Stats>
                    <StatItem>❤️ {article.public_reactions_count}</StatItem>
                    <StatItem>💬 {article.comments_count}</StatItem>
                  </Stats>
                </ArticleMeta>
              </ArticleItem>
            ))}
          </ArticleList>
        )}
      </Content>
    </Container>
  );
}
