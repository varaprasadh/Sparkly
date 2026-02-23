/**
 * Feed source definitions — all fetchers for each feed
 */

import { FeedSource, FeedItem } from './types';
import { parseRSS } from './rssParser';

// Chrome extension has host_permissions for https://*/* so we can fetch RSS feeds directly

export const FEED_SOURCES: FeedSource[] = [
  // ── Existing feeds ──────────────────────────────────────────────

  {
    id: 'hackernews',
    name: 'Hacker News',
    icon: '📰',
    color: '#ff6600',
    fetcher: async (): Promise<FeedItem[]> => {
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids: number[] = await res.json();
      const top = ids.slice(0, 20);
      const stories = await Promise.all(
        top.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json())
        )
      );
      return stories
        .filter((s: any) => s && s.url)
        .map((s: any) => ({
          id: `hn-${s.id}`,
          title: s.title,
          url: s.url,
          author: s.by,
          score: s.score,
          comments: s.descendants || 0,
        }));
    },
  },

  {
    id: 'github',
    name: 'GitHub Trending',
    icon: '🐙',
    color: '#238636',
    fetcher: async (): Promise<FeedItem[]> => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      const dateStr = date.toISOString().split('T')[0];
      const res = await fetch(
        `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc`
      );
      if (!res.ok) throw new Error('GitHub API error');
      const data = await res.json();
      return data.items.slice(0, 20).map((r: any) => ({
        id: `gh-${r.id}`,
        title: r.full_name,
        url: r.html_url,
        description: r.description || undefined,
        score: r.stargazers_count,
        meta: r.language || undefined,
      }));
    },
  },

  {
    id: 'devto',
    name: 'Dev.to',
    icon: '👩‍💻',
    color: '#3b49df',
    fetcher: async (): Promise<FeedItem[]> => {
      const res = await fetch('https://dev.to/api/articles?top=1&per_page=20');
      if (!res.ok) throw new Error('Dev.to API error');
      const data = await res.json();
      return data.map((a: any) => ({
        id: `devto-${a.id}`,
        title: a.title,
        url: a.url,
        author: a.user?.name,
        avatarUrl: a.user?.profile_image_90,
        score: a.public_reactions_count,
        comments: a.comments_count,
        tags: a.tag_list?.slice(0, 3),
      }));
    },
  },

  // ── New feeds ───────────────────────────────────────────────────

  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: '#ff4500',
    fetcher: async (): Promise<FeedItem[]> => {
      // Fetch from both subreddits and interleave
      const [progRes, webdevRes] = await Promise.all([
        fetch('https://www.reddit.com/r/programming/hot.json?limit=12'),
        fetch('https://www.reddit.com/r/webdev/hot.json?limit=12'),
      ]);
      if (!progRes.ok || !webdevRes.ok) throw new Error('Reddit API error');
      const [progData, webdevData] = await Promise.all([progRes.json(), webdevRes.json()]);

      const mapPosts = (data: any, sub: string): FeedItem[] =>
        data.data.children
          .filter((c: any) => !c.data.stickied)
          .map((c: any) => ({
            id: `reddit-${c.data.id}`,
            title: c.data.title,
            url: c.data.url.startsWith('/r/')
              ? `https://www.reddit.com${c.data.url}`
              : c.data.url,
            author: `u/${c.data.author}`,
            score: c.data.score,
            comments: c.data.num_comments,
            meta: `r/${sub}`,
          }));

      const prog = mapPosts(progData, 'programming');
      const webdev = mapPosts(webdevData, 'webdev');

      // Interleave
      const merged: FeedItem[] = [];
      const max = Math.max(prog.length, webdev.length);
      for (let i = 0; i < max; i++) {
        if (i < prog.length) merged.push(prog[i]);
        if (i < webdev.length) merged.push(webdev[i]);
      }
      return merged.slice(0, 20);
    },
  },

  {
    id: 'producthunt',
    name: 'Product Hunt',
    icon: '🚀',
    color: '#da552f',
    fetcher: async (): Promise<FeedItem[]> => {
      // Use the public RSS feed via proxy
      const res = await fetch('https://www.producthunt.com/feed');
      if (!res.ok) throw new Error('Product Hunt feed error');
      const xml = await res.text();
      return parseRSS(xml, 20).map((item, i) => ({
        ...item,
        id: `ph-${i}-${item.url}`,
      }));
    },
  },

  {
    id: 'lobsters',
    name: 'Lobste.rs',
    icon: '🦞',
    color: '#ac130d',
    fetcher: async (): Promise<FeedItem[]> => {
      const res = await fetch('https://lobste.rs/hottest.json');
      if (!res.ok) throw new Error('Lobsters API error');
      const data = await res.json();
      return data.slice(0, 20).map((s: any) => ({
        id: `lob-${s.short_id}`,
        title: s.title,
        url: s.url || s.short_id_url,
        author: s.submitter_user?.username,
        score: s.score,
        comments: s.comment_count,
        tags: s.tags?.slice(0, 3),
      }));
    },
  },

  {
    id: 'hashnode',
    name: 'Hashnode',
    icon: '📝',
    color: '#2962ff',
    fetcher: async (): Promise<FeedItem[]> => {
      const query = `
        query {
          feed(first: 20, filter: { type: FEATURED }) {
            edges {
              node {
                title
                brief
                url
                publishedAt
                author { name }
                reactionCount
                responseCount
                tags { name }
              }
            }
          }
        }
      `;
      const res = await fetch('https://gql.hashnode.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('Hashnode feed error');
      const json = await res.json();
      const edges = json?.data?.feed?.edges ?? [];
      return edges.map((e: any, i: number) => ({
        id: `hashnode-${i}-${e.node.url}`,
        title: e.node.title,
        url: e.node.url,
        author: e.node.author?.name,
        time: e.node.publishedAt,
        score: e.node.reactionCount,
        comments: e.node.responseCount,
        tags: e.node.tags?.slice(0, 3).map((t: any) => t.name),
      }));
    },
  },

  {
    id: 'medium',
    name: 'Medium',
    icon: '✍️',
    color: '#00ab6c',
    fetcher: async (): Promise<FeedItem[]> => {
      // Medium tag feed via RSS proxy
      const res = await fetch(
        'https://medium.com/feed/tag/programming'
      );
      if (!res.ok) throw new Error('Medium feed error');
      const xml = await res.text();
      return parseRSS(xml, 20).map((item, i) => ({
        ...item,
        id: `medium-${i}-${item.url}`,
      }));
    },
  },

  {
    id: 'csstricks',
    name: 'CSS-Tricks',
    icon: '🎨',
    color: '#e8640a',
    fetcher: async (): Promise<FeedItem[]> => {
      const res = await fetch(
        'https://css-tricks.com/feed/'
      );
      if (!res.ok) throw new Error('CSS-Tricks feed error');
      const xml = await res.text();
      return parseRSS(xml, 20).map((item, i) => ({
        ...item,
        id: `css-${i}-${item.url}`,
      }));
    },
  },

  {
    id: 'techcrunch',
    name: 'TechCrunch',
    icon: '💻',
    color: '#0a9e01',
    fetcher: async (): Promise<FeedItem[]> => {
      const res = await fetch(
        'https://techcrunch.com/feed/'
      );
      if (!res.ok) throw new Error('TechCrunch feed error');
      const xml = await res.text();
      return parseRSS(xml, 20).map((item, i) => ({
        ...item,
        id: `tc-${i}-${item.url}`,
      }));
    },
  },

  {
    id: 'theverge',
    name: 'The Verge',
    icon: '📱',
    color: '#e5127d',
    fetcher: async (): Promise<FeedItem[]> => {
      const res = await fetch(
        'https://www.theverge.com/rss/index.xml'
      );
      if (!res.ok) throw new Error('The Verge feed error');
      const xml = await res.text();
      return parseRSS(xml, 20).map((item, i) => ({
        ...item,
        id: `verge-${i}-${item.url}`,
      }));
    },
  },
];

export const DEFAULT_ENABLED_FEEDS = ['hackernews', 'github', 'devto'];
