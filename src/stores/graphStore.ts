import { create } from 'zustand';
import graphData from '../graphData.json';

const API_BASE = 'https://portfoliobe-ebon.vercel.app';

interface ZoomAction {
  type: 'in' | 'out' | 'reset';
  ts: number;
}

export interface ProjectConfig {
  rank?: number;
  context?: string;
  liveUrl?: string;
  docsUrl?: string;
  extraLinks?: { label: string; url: string }[];
}

export interface GraphAdminConfig {
  projects: Record<string, ProjectConfig>;
  updatedAt?: string;
}

export interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  connectedAt?: string;
  scope?: string;
}

export interface ScrapedRepoSummary {
  repoName: string;
  repoFullName: string;
  scrapedAt: string;
  hasReadme: boolean;
  chunkCount: number;
  languages: string[];
  stars: number;
  description?: string;
}

export interface RAGContext {
  repoName: string;
  contextBlock: string;
  chunks: { type: string; priority: number; content: string; section?: string }[];
  totalChunks: number;
}

const ADMIN_CONFIG_KEY = 'graph_admin_config';

function loadAdminConfig(): GraphAdminConfig {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { projects: {} };
}

function saveAdminConfigLocal(config: GraphAdminConfig) {
  config.updatedAt = new Date().toISOString();
  localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
}

function applyAdminWeights(nodes: any[], config: GraphAdminConfig) {
  return nodes.map((n) => {
    const pc = config.projects[n.id];
    if (pc?.rank) {
      const weight = Math.max(1, Math.min(10, 11 - pc.rank));
      return { ...n, weight, _adminRank: pc.rank };
    }
    return n;
  });
}

function mergeScrapedReposIntoGraph(
  baseNodes: any[],
  baseEdges: any[],
  scrapedRepos: ScrapedRepoSummary[],
  adminConfig: GraphAdminConfig
) {
  const newNodes = [...baseNodes];
  const newEdges = [...baseEdges];
  const existingNodeIds = new Set(newNodes.map((n) => n.id));

  scrapedRepos.forEach((repo) => {
    const expectedId = `repo-${repo.repoName}`;
    if (!existingNodeIds.has(expectedId)) {
      newNodes.push({
        id: expectedId,
        label: repo.repoName,
        type: 'repo',
        weight: 3,
        metadata: {
          description: repo.description || 'Scraped repository',
          stars: repo.stars || 0,
          url: `https://github.com/${repo.repoFullName}`,
        },
      });
      existingNodeIds.add(expectedId);
      newEdges.push({ source: 'person', target: expectedId, type: 'created', weight: 2 });
    }
    if (repo.languages) {
      repo.languages.forEach((lang) => {
        const langId = `lang-${lang.toLowerCase()}`;
        if (!existingNodeIds.has(langId)) {
          newNodes.push({ id: langId, label: lang, type: 'language', weight: 2, metadata: {} });
          existingNodeIds.add(langId);
        }
        if (!newEdges.some((e) => e.source === expectedId && e.target === langId)) {
          newEdges.push({ source: expectedId, target: langId, type: 'uses', weight: 1 });
        }
      });
    }
  });

  return { nodes: applyAdminWeights(newNodes, adminConfig), edges: newEdges };
}

interface GraphStore {
  nodes: any[];
  edges: any[];
  selectedNode: any | null;
  filterTypes: string[];
  searchQuery: string;
  isFocusedMode: boolean;
  _zoomAction: ZoomAction | null;
  showAdminModal: boolean;
  adminConfig: GraphAdminConfig;
  hoveredNode: any | null;
  githubStatus: GitHubStatus;
  scrapedRepos: ScrapedRepoSummary[];
  scrapingRepos: Set<string>;
  ragCache: Record<string, RAGContext>;
  selectNode: (node: any | null) => void;
  setFilterTypes: (types: string[]) => void;
  setSearchQuery: (query: string) => void;
  setFocusedMode: (focused: boolean) => void;
  zoom: (type: 'in' | 'out' | 'reset') => void;
  setShowAdminModal: (show: boolean) => void;
  updateProjectConfig: (nodeId: string, config: Partial<ProjectConfig>) => void;
  setHoveredNode: (node: any | null) => void;
  fetchGithubStatus: (token: string) => Promise<void>;
  setGithubStatus: (status: GitHubStatus) => void;
  fetchScrapedRepos: () => Promise<void>;
  scrapeRepo: (token: string, repoFullName: string) => Promise<any>;
  fetchRAGContext: (repoName: string) => Promise<RAGContext | null>;
  setScrapingRepo: (name: string, scraping: boolean) => void;
  syncConfigToServer: (token: string) => Promise<void>;
  loadConfigFromServer: (token: string) => Promise<void>;
}

