import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { useGraphStore } from '../../stores/graphStore';
import type { RAGContext } from '../../stores/graphStore';

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

const NODE_TYPE_LABELS: Record<string, string> = {
  person: 'Person',
  skill: 'Skill',
  project: 'Project',
  language: 'Language',
  certification: 'Certification',
  company: 'Company',
  education: 'Education',
  repo: 'Repository',
  domain: 'Domain',
  tool: 'Tool',
};

const genAI = new GoogleGenerativeAI((import.meta as any).env.VITE_GEMINI_API_KEY || '');

function buildSystemPrompt(
  node: any,
  connectedNodes: { node: any; edgeType: string; direction: string }[],
  projectConfig: any,
  ragContext: RAGContext | null,
  allNodes: any[]
) {
  const lines: string[] = [];

  // Identity / role
  lines.push('You are an expert AI guide for Khelan Mehta\'s interactive portfolio knowledge graph.');
  lines.push('You provide insightful, technically accurate information about his projects, skills, and experience.');
  lines.push('You speak confidently and specifically — you know this portfolio deeply.');
  lines.push('');

  // Current node context
  lines.push('## Current Node Context');
  lines.push(`- **Label**: ${node.label}`);
  lines.push(`- **Type**: ${NODE_TYPE_LABELS[node.type] || node.type}`);
  lines.push(`- **Weight/Impact**: ${node.weight}/10`);
  if (node.metadata) {
    const metaEntries = Object.entries(node.metadata);
    if (metaEntries.length > 0) {
      lines.push('- **Metadata**:');
      metaEntries.forEach(([k, v]) => {
        if (v && typeof v === 'string' && v.length < 500) {
          lines.push(`  - ${k}: ${v}`);
        }
      });
    }
  }
  if (projectConfig?.context) {
    lines.push(`- **Admin Context**: ${projectConfig.context}`);
  }
  if (projectConfig?.liveUrl) {
    lines.push(`- **Live URL**: ${projectConfig.liveUrl}`);
  }
  if (projectConfig?.docsUrl) {
    lines.push(`- **Docs URL**: ${projectConfig.docsUrl}`);
  }
  if (projectConfig?.rank) {
    lines.push(`- **Admin Rank**: #${projectConfig.rank}`);
  }
  lines.push('');

  // Graph connections grouped by edge type
  if (connectedNodes.length > 0) {
    lines.push('## Graph Connections');
    const grouped: Record<string, string[]> = {};
    connectedNodes.forEach(({ node: cn, edgeType, direction }) => {
      const key = `${edgeType} (${direction})`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(`${cn.label} [${cn.type}]`);
    });
    Object.entries(grouped).forEach(([key, items]) => {
      lines.push(`- **${key}**: ${items.join(', ')}`);
    });
    lines.push('');
  }

  // RAG context chunks
  if (ragContext && ragContext.chunks && ragContext.chunks.length > 0) {
    lines.push('## Deep-Scraped Repository Data (RAG Context)');
    lines.push(`Repository: ${ragContext.repoName} | Total chunks: ${ragContext.totalChunks}`);
    lines.push('');
    ragContext.chunks.forEach((chunk, i) => {
      lines.push(`### Chunk ${i + 1} [${chunk.type}${chunk.section ? ` — ${chunk.section}` : ''}] (priority: ${chunk.priority})`);
      lines.push(chunk.content.slice(0, 2000));
      lines.push('');
    });
  }

  // Broader portfolio context
  const languages = allNodes.filter((n) => n.type === 'language').map((n) => n.label);
  const tools = allNodes.filter((n) => n.type === 'tool').map((n) => n.label);
  const domains = allNodes.filter((n) => n.type === 'domain').map((n) => n.label);
  if (languages.length || tools.length || domains.length) {
    lines.push('## Broader Portfolio Context');
    if (languages.length) lines.push(`- **Languages**: ${languages.join(', ')}`);
    if (tools.length) lines.push(`- **Tools**: ${tools.join(', ')}`);
    if (domains.length) lines.push(`- **Domains**: ${domains.join(', ')}`);
    lines.push('');
  }

  // Response guidelines
  lines.push('## Response Guidelines');
  lines.push('- Be specific and technical — reference actual project details, technologies, and architecture.');
  lines.push('- Be contextual — relate answers to the current node and its connections in the graph.');
  lines.push('- Use markdown formatting for readability (headers, bold, lists, code blocks).');
  lines.push('- Keep responses concise but informative (2-4 paragraphs max unless asked for detail).');
  lines.push('- Never fabricate information. If you do not know something, say so.');

  return lines.join('\n');
}

