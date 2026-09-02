import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight, Github } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as const

interface Flagship {
  n: string
  name: string
  kind: string
  status: string
  url: string
  href: string
  github?: string
  tagline: string
  points: string[]
  stack: string[]
}

const projects: Flagship[] = [
  {
    n: '01',
    name: 'Verdantra',
    kind: 'ESG Reporting Automation Platform',
    status: 'Deployed · 2026 · Sole engineer',
    url: 'verdantra.in',
    href: 'https://verdantra.in',
    tagline:
      'ESG reporting is a structured-data problem in a document’s clothing. Collect once, report to many.',
    points: [
      'A canonical, framework-neutral metric store with a disclosure crosswalk — one data point maps to GRI, BRSR, ESRS/CSRD, SBTi and ISSB at once.',
      'A continuous gap-analysis engine scores coverage by E/S/G pillar, ranks findings blocking → minor, and holds publication on unresolved conflicts.',
      'A grounding layer so no number reaches a report without a file-and-page citation back to raw evidence — audit-readiness by construction.',
      'Vera, a voice agent, is the single interface: teaches the framework, collects by speech or upload, and resolves conflicts in any auto-detected language.',
    ],
    stack: ['MongoDB', 'Qdrant', 'Redis', 'BGE-M3', 'OpenAI', 'Cloudflare'],
  },
  {
    n: '02',
    name: 'Pinocchio',
    kind: 'Building-Energy Simulation Copilot',
    status: 'Deployed · 2026 · Sole engineer',
    url: 'pinocchio-app.vercel.app',
    href: 'https://pinocchio-app.vercel.app',
    tagline:
      'A real DOE-2.3 engine behind a copilot — answers come from actual simulation runs, not model recall.',
    points: [
      'optimize_to_target: a stacked real-engine optimizer that searches parameter sets against an energy target, collapsing the edit–run–read loop into one instruction.',
      'Parameter knobs and an equipment inventory trigger re-simulation on change; Results and Inventory dashboards render each run.',
      'A /train knowledge console ingests existing models so the copilot grounds answers in the firm’s own corpus, not generic assumptions.',
      'React + Vite SPA with a three.js landing on Vercel; Express + engine containerised on Fly.io; token-authenticated SSE streaming for chat.',
    ],
    stack: ['DOE-2.3', 'React / Vite', 'Three.js', 'Express', 'Fly.io', 'SSE / JWT'],
  },
]

