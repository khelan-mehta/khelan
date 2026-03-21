import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../stores/graphStore';
import type { ProjectConfig } from '../../stores/graphStore';

const API_BASE = 'https://portfoliobe-ebon.vercel.app';
const ADMIN_PASSWORD = 'khelan2024';

const NODE_COLORS: Record<string, string> = {
  person: '#fff',
  skill: '#d4d4d4',
  project: '#e8e8e8',
  language: '#a3a3a3',
  certification: '#c0c0c0',
  company: '#b0b0b0',
  education: '#bfbfbf',
  repo: '#999',
  domain: '#aaa',
  tool: '#888',
};

type TabId = 'dashboard' | 'ranks' | 'context' | 'links' | 'github';

const TAB_LABELS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'github', label: 'GitHub' },
  { id: 'ranks', label: 'Rankings' },
  { id: 'context', label: 'Context' },
  { id: 'links', label: 'Links' },
];

export default function GraphAdminModal() {
  const {
    showAdminModal,
    setShowAdminModal,
    nodes,
    edges,
    adminConfig,
    updateProjectConfig,
    githubStatus,
    fetchGithubStatus,
    fetchScrapedRepos,
    scrapedRepos,
    scrapeRepo,
    scrapingRepos,
    syncConfigToServer,
    loadConfigFromServer,
  } = useGraphStore();

  const [isAuthed, setIsAuthed] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [saveFlash, setSaveFlash] = useState<string | null>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingGhRepos, setLoadingGhRepos] = useState(false);
  const [_scrapeResults, setScrapeResults] = useState<Record<string, any>>({});
  const passwordRef = useRef<HTMLInputElement>(null);

  // On open, check sessionStorage for existing token
  useEffect(() => {
    if (showAdminModal) {
      const storedToken = sessionStorage.getItem('admin_token');
      if (storedToken) {
        setAdminToken(storedToken);
        setIsAuthed(true);
        fetchGithubStatus(storedToken);
        fetchScrapedRepos();
        loadConfigFromServer(storedToken);
      }
      // Check for github callback flow
      const ghConnected = sessionStorage.getItem('github_connected');
      if (ghConnected) {
        sessionStorage.removeItem('github_connected');
        const token = sessionStorage.getItem('admin_token');
        if (token) {
          fetchGithubStatus(token);
        }
      }
    }
  }, [showAdminModal]);

  // Focus password input on mount
  useEffect(() => {
    if (showAdminModal && !isAuthed && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [showAdminModal, isAuthed]);

  // --- Computed ---
  const repos = useMemo(() => {
    return nodes
      .filter((n: any) => n.type === 'repo' || n.type === 'project')
      .sort((a: any, b: any) => {
        const aRank = adminConfig.projects[a.id]?.rank || 999;
        const bRank = adminConfig.projects[b.id]?.rank || 999;
        if (aRank !== bRank) return aRank - bRank;
        return (b.weight || 0) - (a.weight || 0);
      });
  }, [nodes, adminConfig]);

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const q = searchQuery.toLowerCase();
    return repos.filter((r: any) => r.label?.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q));
  }, [repos, searchQuery]);

  const dashMetrics = useMemo(() => {
    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    const typeBreakdown: Record<string, number> = {};
    const edgeTypeBreakdown: Record<string, number> = {};
    let repoCount = 0;
    let totalWeight = 0;
    const langCounts: Record<string, number> = {};
    const langNodes: { label: string; weight: number }[] = [];
    const toolNodes: { label: string; weight: number }[] = [];

    nodes.forEach((n: any) => {
      typeBreakdown[n.type] = (typeBreakdown[n.type] || 0) + 1;
      if (n.type === 'repo' || n.type === 'project') {
        repoCount++;
        totalWeight += n.weight || 0;
      }
      if (n.type === 'language') {
        langNodes.push({ label: n.label, weight: n.weight || 1 });
      }
      if (n.type === 'tool') {
        toolNodes.push({ label: n.label, weight: n.weight || 1 });
      }
    });

    edges.forEach((e: any) => {
      edgeTypeBreakdown[e.type] = (edgeTypeBreakdown[e.type] || 0) + 1;
    });

    scrapedRepos.forEach((sr) => {
      if (sr.languages) {
        sr.languages.forEach((l) => {
          langCounts[l] = (langCounts[l] || 0) + 1;
        });
      }
    });

    const scrapedCount = scrapedRepos.length;
    const rankedCount = Object.values(adminConfig.projects).filter((p) => p.rank).length;
    const contextedCount = Object.values(adminConfig.projects).filter((p) => p.context).length;
    const linkedCount = Object.values(adminConfig.projects).filter((p) => p.liveUrl || p.docsUrl).length;
    const avgWeight = repoCount > 0 ? (totalWeight / repoCount).toFixed(1) : '0';

    return {
      totalNodes,
      totalEdges,
      typeBreakdown,
      edgeTypeBreakdown,
      repoCount,
      avgWeight,
      scrapedCount,
      rankedCount,
      contextedCount,
      linkedCount,
      langCounts,
      langNodes: langNodes.sort((a, b) => b.weight - a.weight),
      toolNodes: toolNodes.sort((a, b) => b.weight - a.weight),
    };
  }, [nodes, edges, adminConfig, scrapedRepos]);

  // --- Handlers ---
  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token || 'local-auth';
        sessionStorage.setItem('admin_token', token);
        setAdminToken(token);
        setIsAuthed(true);
        fetchGithubStatus(token);
        fetchScrapedRepos();
        loadConfigFromServer(token);
        return;
      }
    } catch {
      // Backend unavailable, try local
    }
    // Fallback to local
    if (password === ADMIN_PASSWORD) {
      const token = 'local-auth';
      sessionStorage.setItem('admin_token', token);
      setAdminToken(token);
      setIsAuthed(true);
      fetchGithubStatus(token);
      fetchScrapedRepos();
      loadConfigFromServer(token);
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleSave = (nodeId: string, config: Partial<ProjectConfig>) => {
    updateProjectConfig(nodeId, config);
    syncConfigToServer(adminToken);
    setSaveFlash(nodeId);
    setTimeout(() => setSaveFlash(null), 1200);
  };

  const handleConnectGithub = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/github/auth-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to get GitHub auth URL:', err);
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      await fetch(`${API_BASE}/api/github/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchGithubStatus(adminToken);
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err);
    }
  };

  const handleLoadGithubRepos = async () => {
    setLoadingGhRepos(true);
    try {
      const res = await fetch(`${API_BASE}/api/github/repos`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      setGithubRepos(data.repos || data || []);
    } catch (err) {
      console.error('Failed to load repos:', err);
    } finally {
      setLoadingGhRepos(false);
    }
  };

  const handleScrapeRepo = async (repoFullName: string) => {
    try {
      const result = await scrapeRepo(adminToken, repoFullName);
      setScrapeResults((prev) => ({ ...prev, [repoFullName]: result }));
    } catch (err) {
      console.error('Failed to scrape repo:', err);
    }
  };

  const handleScrapeAll = async () => {
    for (const repo of githubRepos) {
      const fullName = repo.full_name || repo.fullName;
      if (fullName && !scrapedRepos.some((sr) => sr.repoFullName === fullName)) {
        await handleScrapeRepo(fullName);
      }
    }
  };

  if (!showAdminModal) return null;

  // --- Styles ---
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
  };

  const panelStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 780,
    maxHeight: '85vh',
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: '#fff',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  };

  const btnBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#ccc',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 13,
    padding: '6px 14px',
    transition: 'all 0.15s',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 16,
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontFamily: 'monospace',
    background: `${color}18`,
    color: color,
    border: `1px solid ${color}30`,
  });

  // --- Auth gate ---
  if (!isAuthed) {
    return (
      <motion.div
        style={overlayStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowAdminModal(false)}
      >
        <motion.div
          style={{
            ...panelStyle,
            maxWidth: 400,
            maxHeight: 'none',
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lock icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Admin Access</div>
          <div style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>
            Enter the admin password to manage the knowledge graph.
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <input
              ref={passwordRef}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            {loginError && (
              <div style={{ color: '#ff6b6b', fontSize: 12, textAlign: 'center' }}>{loginError}</div>
            )}
            <button
              type="submit"
              style={{
                ...btnBase,
                width: '100%',
                padding: '10px 0',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              Unlock
            </button>
          </form>
        </motion.div>
      </motion.div>
    );
  }

  // --- Tab content renderers ---

  const renderDashboard = () => {
    const coverage = [
      { label: 'Ranked', value: dashMetrics.rankedCount, total: dashMetrics.repoCount },
      { label: 'With Context', value: dashMetrics.contextedCount, total: dashMetrics.repoCount },
      { label: 'With Links', value: dashMetrics.linkedCount, total: dashMetrics.repoCount },
      { label: 'Deep Scraped', value: dashMetrics.scrapedCount, total: dashMetrics.repoCount },
    ];

    const sortedTypes = Object.entries(dashMetrics.typeBreakdown).sort((a, b) => b[1] - a[1]);
    const sortedEdgeTypes = Object.entries(dashMetrics.edgeTypeBreakdown).sort((a, b) => b[1] - a[1]);
    const sortedLangs = Object.entries(dashMetrics.langCounts).sort((a, b) => b[1] - a[1]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Top metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Nodes', value: dashMetrics.totalNodes },
            { label: 'Edges', value: dashMetrics.totalEdges },
            { label: 'Repos', value: dashMetrics.repoCount },
            { label: 'Scraped', value: dashMetrics.scrapedCount },
          ].map((m) => (
            <div key={m.label} style={cardStyle}>
              <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Configuration Coverage */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 12 }}>Configuration Coverage</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {coverage.map((c) => {
              const pct = c.total > 0 ? Math.round((c.value / c.total) * 100) : 0;
              return (
                <div key={c.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: '#999' }}>{c.label}</span>
                    <span style={{ color: '#ccc' }}>
                      {c.value}/{c.total} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: '#fff',
                        borderRadius: 3,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Distribution */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 12 }}>Node Distribution</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sortedTypes.map(([type, count]) => (
              <div key={type} style={badgeStyle(NODE_COLORS[type] || '#999')}>
                <span>{type}</span>
                <span style={{ fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Types */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 12 }}>Connection Types</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {sortedEdgeTypes.map(([type, count]) => (
              <div
                key={type}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: '#999' }}>{type}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Languages from scraped */}
        {sortedLangs.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 12 }}>Languages (Scraped)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sortedLangs.map(([lang, count]) => (
                <div key={lang} style={badgeStyle('#a3a3a3')}>
                  <span>{lang}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graph Languages + Graph Tools */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 12 }}>Graph Languages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dashMetrics.langNodes.map((ln) => (
                <div key={ln.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#ccc' }}>{ln.label}</span>
                  <span style={{ color: '#666' }}>w:{ln.weight}</span>
                </div>
              ))}
              {dashMetrics.langNodes.length === 0 && (
                <div style={{ fontSize: 12, color: '#444' }}>No language nodes</div>
              )}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 12 }}>Graph Tools</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dashMetrics.toolNodes.map((tn) => (
                <div key={tn.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#ccc' }}>{tn.label}</span>
                  <span style={{ color: '#666' }}>w:{tn.weight}</span>
                </div>
              ))}
              {dashMetrics.toolNodes.length === 0 && (
                <div style={{ fontSize: 12, color: '#444' }}>No tool nodes</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGithub = () => {
    const isConnected = githubStatus.connected;
    const alreadyScraped = scrapedRepos.map((sr) => sr.repoFullName);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Connection status card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isConnected ? '#fff' : '#444',
                  boxShadow: isConnected ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </div>
                {isConnected && githubStatus.username && (
                  <div style={{ fontSize: 12, color: '#666' }}>@{githubStatus.username}</div>
                )}
              </div>
            </div>
            {isConnected ? (
              <button
                style={{ ...btnBase, color: '#999' }}
                onClick={handleDisconnectGithub}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                Disconnect
              </button>
            ) : (
              <button
                style={{ ...btnBase, color: '#fff', background: 'rgba(255,255,255,0.1)' }}
                onClick={handleConnectGithub}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                Connect GitHub
              </button>
            )}
          </div>
        </div>

        {/* Repository Scraper */}
        {isConnected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#ccc' }}>Repository Scraper</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={btnBase}
                  onClick={handleLoadGithubRepos}
                  disabled={loadingGhRepos}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  {loadingGhRepos ? 'Loading...' : 'Load Repos'}
                </button>
                {githubRepos.length > 0 && (
                  <button
                    style={{ ...btnBase, color: '#fff' }}
                    onClick={handleScrapeAll}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    Scrape All
                  </button>
                )}
              </div>
            </div>

            {/* Already-scraped summary */}
            {scrapedRepos.length > 0 && (
              <div style={{ ...cardStyle, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                  Already Scraped ({scrapedRepos.length} repos)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {scrapedRepos.map((sr) => (
                    <div
                      key={sr.repoFullName}
                      style={{
                        ...badgeStyle('#999'),
                        fontSize: 10,
                      }}
                    >
                      <span>{sr.repoName}</span>
                      <span style={{ color: '#666' }}>{sr.chunkCount} chunks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repo list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {githubRepos.map((repo) => {
                const fullName = repo.full_name || repo.fullName || '';
                const isScraped = alreadyScraped.includes(fullName);
                const isScraping = scrapingRepos.has(fullName);
                return (
                  <div
                    key={fullName}
                    style={{
                      ...cardStyle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{repo.name}</span>
                        {repo.language && (
                          <span style={badgeStyle('#a3a3a3')}>{repo.language}</span>
                        )}
                        {repo.private && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: 'rgba(255,255,255,0.06)',
                              color: '#666',
                            }}
                          >
                            private
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#666',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 450,
                          }}
                        >
                          {repo.description}
                        </div>
                      )}
                      {typeof repo.stargazers_count === 'number' && repo.stargazers_count > 0 && (
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                          {repo.stargazers_count} stars
                        </div>
                      )}
                    </div>
                    <button
                      style={{
                        ...btnBase,
                        minWidth: 80,
                        textAlign: 'center',
                        opacity: isScraped ? 0.5 : 1,
                        color: isScraped ? '#666' : '#ccc',
                      }}
                      onClick={() => !isScraped && !isScraping && handleScrapeRepo(fullName)}
                      disabled={isScraped || isScraping}
                      onMouseEnter={(e) => {
                        if (!isScraped && !isScraping) {
                          (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      {isScraping ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #666', borderTopColor: '#fff', borderRadius: '50%' }}
                          />
                          Scraping
                        </span>
                      ) : isScraped ? (
                        'Scraped'
                      ) : (
                        'Scrape'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRankings = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Search */}
        <input
          style={inputStyle}
          placeholder="Filter repos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredRepos.map((repo: any) => {
            const config = adminConfig.projects[repo.id] || {};
            const connectionCount = edges.filter(
              (e: any) => e.source === repo.id || e.target === repo.id
            ).length;
            const isFlashing = saveFlash === repo.id;
            return (
              <motion.div
                key={repo.id}
                style={{
                  ...cardStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  border: isFlashing
                    ? '1px solid rgba(255,255,255,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
                animate={
                  isFlashing
                    ? { borderColor: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.08)'] }
                    : {}
                }
                transition={{ duration: 1 }}
              >
                {/* Rank input */}
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={config.rank || ''}
                  placeholder="#"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    handleSave(repo.id, { rank: isNaN(val) ? undefined : val });
                  }}
                  style={{
                    ...inputStyle,
                    width: 48,
                    textAlign: 'center',
                    padding: '6px 4px',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                />
                {/* Label + info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {repo.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#666' }}>
                    w:{repo.weight || 0} &middot; {connectionCount} connections
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filteredRepos.length === 0 && (
            <div style={{ textAlign: 'center', color: '#444', fontSize: 13, padding: 20 }}>
              No repos found
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContext = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          style={inputStyle}
          placeholder="Filter repos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredRepos.map((repo: any) => {
            const config = adminConfig.projects[repo.id] || {};
            const isExpanded = editingNode === repo.id;
            return (
              <div key={repo.id} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingNode(isExpanded ? null : repo.id)}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{repo.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {config.context && (
                      <span style={{ fontSize: 10, color: '#666' }}>has context</span>
                    )}
                    <span
                      style={{
                        fontSize: 16,
                        color: '#666',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                      }}
                    >
                      &#9662;
                    </span>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <textarea
                          value={config.context || ''}
                          placeholder="Add admin context for this project..."
                          onChange={(e) => {
                            updateProjectConfig(repo.id, { context: e.target.value });
                          }}
                          style={{
                            ...inputStyle,
                            minHeight: 100,
                            resize: 'vertical',
                            lineHeight: 1.5,
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            style={btnBase}
                            onClick={() => handleSave(repo.id, { context: config.context })}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                            }}
                          >
                            {saveFlash === repo.id ? 'Saved!' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filteredRepos.length === 0 && (
            <div style={{ textAlign: 'center', color: '#444', fontSize: 13, padding: 20 }}>
              No repos found
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLinks = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          style={inputStyle}
          placeholder="Filter repos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredRepos.map((repo: any) => {
            const config = adminConfig.projects[repo.id] || {};
            const isExpanded = editingNode === repo.id;
            return (
              <div key={repo.id} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingNode(isExpanded ? null : repo.id)}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{repo.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {(config.liveUrl || config.docsUrl) && (
                      <span style={{ fontSize: 10, color: '#666' }}>has links</span>
                    )}
                    <span
                      style={{
                        fontSize: 16,
                        color: '#666',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                      }}
                    >
                      &#9662;
                    </span>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, color: '#666', marginBottom: 4, display: 'block' }}>
                            Live URL
                          </label>
                          <input
                            value={config.liveUrl || ''}
                            placeholder="https://..."
                            onChange={(e) => {
                              updateProjectConfig(repo.id, { liveUrl: e.target.value });
                            }}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#666', marginBottom: 4, display: 'block' }}>
                            Docs URL
                          </label>
                          <input
                            value={config.docsUrl || ''}
                            placeholder="https://..."
                            onChange={(e) => {
                              updateProjectConfig(repo.id, { docsUrl: e.target.value });
                            }}
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            style={btnBase}
                            onClick={() =>
                              handleSave(repo.id, { liveUrl: config.liveUrl, docsUrl: config.docsUrl })
                            }
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                            }}
                          >
                            {saveFlash === repo.id ? 'Saved!' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filteredRepos.length === 0 && (
            <div style={{ textAlign: 'center', color: '#444', fontSize: 13, padding: 20 }}>
              No repos found
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'github':
        return renderGithub();
      case 'ranks':
        return renderRankings();
      case 'context':
        return renderContext();
      case 'links':
        return renderLinks();
      default:
        return null;
    }
  };

  // --- Main render ---
  return (
    <motion.div
      style={overlayStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowAdminModal(false)}
    >
      <motion.div
        style={panelStyle}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Graph Admin</div>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: 20,
              fontFamily: 'monospace',
              padding: '4px 8px',
              lineHeight: 1,
            }}
            onClick={() => setShowAdminModal(false)}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = '#666';
            }}
          >
            &times;
          </button>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '0 24px',
            position: 'relative',
          }}
        >
          {TAB_LABELS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isActive ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  padding: '12px 16px',
                  position: 'relative',
                  transition: 'color 0.15s',
                }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                  setEditingNode(null);
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.target as HTMLElement).style.color = '#999';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.target as HTMLElement).style.color = '#666';
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="admin-tab-indicator"
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#fff',
                      borderRadius: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable content */}
        <div
          style={scrollContainerStyle}
          className="graph-admin-scroll"
        >
          {renderTabContent()}
        </div>

        {/* Custom scrollbar styles injected */}
        <style>{`
          .graph-admin-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .graph-admin-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .graph-admin-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
          }
          .graph-admin-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}