const adminConfig = loadAdminConfig();

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: applyAdminWeights(graphData.nodes, adminConfig),
  edges: graphData.edges,
  selectedNode: null,
  filterTypes: [],
  searchQuery: '',
  isFocusedMode: false,
  _zoomAction: null,
  showAdminModal: false,
  adminConfig,
  hoveredNode: null,
  githubStatus: { connected: false },
  scrapedRepos: [],
  scrapingRepos: new Set(),
  ragCache: {},

  selectNode: (node) => set({ selectedNode: node, isFocusedMode: false }),
  setFilterTypes: (types) => set({ filterTypes: types }),
  setSearchQuery: (query) => set({ searchQuery: query, isFocusedMode: false }),
  setFocusedMode: (focused) => set({ isFocusedMode: focused }),
  zoom: (type) => set({ _zoomAction: { type, ts: Date.now() } }),
  setShowAdminModal: (show) => set({ showAdminModal: show }),
  setHoveredNode: (node) => set({ hoveredNode: node }),

  updateProjectConfig: (nodeId, config) => {
    const state = get();
    const newAdminConfig = {
      ...state.adminConfig,
      projects: { ...state.adminConfig.projects, [nodeId]: { ...state.adminConfig.projects[nodeId], ...config } },
    };
    saveAdminConfigLocal(newAdminConfig);
    const merged = mergeScrapedReposIntoGraph(graphData.nodes, graphData.edges, state.scrapedRepos, newAdminConfig);
    set({ adminConfig: newAdminConfig, nodes: merged.nodes, edges: merged.edges });
  },

  setGithubStatus: (status) => set({ githubStatus: status }),

  fetchGithubStatus: async (token) => {
    try {
      const res = await fetch(`${API_BASE}/api/github/status`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      set({ githubStatus: data });
    } catch {
      set({ githubStatus: { connected: false } });
    }
  },

  fetchScrapedRepos: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/github/scraped-all`);
      const data = await res.json();
      const repos = data.repos || [];
      const state = get();
      const merged = mergeScrapedReposIntoGraph(graphData.nodes, graphData.edges, repos, state.adminConfig);
      set({ scrapedRepos: repos, nodes: merged.nodes, edges: merged.edges });
    } catch {}
  },

  scrapeRepo: async (token, repoFullName) => {
    const state = get();
    const newSet = new Set(state.scrapingRepos);
    newSet.add(repoFullName);
    set({ scrapingRepos: newSet });
    try {
      const res = await fetch(`${API_BASE}/api/github/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ repoFullName }),
      });
      const data = await res.json();
      get().fetchScrapedRepos();
      return data;
    } finally {
      const s = get();
      const updated = new Set(s.scrapingRepos);
      updated.delete(repoFullName);
      set({ scrapingRepos: updated });
    }
  },

  fetchRAGContext: async (repoName) => {
    const cache = get().ragCache;
    if (cache[repoName]) return cache[repoName];
    try {
      const res = await fetch(`${API_BASE}/api/github/rag-context/${encodeURIComponent(repoName)}`);
      if (!res.ok) return null;
      const data: RAGContext = await res.json();
      set({ ragCache: { ...get().ragCache, [repoName]: data } });
      return data;
    } catch {
      return null;
    }
  },

  setScrapingRepo: (name, scraping) => {
    const s = get();
    const updated = new Set(s.scrapingRepos);
    if (scraping) updated.add(name);
    else updated.delete(name);
    set({ scrapingRepos: updated });
  },

  syncConfigToServer: async (token) => {
    try {
      const config = get().adminConfig;
      await fetch(`${API_BASE}/api/github/graph-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projects: config.projects }),
      });
    } catch {}
  },

  loadConfigFromServer: async (token) => {
    try {
      const res = await fetch(`${API_BASE}/api/github/graph-config`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.projects && Object.keys(data.projects).length > 0) {
        const state = get();
        const mergedConfig = { ...state.adminConfig, projects: { ...state.adminConfig.projects, ...data.projects } };
        saveAdminConfigLocal(mergedConfig);
        const mergedGraph = mergeScrapedReposIntoGraph(graphData.nodes, graphData.edges, state.scrapedRepos, mergedConfig);
        set({ adminConfig: mergedConfig, nodes: mergedGraph.nodes, edges: mergedGraph.edges });
      }
    } catch {}
  },
}));