function BrowserPreview({ url, href, name }: { url: string; href: string; name: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="browser-frame">
      <div className="browser-bar">
        <div className="browser-dots">
          <span style={{ background: '#e05a4d' }} />
          <span style={{ background: '#e0a020' }} />
          <span style={{ background: '#7cd11f' }} />
        </div>
        <a className="browser-url" href={href} target="_blank" rel="noopener noreferrer">
          <span className="live-dot" />
          {url}
        </a>
        <a className="browser-open" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} live`}>
          <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="browser-viewport">
        {!loaded && (
          <div className="browser-skel">
            <span className="mono-label">Booting live preview…</span>
          </div>
        )}
        <iframe
          src={href}
          title={`${name} — live preview`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
        {/* click-catcher so page scroll isn't hijacked; click to go live */}
        <a className="browser-catch" href={href} target="_blank" rel="noopener noreferrer">
          <span>Open live ↗</span>
        </a>
      </div>
    </div>
  )
}

function ProjectRow({ p, i }: { p: Flagship; i: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const flip = i % 2 === 1
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease }}
      className={`flagship-row${flip ? ' flip' : ''}`}
    >
      <div className="flagship-copy">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--indigo)' }}>{p.n}</span>
          <span className="mono-label" style={{ fontSize: 10.5 }}>{p.status}</span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(2.6rem, 5vw, 3.8rem)',
            lineHeight: 0.96,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}
        >
          {p.name}
        </h3>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 6, fontWeight: 500 }}>{p.kind}</p>

        <p
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.15rem, 1.8vw, 1.5rem)',
            lineHeight: 1.35,
            color: 'var(--ink)',
            margin: '26px 0 24px',
            maxWidth: '32ch',
          }}
        >
          {p.tagline}
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 26 }}>
          {p.points.map((pt, k) => (
            <li key={k} style={{ display: 'flex', gap: 12, fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
              <span
                style={{
                  flexShrink: 0,
                  marginTop: 8,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--indigo)',
                }}
              />
              {pt}
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 28 }}>
          {p.stack.map((s) => (
            <span key={s} className="pill">{s}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href={p.href} target="_blank" rel="noopener noreferrer">
            Visit live
            <ArrowUpRight size={16} />
          </a>
          {p.github && (
            <a className="btn btn-ghost" href={p.github} target="_blank" rel="noopener noreferrer">
              <Github size={15} /> Code
            </a>
          )}
        </div>
      </div>

      <div className="flagship-preview">
        <BrowserPreview url={p.url} href={p.href} name={p.name} />
      </div>
    </motion.article>
  )
}

export default function FlagshipProjects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section id="projects" className="section" ref={ref} style={{ background: 'var(--paper)' }}>
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 'clamp(48px, 7vw, 92px)' }}
        >
          <div className="sec-head">
            <span className="sec-index">/ deployed</span>
            <h2 className="sec-title">Automation platforms, <em>running live</em></h2>
          </div>
          <p className="sec-lead">
            Two end-to-end products I designed, built and deployed — embedded here as they run
            in production. Poke around, or open them in a new tab.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(80px, 11vw, 150px)' }}>
          {projects.map((p, i) => (
            <ProjectRow key={p.name} p={p} i={i} />
          ))}
        </div>
      </div>

      <style>{`
        .flagship-row {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.15fr);
          gap: clamp(32px, 5vw, 72px);
          align-items: center;
        }
        .flagship-row.flip .flagship-copy { order: 2; }
        .flagship-row.flip .flagship-preview { order: 1; }

        .browser-frame {
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 40px 90px -50px rgba(11,11,12,0.55), 0 8px 24px -16px rgba(11,11,12,0.3);
        }
        .browser-bar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 14px;
          background: var(--paper-2);
          border-bottom: 1px solid var(--line);
        }
        .browser-dots { display: flex; gap: 6px; }
        .browser-dots span { width: 11px; height: 11px; border-radius: 50%; display: block; }
        .browser-url {
          flex: 1;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-size: 12.5px;
          color: var(--ink-2);
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 100px;
          padding: 6px 14px;
          justify-content: center;
        }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--lime);
          box-shadow: 0 0 0 0 rgba(124,209,31,0.6);
          animation: livePulse 2s infinite;
        }
        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(124,209,31,0.5); }
          70% { box-shadow: 0 0 0 7px rgba(124,209,31,0); }
          100% { box-shadow: 0 0 0 0 rgba(124,209,31,0); }
        }
        .browser-open {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px; color: var(--ink-3);
          transition: background 0.2s, color 0.2s;
        }
        .browser-open:hover { background: var(--indigo-wash); color: var(--indigo-ink); }
        .browser-viewport {
          position: relative;
          aspect-ratio: 16 / 10.4;
          background: var(--paper-3);
        }
        .browser-viewport iframe {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          border: 0;
          background: #fff;
        }
        .browser-skel {
          position: absolute; inset: 0; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          background: repeating-linear-gradient(135deg, var(--paper-2), var(--paper-2) 12px, var(--paper-3) 12px, var(--paper-3) 24px);
        }
        .browser-catch {
          position: absolute; inset: 0; z-index: 2;
          display: flex; align-items: flex-end; justify-content: flex-end;
          padding: 16px;
          opacity: 0;
          background: linear-gradient(180deg, rgba(11,11,12,0) 55%, rgba(11,11,12,0.28) 100%);
          transition: opacity 0.3s var(--ease-out-expo);
        }
        .browser-catch span {
          font-family: var(--mono); font-size: 12px; font-weight: 500;
          color: #fff; background: var(--indigo);
          padding: 8px 14px; border-radius: 100px;
          box-shadow: 0 10px 24px -8px rgba(75,59,255,0.7);
        }
        .browser-frame:hover .browser-catch { opacity: 1; }

        @media (max-width: 900px) {
          .flagship-row { grid-template-columns: 1fr; gap: 34px; }
          .flagship-row.flip .flagship-copy { order: 1; }
          .flagship-row.flip .flagship-preview { order: 2; }
          .flagship-preview { order: 2; }
          .flagship-copy { order: 1; }
        }
      `}</style>
    </section>
  )
}
