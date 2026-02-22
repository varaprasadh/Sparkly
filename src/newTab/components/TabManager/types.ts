export interface TabInfo {
  id?: number;
  windowId: number;
  title?: string;
  url?: string;
  favIconUrl?: string;
  active: boolean;
  discarded?: boolean;
}

export interface WindowGroup {
  windowId: number;
  tabs: TabInfo[];
  color: string;
}

export interface DomainGroup {
  domain: string;
  tabs: TabInfo[];
}

export interface SavedSession {
  id: string;
  name: string;
  timestamp: number;
  windows: { tabs: { url: string; title?: string }[] }[];
}

export type GroupingMode = 'windows' | 'sites';
