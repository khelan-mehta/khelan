import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../stores/graphStore';

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

const NODE_DOT_SHADES: Record<string, string> = {
  person: '#ffffff',
  skill: '#d4d4d4',
  project: '#e8e8e8',
  language: '#a3a3a3',
  certification: '#c0c0c0',
  company: '#b0b0b0',
  education: '#bfbfbf',
  repo: '#999999',
  domain: '#aaaaaa',
  tool: '#888888',
};

const panelStyle: React.CSSProperties = {
  background: 'rgba(10,10,10,0.9)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
};

const monoText: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  color: '#ccc',
  letterSpacing: '0.03em',
};

const headerBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px 6px',
  fontFamily: 'monospace',
  fontSize: 10,
  color: '#666',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

export default function GraphLegend() {
  const { nodes, edges, filterTypes, setFilterTypes, zoom, selectedNode, selectNode } = useGraphStore();

  const [reposOpen, setReposOpen] = useState(true);
  const [legendOpen, setLegendOpen] = useState(true);

  // Connection count per node
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    edges.forEach((e: any) => {
      counts[e.source] = (counts[e.source] || 0) + 1;
      counts[e.target] = (counts[e.target] || 0) + 1;
    });
    return counts;
  }, [edges]);

  // Top 6 repos sorted by admin rank then weight
  const topRepos = useMemo(() => {
    const repos = nodes.filter((n: any) => n.type === 'repo');
    return repos
      .sort((a: any, b: any) => {
        const rankA = a._adminRank ?? Infinity;
        const rankB = b._adminRank ?? Infinity;
        if (rankA !== rankB) return rankA - rankB;
        return (b.weight || 0) - (a.weight || 0);
      })
      .slice(0, 6);
  }, [nodes]);

  // Type counts sorted desc
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach((n: any) => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));
  }, [nodes]);

  // Visible node count (after filters)
  const visibleCount = useMemo(() => {
    if (filterTypes.length === 0) return nodes.length;
    return nodes.filter((n: any) => !filterTypes.includes(n.type)).length;
  }, [nodes, filterTypes]);

  const handleToggleType = useCallback(
    (type: string) => {
      if (filterTypes.includes(type)) {
        setFilterTypes(filterTypes.filter((t) => t !== type));
      } else {
        setFilterTypes([...filterTypes, type]);
      }
    },
    [filterTypes, setFilterTypes]
  );

  const handleDoubleClickType = useCallback(
    (type: string) => {
      // Focus only on this type + person: hide everything else
      const allTypes = typeCounts.map((t) => t.type);
      const toHide = allTypes.filter((t) => t !== type && t !== 'person');
      setFilterTypes(toHide);
    },
    [typeCounts, setFilterTypes]
  );

  const handleShowAll = useCallback(() => {
    setFilterTypes([]);
  }, [setFilterTypes]);

  const handleRepoClick = useCallback(
    (repoNode: any) => {
      selectNode(selectedNode?.id === repoNode.id ? null : repoNode);
    },
    [selectNode, selectedNode]
  );

  const handleZoomReset = useCallback(() => {
    zoom('reset');
    selectNode(null);
  }, [zoom, selectNode]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 30,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: 220,
      }}
    >
      {/* Quick Stats - selected node pill */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              ...panelStyle,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: NODE_DOT_SHADES[selectedNode.type] || '#999',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                ...monoText,
                fontSize: 11,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {selectedNode.label}
            </span>
            <button
              onClick={() => selectNode(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                padding: '0 2px',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Repos Panel */}
      <div style={{ ...panelStyle, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px 6px',
            borderBottom: reposOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#666',
            }}
          >
            Top Repos
          </span>
          <button onClick={() => setReposOpen(!reposOpen)} style={headerBtn}>
            {reposOpen ? '−' : '+'}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {reposOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '4px 0' }}>
                {topRepos.map((repo: any, idx: number) => {
                  const isSelected = selectedNode?.id === repo.id;
                  const connCount = connectionCounts[repo.id] || 0;
                  return (
                    <button
                      key={repo.id}
                      onClick={() => handleRepoClick(repo)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '5px 12px',
                        background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          color: '#555',
                          width: 14,
                          textAlign: 'right',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: isSelected ? '#fff' : '#999',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          ...monoText,
                          fontSize: 10,
                          color: isSelected ? '#fff' : '#bbb',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {repo.label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          color: '#555',
                          flexShrink: 0,
                        }}
                      >
                        {connCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Panel */}
      <div style={{ ...panelStyle, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px 6px',
            borderBottom: legendOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#666',
            }}
          >
            Legend
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {filterTypes.length > 0 && (
              <button
                onClick={handleShowAll}
                style={{
                  ...headerBtn,
                  color: '#999',
                  fontSize: 9,
                }}
              >
                Show All
              </button>
            )}
            <button onClick={() => setLegendOpen(!legendOpen)} style={headerBtn}>
              {legendOpen ? '−' : '+'}
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {legendOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '4px 0' }}>
                {typeCounts.map(({ type, count }) => {
                  const isHidden = filterTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleToggleType(type)}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        handleDoubleClickType(type);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '5px 12px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        opacity: isHidden ? 0.35 : 1,
                        transition: 'opacity 0.15s, background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: NODE_DOT_SHADES[type] || '#999',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          ...monoText,
                          fontSize: 10,
                          color: isHidden ? '#666' : '#ccc',
                          textDecoration: isHidden ? 'line-through' : 'none',
                          flex: 1,
                        }}
                      >
                        {NODE_TYPE_LABELS[type] || type}
                      </span>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          color: '#555',
                          flexShrink: 0,
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div
                style={{
                  padding: '6px 12px 8px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    color: '#555',
                  }}
                >
                  {visibleCount} / {nodes.length} visible
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zoom Controls */}
      <div
        style={{
          ...panelStyle,
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          overflow: 'hidden',
          width: 'fit-content',
        }}
      >
        {[
          { label: '+', action: () => zoom('in') },
          { label: '−', action: () => zoom('out') },
          { label: '⟳', action: handleZoomReset },
        ].map(({ label, action }, idx) => (
          <button
            key={label}
            onClick={action}
            style={{
              width: 36,
              height: 34,
              background: 'transparent',
              border: 'none',
              borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 16,
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#999';
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
