import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../stores/graphStore';
import GraphCanvas from './GraphCanvas';
import InsightsOverlay from './InsightsOverlay';
import NodeDetail from './NodeDetail';
import GraphLegend from './GraphLegend';
import GraphAdminModal from './GraphAdminModal';

export default function KnowledgeGraph({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { searchQuery, setSearchQuery } = useGraphStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, setSearchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000, background: '#080808', overflow: 'hidden',
          }}
        >
          {/* 3D Canvas */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <GraphCanvas />
          </div>

          {/* UI Layer */}
          <div style={{ position: 'relative', height: '100%', width: '100%', pointerEvents: 'none', zIndex: 20, display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{
              pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 32px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: '0 0 15px rgba(255,255,255,0.6)' }} />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#fff', margin: 0, lineHeight: 1 }}>Ecosystem</h3>
                  <p style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginTop: 4 }}>Interactive Knowledge Galaxy</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text" placeholder="Search..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 100, padding: '10px 16px 10px 40px', fontSize: 13, fontFamily: 'var(--font-mono)',
                      color: '#fff', outline: 'none',
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>

                <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#999', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.2em', opacity: 0.5 }}>Exit</span>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Overlays */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ pointerEvents: 'auto' }}>
                <GraphLegend />
                <InsightsOverlay />
                <NodeDetail />
                <GraphAdminModal />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
