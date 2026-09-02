import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

const wins = [
  {
    rank: '2nd',
    scale: '/ 2,200+ teams',
    event: 'IEEE Tic Tech Toe 2026',
    note: '1st in track',
    project: 'Skilleton',
    desc: 'A two-layer workforce-intelligence system scraping India’s live job market into city-matched reskilling paths. Owned platform & DevOps — Express backend, JWT-auth public REST API across 12 route namespaces, Docker Compose, OpenAPI docs.',
  },
  {
    rank: '1st',
    scale: '',
    event: 'IEEE DSC 2.0 — Hallucination Detection Challenge',
    note: '',
    project: 'HalluciNot',
    desc: 'A Flask pipeline detecting and mitigating hallucinations in LLM output — the exact failure mode that makes RAG unusable in audit contexts.',
  },
  {
    rank: '1st',
    scale: '',
    event: 'Mitraroop Startup Hackathon 2026',
    note: '',
    project: 'NoteNex',
    desc: 'An AI notes platform with smart summarization, tagging and knowledge organization.',
  },
  {
    rank: '1st',
    scale: '',
    event: 'GDG Techsprint 2025',
    note: '',
    project: 'Cookie',
    desc: 'A real-time animal emergency response platform matching rescuers to urgent cases.',
  },
  {
    rank: '4th',
    scale: '/ 1,600+ teams',
    event: 'HackaMined 2026 · CSI Nirma University',
    note: '1st in track, across 150+ universities',
    project: '',
    desc: '',
  },
]

export default function Wins() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-90px' })

  return (
    <section id="wins" className="section" ref={ref} style={{ background: 'var(--paper-2)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 'clamp(34px, 4vw, 54px)' }}
        >
          <div className="sec-head">
            <span className="sec-index">/ competitive</span>
            <h2 className="sec-title">Five+ national wins</h2>
          </div>
          <p className="sec-lead">
            I build fastest under a clock. A selection of what came out of it.
          </p>
        </motion.div>

        <div style={{ borderTop: '1px solid var(--line)' }}>
          {wins.map((w, i) => (
            <motion.div
              key={w.event}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.07, ease }}
              className="win-row"
            >
              <div className="win-rank">
                <span className="win-rank-n">{w.rank}</span>
                {w.scale && <span className="win-rank-s">{w.scale}</span>}
              </div>
              <div className="win-body">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  {w.project && <h3 className="win-project">{w.project}</h3>}
                  <span className="win-event">{w.event}</span>
                </div>
                {w.note && <span className="win-note">{w.note}</span>}
                {w.desc && <p className="win-desc">{w.desc}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .win-row {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 28px;
          padding: clamp(24px, 3vw, 38px) 0;
          border-bottom: 1px solid var(--line);
          align-items: start;
        }
        .win-rank { display: flex; flex-direction: column; }
        .win-rank-n {
          font-family: var(--serif); font-style: italic;
          font-size: clamp(2.2rem, 4vw, 3rem); line-height: 0.9;
          color: var(--indigo); letter-spacing: -0.02em;
        }
        .win-rank-s { font-family: var(--mono); font-size: 11.5px; color: var(--ink-4); margin-top: 4px; }
        .win-project {
          font-family: var(--serif); font-weight: 400; font-size: 1.7rem;
          letter-spacing: -0.015em; color: var(--ink);
        }
        .win-event { font-size: 14px; font-weight: 500; color: var(--ink-2); }
        .win-note {
          display: inline-block; margin-top: 8px;
          font-family: var(--mono); font-size: 11.5px; letter-spacing: 0.02em;
          color: var(--indigo-ink); background: var(--indigo-wash);
          padding: 3px 10px; border-radius: 100px;
        }
        .win-desc { font-size: 14px; line-height: 1.65; color: var(--ink-3); max-width: 62ch; margin-top: 14px; }
        @media (max-width: 640px) {
          .win-row { grid-template-columns: 1fr; gap: 12px; }
          .win-rank { flex-direction: row; align-items: baseline; gap: 10px; }
        }
      `}</style>
    </section>
  )
}