type TabId = 'overview' | 'ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function NodeDetail() {
  const {
    selectedNode,
    edges,
    nodes,
    selectNode,
    adminConfig,
    fetchRAGContext,
    isFocusedMode,
    setFocusedMode,
  } = useGraphStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [ragContext, setRagContext] = useState<RAGContext | null>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [parsedRagContext, setParsedRagContext] = useState<string | null>(null);
  const [isParsingRag, setIsParsingRag] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Top projects navigation — top 10 repos sorted by admin rank then weight
  const topProjects = useMemo(() => {
    const repos = nodes.filter((n: any) => n.type === 'repo' || n.type === 'project');
    return repos
      .sort((a: any, b: any) => {
        const aRank = adminConfig.projects[a.id]?.rank ?? 999;
        const bRank = adminConfig.projects[b.id]?.rank ?? 999;
        if (aRank !== bRank) return aRank - bRank;
        return (b.weight || 0) - (a.weight || 0);
      })
      .slice(0, 10);
  }, [nodes, adminConfig]);

  const currentProjectIndex = useMemo(() => {
    if (!selectedNode) return -1;
    return topProjects.findIndex((p: any) => p.id === selectedNode.id);
  }, [selectedNode, topProjects]);

  const navigateProject = (direction: -1 | 1) => {
    if (currentProjectIndex < 0) return;
    const nextIdx = currentProjectIndex + direction;
    if (nextIdx >= 0 && nextIdx < topProjects.length) {
      selectNode(topProjects[nextIdx]);
    }
  };

  // On selectedNode change
  useEffect(() => {
    if (!selectedNode) return;
    setChatHistory([]);
    setActiveTab('overview');
    setRagContext(null);
    setParsedRagContext(null);

    if (selectedNode.type === 'repo' || selectedNode.type === 'project') {
      const repoName = selectedNode.label;
      setRagLoading(true);
      fetchRAGContext(repoName).then((ctx) => {
        setRagContext(ctx);
        setRagLoading(false);

        // Auto-generate AI summary if Gemini key exists
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        if (apiKey && ctx && ctx.chunks && ctx.chunks.length > 0) {
          setIsParsingRag(true);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const summaryPrompt = `Summarize this repository data in 2-3 sentences. Focus on purpose, tech stack, and standout features:\n\n${ctx.chunks
            .slice(0, 5)
            .map((c) => c.content.slice(0, 800))
            .join('\n\n')}`;
          model
            .generateContent(summaryPrompt)
            .then((result) => {
              setParsedRagContext(result.response.text());
            })
            .catch(() => {
              setParsedRagContext(null);
            })
            .finally(() => {
              setIsParsingRag(false);
            });
        }
      });
    }
  }, [selectedNode?.id]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  // Connected nodes
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const results: { node: any; edgeType: string; direction: string }[] = [];
    edges.forEach((edge: any) => {
      if (edge.source === selectedNode.id) {
        const target = nodes.find((n: any) => n.id === edge.target);
        if (target) results.push({ node: target, edgeType: edge.type || 'related', direction: 'outgoing' });
      }
      if (edge.target === selectedNode.id) {
        const source = nodes.find((n: any) => n.id === edge.source);
        if (source) results.push({ node: source, edgeType: edge.type || 'related', direction: 'incoming' });
      }
    });
    return results;
  }, [selectedNode, edges, nodes]);

  // Connections grouped by edge type
  const connectionGroups = useMemo(() => {
    const groups: Record<string, { node: any; edgeType: string; direction: string }[]> = {};
    connectedNodes.forEach((cn) => {
      const key = cn.edgeType;
      if (!groups[key]) groups[key] = [];
      groups[key].push(cn);
    });
    return groups;
  }, [connectedNodes]);

  const projectConfig = selectedNode ? adminConfig.projects[selectedNode.id] || {} : {};
  const nodeColor = selectedNode ? NODE_COLORS[selectedNode.type] || '#999' : '#999';
  const nodeTypeLabel = selectedNode ? NODE_TYPE_LABELS[selectedNode.type] || selectedNode.type : '';

  // Handle AI chat
  const handleAiChat = async (userMessage?: string) => {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'AI insights require a Gemini API key. Set `VITE_GEMINI_API_KEY` in your environment.',
        },
      ]);
      return;
    }

    const prompt =
      userMessage ||
      `Give me a comprehensive overview of "${selectedNode?.label}". What makes it noteworthy in this portfolio? Include technical details, connections, and context.`;

    setChatHistory((prev) => [...prev, { role: 'user', content: prompt }]);
    setIsAiLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(
        selectedNode,
        connectedNodes,
        projectConfig,
        ragContext,
        nodes
      );

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Build multi-turn history (last 6 messages)
      const recentHistory = chatHistory.slice(-6);
      const contents: any[] = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to discuss this node in depth.' }] },
      ];

      recentHistory.forEach((msg) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      });

      contents.push({ role: 'user', parts: [{ text: prompt }] });

      const chat = model.startChat({ history: contents.slice(0, -1) });
      const result = await chat.sendMessage(prompt);
      const text = result.response.text();

      setChatHistory((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error generating response: ${err?.message || 'Unknown error'}. Please try again.`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = chatInputRef.current;
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    input.value = '';
    handleAiChat(msg);
  };

  if (!selectedNode) return null;

  const meta = selectedNode.metadata || {};

  // ─── Inline style objects ────────────────────────────────────────

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 480,
    background: 'rgba(12,12,18,0.95)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    overflow: 'hidden',
  };

  const colorStripStyle: React.CSSProperties = {
    height: 3,
    background: nodeColor,
    width: '100%',
    flexShrink: 0,
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  };

  const typeLabelStyle: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#999',
    marginRight: 8,
  };

  const rankBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#666',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    padding: '2px 7px',
    borderRadius: 4,
    marginRight: 6,
    letterSpacing: '0.05em',
  };

  const highImpactBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    padding: '2px 7px',
    borderRadius: 4,
    marginRight: 6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  };

  const ragIndicatorStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.07)',
    color: '#ccc',
    fontSize: 9,
    fontWeight: 600,
    fontFamily: "'Space Mono', monospace",
    padding: '2px 7px',
    borderRadius: 4,
    marginRight: 6,
    letterSpacing: '0.05em',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    fontFamily: "'Syne', sans-serif",
    margin: '10px 0 0',
    lineHeight: 1.2,
  };

  const adminContextStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 1.5,
  };

  const buttonBase: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: '#ccc',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
    transition: 'all 0.15s ease',
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
    padding: '0 20px',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: active ? '#fff' : '#666',
    borderBottom: active ? '2px solid #fff' : '2px solid transparent',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: active ? '#fff' : 'transparent',
    transition: 'all 0.15s ease',
  });

  const contentArea: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '16px 20px 20px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#666',
    marginBottom: 10,
    marginTop: 20,
  };

  // ─── Render helpers ──────────────────────────────────────────────

  const renderStatsRow = () => {
    const linkCount = connectedNodes.length;
    const stars = meta.stars;

    return (
      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
        {[
          { label: 'Impact', value: `${selectedNode.weight}/10` },
          { label: 'Links', value: linkCount },
          ...(typeof stars === 'number' ? [{ label: 'Stars', value: stars }] : []),
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '12px 10px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#666',
                marginTop: 4,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuickLinks = () => {
    const links: { label: string; url: string }[] = [];
    if (projectConfig.liveUrl) links.push({ label: 'Live Demo', url: projectConfig.liveUrl });
    if (meta.url) links.push({ label: 'GitHub', url: meta.url });
    if (projectConfig.docsUrl) links.push({ label: 'Docs', url: projectConfig.docsUrl });
    if (projectConfig.extraLinks) {
      projectConfig.extraLinks.forEach((l: { label: string; url: string }) => links.push(l));
    }

    if (links.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <div style={sectionTitleStyle}>Quick Links</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: '#ccc',
                fontSize: 12,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = '#ccc';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderRagSummary = () => {
    if (!ragContext && !ragLoading) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <div style={sectionTitleStyle}>RAG Data Summary</div>
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: 14,
          }}
        >
          {ragLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#999', fontSize: 12 }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: 14, height: 14 }}>
                &#x21bb;
              </span>
              Loading scraped data...
            </div>
          ) : ragContext ? (
            <>
              {isParsingRag ? (
                <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
                  Generating AI summary...
                </div>
              ) : parsedRagContext ? (
                <div style={{ color: '#ccc', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
                  {parsedRagContext}
                </div>
              ) : null}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Array.from(new Set(ragContext.chunks.map((c) => c.type))).map((chunkType) => (
                  <span
                    key={chunkType}
                    style={{
                      display: 'inline-block',
                      padding: '3px 9px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.06)',
                      color: '#999',
                      fontSize: 10,
                      fontFamily: "'Space Mono', monospace",
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {chunkType}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: '#666', fontFamily: "'Space Mono', monospace" }}>
                {ragContext.totalChunks} chunks available
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  };

  const renderProperties = () => {
    const entries = Object.entries(meta).filter(([k]) => k !== 'url');
    if (entries.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <div style={sectionTitleStyle}>Properties</div>
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {entries.map(([key, value], i) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '10px 14px',
                borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#666',
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'capitalize',
                  flexShrink: 0,
                  marginRight: 12,
                }}
              >
                {key}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: '#ccc',
                  textAlign: 'right',
                  wordBreak: 'break-word',
                  maxWidth: '65%',
                  lineHeight: 1.4,
                }}
              >
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConstellation = () => {
    if (Object.keys(connectionGroups).length === 0) return null;

    return (
      <div style={{ marginTop: 16, marginBottom: 12 }}>
        <div style={sectionTitleStyle}>Constellation</div>
        {Object.entries(connectionGroups).map(([edgeType, items]) => (
          <div key={edgeType} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                fontFamily: "'Space Mono', monospace",
                color: '#666',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {edgeType}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {items.map(({ node: cn }, i) => (
                <button
                  key={`${cn.id}-${i}`}
                  onClick={() => selectNode(cn)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    color: '#ccc',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.color = '#ccc';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: NODE_COLORS[cn.type] || '#999',
                      flexShrink: 0,
                    }}
                  />
                  {cn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
    >
      {renderStatsRow()}
      {meta.description && (
        <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.7, color: '#ccc' }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: '0 0 8px' }}>{children}</p>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#fff', textDecoration: 'underline' }}
                >
                  {children}
                </a>
              ),
            }}
          >
            {meta.description}
          </ReactMarkdown>
        </div>
      )}
      {meta.bio && (
        <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, color: '#ccc' }}>{meta.bio}</div>
      )}
      {renderQuickLinks()}
      {renderRagSummary()}
      {renderProperties()}
      {renderConstellation()}
    </motion.div>
  );

  const renderLoadingDots = () => (
    <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#666',
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );

  const renderAiTab = () => {
    const hasMessages = chatHistory.length > 0;

    return (
      <motion.div
        key="ai"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Chat messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {!hasMessages && !isAiLoading && (
            <div style={{ textAlign: 'center', padding: '32px 10px' }}>
              <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>&#9733;</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                Ask AI anything about <strong style={{ color: '#ccc' }}>{selectedNode.label}</strong> — its
                architecture, tech stack, connections, or role in the portfolio.
              </div>
              <button
                onClick={() => handleAiChat()}
                style={{
                  ...buttonBase,
                  padding: '10px 20px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = '#ccc';
                }}
              >
                Generate Overview
              </button>
            </div>
          )}

          {chatHistory.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginBottom: 4,
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}
              >
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background:
                    msg.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    msg.role === 'user' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'
                  }`,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: '#ddd',
                }}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p style={{ margin: '0 0 8px', lineHeight: 1.7 }}>{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#fff',
                            margin: '12px 0 6px',
                          }}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#fff',
                            margin: '10px 0 4px',
                          }}
                        >
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#eee',
                            margin: '8px 0 4px',
                          }}
                        >
                          {children}
                        </h3>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 700, color: '#fff' }}>{children}</strong>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.includes('language-');
                        if (isBlock) {
                          return (
                            <pre
                              style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 6,
                                padding: '10px 12px',
                                overflowX: 'auto',
                                margin: '8px 0',
                              }}
                            >
                              <code
                                style={{
                                  fontFamily: "'Space Mono', monospace",
                                  fontSize: 11,
                                  color: '#ccc',
                                }}
                              >
                                {children}
                              </code>
                            </pre>
                          );
                        }
                        return (
                          <code
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: 11,
                              background: 'rgba(255,255,255,0.06)',
                              padding: '2px 5px',
                              borderRadius: 3,
                              color: '#ddd',
                            }}
                          >
                            {children}
                          </code>
                        );
                      },
                      ul: ({ children }) => (
                        <ul style={{ margin: '6px 0', paddingLeft: 18 }}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ margin: '6px 0', paddingLeft: 18 }}>{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li style={{ margin: '3px 0', lineHeight: 1.6, color: '#ccc' }}>{children}</li>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#fff', textDecoration: 'underline' }}
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {isAiLoading && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {renderLoadingDots()}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        <form
          onSubmit={handleChatSubmit}
          style={{
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            marginTop: 'auto',
          }}
        >
          <input
            ref={chatInputRef}
            type="text"
            placeholder="Ask about this node..."
            disabled={isAiLoading}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: '#ddd',
              fontSize: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          />
          <button
            type="submit"
            disabled={isAiLoading}
            style={{
              ...buttonBase,
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: 12,
              opacity: isAiLoading ? 0.4 : 1,
              background: 'rgba(255,255,255,0.08)',
            }}
            onMouseEnter={(e) => {
              if (!isAiLoading) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ccc';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </motion.div>
    );
  };

  // ─── Main panel render ───────────────────────────────────────────

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          key="node-detail"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={panelStyle}
        >
          {/* Color strip */}
          <div style={colorStripStyle} />

          {/* Header */}
          <div style={headerStyle}>
            {/* Top row: badges + buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                <span style={typeLabelStyle}>{nodeTypeLabel}</span>
                {projectConfig.rank && (
                  <span style={rankBadgeStyle}>#{projectConfig.rank}</span>
                )}
                {selectedNode.weight >= 8 && (
                  <span style={highImpactBadgeStyle}>High Impact</span>
                )}
                {ragContext && ragContext.chunks && ragContext.chunks.length > 0 && (
                  <span style={ragIndicatorStyle}>RAG</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => setFocusedMode(!isFocusedMode)}
                  style={{
                    ...buttonBase,
                    padding: '5px 10px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = '#ccc';
                  }}
                  title={isFocusedMode ? 'Unfocus' : 'Focus'}
                >
                  {isFocusedMode ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 14 10 14 10 20" />
                      <polyline points="20 10 14 10 14 4" />
                      <line x1="14" y1="10" x2="21" y2="3" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => selectNode(null)}
                  style={{
                    ...buttonBase,
                    padding: '5px 8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = '#ccc';
                  }}
                  title="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Title */}
            <div style={titleStyle}>{selectedNode.label}</div>

            {/* Admin context */}
            {projectConfig.context && (
              <div style={adminContextStyle}>{projectConfig.context}</div>
            )}

            {/* Top projects navigation */}
            {currentProjectIndex >= 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 12,
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <button
                  onClick={() => navigateProject(-1)}
                  disabled={currentProjectIndex <= 0}
                  style={{
                    ...buttonBase,
                    padding: '4px 8px',
                    opacity: currentProjectIndex <= 0 ? 0.3 : 1,
                    cursor: currentProjectIndex <= 0 ? 'default' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (currentProjectIndex > 0) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span
                  style={{
                    fontSize: 10,
                    color: '#666',
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.05em',
                  }}
                >
                  {currentProjectIndex + 1} / {topProjects.length} top projects
                </span>
                <button
                  onClick={() => navigateProject(1)}
                  disabled={currentProjectIndex >= topProjects.length - 1}
                  style={{
                    ...buttonBase,
                    padding: '4px 8px',
                    opacity: currentProjectIndex >= topProjects.length - 1 ? 0.3 : 1,
                    cursor: currentProjectIndex >= topProjects.length - 1 ? 'default' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (currentProjectIndex < topProjects.length - 1) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={tabBarStyle}>
            <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
              Overview
            </button>
            <button style={tabStyle(activeTab === 'ai')} onClick={() => setActiveTab('ai')}>
              AI Insights
            </button>
          </div>

          {/* Content */}
          <div style={contentArea}>
            <AnimatePresence mode="wait">
              {activeTab === 'overview' ? renderOverviewTab() : renderAiTab()}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
