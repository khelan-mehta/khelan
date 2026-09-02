import { motion } from 'framer-motion'
import { ArrowDown, MessageSquare, Network, FileText } from 'lucide-react'
import HeroScene from './HeroScene'

interface HeroProps {
  onTalkClick: () => void
  onGraphClick: () => void
}

const ease = [0.16, 1, 0.3, 1] as const

const marquee = [
  'RAG', 'Agentic Pipelines', 'BGE-M3', 'Qdrant', 'DOE-2.3', 'GRI · BRSR · ESRS',
  'Hallucination Control', 'LEED AP BD+C', 'FastAPI', 'React', 'Fly.io', 'Vercel',
  'eQUEST', 'Provenance & Citations', 'Voice Agents',
]

export default function Hero({ onTalkClick, onGraphClick }: HeroProps) {
  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--paper)',
      }}
    >
      {/* 3D energy core */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          // bias right on wide screens so it sits beside the wordmark
          maskImage: 'radial-gradient(120% 100% at 65% 45%, #000 55%, transparent 100%)',
        }}
        aria-hidden
      >
        <HeroScene />
      </div>

      {/* corner telemetry */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="hero-telemetry"
        style={{
          position: 'absolute',
          top: 'clamp(88px, 12vh, 130px)',
          left: 'clamp(24px, 5vw, 56px)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <span className="mono-label" style={{ color: 'var(--indigo)' }}>
          ● Available · 2026
        </span>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.06em',
            color: 'var(--ink-4)',
          }}
        >
          21.17°N, 72.83°E — Surat, IN
        </span>
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        <div style={{ maxWidth: 900 }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}
          >
            <span className="mono-label">AI Engineer</span>
            <span style={{ width: 28, height: 1, background: 'var(--line-strong)' }} />
            <span className="mono-label">Sustainability Automation</span>
          </motion.div>

          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 400,
              fontSize: 'clamp(4rem, 15vw, 12.5rem)',
              lineHeight: 0.84,
              letterSpacing: '-0.035em',
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            <motion.span
              style={{ display: 'block' }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1, ease }}
            >
              Khelan
            </motion.span>
            <motion.span
              style={{ display: 'block', fontStyle: 'italic', color: 'var(--indigo)' }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.24, ease }}
            >
              Mehta
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease }}
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.28rem)',
              lineHeight: 1.6,
              color: 'var(--ink-2)',
              maxWidth: '46ch',
              marginTop: 34,
            }}
          >
            I ship production LLM systems — and understand the sustainability
            reporting they have to serve. RAG, agentic pipelines, and grounded
            generation with page-cited provenance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.66, ease }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 40 }}
          >
            <button className="btn btn-primary" onClick={onTalkClick}>
              <MessageSquare size={16} strokeWidth={2} />
              Talk to my AI
            </button>
            <button className="btn btn-ghost" onClick={onGraphClick}>
              <Network size={16} strokeWidth={2} />
              Explore the graph
            </button>
            <a className="btn btn-ghost" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              <FileText size={16} strokeWidth={2} />
              Résumé
            </a>
          </motion.div>
        </div>
      </div>

      {/* marquee ribbon */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          borderTop: '1px solid var(--line)',
          background: 'rgba(245,244,239,0.72)',
          backdropFilter: 'blur(6px)',
          overflow: 'hidden',
          padding: '13px 0',
        }}
      >
        <div className="hero-marquee-track">
          {[...marquee, ...marquee].map((m, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                letterSpacing: '0.02em',
                color: 'var(--ink-3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 26,
                paddingRight: 26,
              }}
            >
              {m}
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--indigo)' }} />
            </span>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="hero-scroll-cue"
        style={{
          position: 'absolute',
          bottom: 66,
          right: 'clamp(24px, 5vw, 56px)',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span className="mono-label" style={{ fontSize: 10 }}>Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}>
          <ArrowDown size={15} color="var(--ink-3)" />
        </motion.div>
      </motion.div>

      <style>{`
        .hero-marquee-track {
          display: inline-flex;
          white-space: nowrap;
          animation: heroMarquee 34s linear infinite;
          will-change: transform;
        }
        @keyframes heroMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (max-width: 640px) {
          .hero-telemetry { display: none !important; }
          .hero-scroll-cue { display: none !important; }
        }
      `}</style>
    </section>
  )
}
