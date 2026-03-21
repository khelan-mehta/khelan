import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGraphStore } from '../../stores/graphStore';

interface InsightCard {
  category: string;
  text: string;
  action?: string;
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(10,10,10,0.8)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '12px 16px',
  maxWidth: 240,
};

export default function InsightsOverlay() {
  const { nodes, edges, selectedNode, fetchScrapedRepos, scrapedRepos } = useGraphStore();

  useEffect(() => {
    fetchScrapedRepos();
  }, [fetchScrapedRepos]);

  const insights = useMemo(() => {
    const cards: InsightCard[] = [];

    // 1. GRAPH DENSITY
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const maxEdges = nodeCount > 1 ? (nodeCount * (nodeCount - 1)) / 2 : 1;
    const density = ((edgeCount / maxEdges) * 100).toFixed(1);
    cards.push({
      category: 'Graph Density',
      text: `${nodeCount} nodes, ${edgeCount} edges`,
      action: `${density}% density`,
    });

    // 2. TECH STACK
    const languages = nodes.filter((n: any) => n.type === 'language');
    const tools = nodes.filter((n: any) => n.type === 'tool');
    if (languages.length > 0 || tools.length > 0) {
      const topLangs = languages
        .sort((a: any, b: any) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 3)
        .map((n: any) => n.label);
      const langStr = topLangs.length > 0 ? topLangs.join(', ') : 'None';
      cards.push({
        category: 'Tech Stack',
        text: langStr,
        action: `${tools.length} tool${tools.length !== 1 ? 's' : ''} tracked`,
      });
    }

    // 3. PORTFOLIO
    const repos = nodes.filter((n: any) => n.type === 'repo');
    if (repos.length > 0) {
      const weights = repos.map((r: any) => r.weight || 0);
      const avgWeight = (weights.reduce((s: number, w: number) => s + w, 0) / weights.length).toFixed(1);
      const highImpact = repos.filter((r: any) => (r.weight || 0) >= 7).length;
      cards.push({
        category: 'Portfolio',
        text: `${repos.length} repositories`,
        action: `avg weight ${avgWeight} · ${highImpact} high-impact`,
      });
    }

    // 4. RAG DATA
    if (scrapedRepos.length > 0) {
      const totalChunks = scrapedRepos.reduce((s, r) => s + (r.chunkCount || 0), 0);
      const uniqueLangs = new Set<string>();
      scrapedRepos.forEach((r) => r.languages?.forEach((l) => uniqueLangs.add(l)));
      cards.push({
        category: 'RAG Data',
        text: `${scrapedRepos.length} scraped repo${scrapedRepos.length !== 1 ? 's' : ''}`,
        action: `${totalChunks} chunks · ${uniqueLangs.size} language${uniqueLangs.size !== 1 ? 's' : ''}`,
      });
    }

    // 5. DOMAIN FOCUS
    const domains = nodes.filter((n: any) => n.type === 'domain');
    if (domains.length > 0) {
      const domainConns: Record<string, number> = {};
      domains.forEach((d: any) => {
        domainConns[d.id] = edges.filter(
          (e: any) => e.source === d.id || e.target === d.id
        ).length;
      });
      const topDomain = domains.reduce((best: any, d: any) =>
        (domainConns[d.id] || 0) > (domainConns[best.id] || 0) ? d : best
      , domains[0]);
      if (topDomain) {
        cards.push({
          category: 'Domain Focus',
          text: topDomain.label,
          action: `${domainConns[topDomain.id]} connections`,
        });
      }
    }

    // 6. CORE STRENGTH
    const skills = nodes.filter((n: any) => n.type === 'skill');
    if (skills.length > 0) {
      const topSkill = skills.reduce((best: any, s: any) =>
        (s.weight || 0) > (best.weight || 0) ? s : best
      , skills[0]);
      if (topSkill) {
        cards.push({
          category: 'Core Strength',
          text: topSkill.label,
          action: `weight ${topSkill.weight}/10`,
        });
      }
    }

    // 7. HUB NODE
    const nonPersonNodes = nodes.filter((n: any) => n.type !== 'person');
    if (nonPersonNodes.length > 0) {
      const connCounts: Record<string, number> = {};
      edges.forEach((e: any) => {
        connCounts[e.source] = (connCounts[e.source] || 0) + 1;
        connCounts[e.target] = (connCounts[e.target] || 0) + 1;
      });
      const hubNode = nonPersonNodes.reduce((best: any, n: any) =>
        (connCounts[n.id] || 0) > (connCounts[best.id] || 0) ? n : best
      , nonPersonNodes[0]);
      if (hubNode) {
        cards.push({
          category: 'Hub Node',
          text: hubNode.label,
          action: `${connCounts[hubNode.id] || 0} connections`,
        });
      }
    }

    return cards.slice(0, 6);
  }, [nodes, edges, scrapedRepos]);

  // Hide when a node is selected
  if (selectedNode) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 30,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Hide on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .insights-overlay-container { display: none !important; }
        }
      `}</style>
      <div className="insights-overlay-container" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.category}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, -3, 0],
            }}
            transition={{
              opacity: { duration: 0.4, delay: idx * 0.08 },
              x: { duration: 0.4, delay: idx * 0.08 },
              y: {
                duration: 3 + idx * 0.4,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: idx * 0.5,
              },
            }}
            style={cardStyle}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 8,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#666',
                marginBottom: 5,
              }}
            >
              {insight.category}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#e0e0e0',
                lineHeight: 1.4,
              }}
            >
              {insight.text}
            </div>
            {insight.action && (
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#888',
                  marginTop: 4,
                }}
              >
                {insight.action}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
