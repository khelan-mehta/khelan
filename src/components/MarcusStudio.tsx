import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as const

const pillars = [
  {
    k: 'QA/QC',
    t: 'Model inconsistency dashboard',
    d: 'Flags contradictions in the energy model before human review ever begins.',
  },
  {
    k: 'MEPC',
    t: 'Compliance calculator auto-fill',
    d: 'Writes directly into the official USGBC Minimum Energy Performance templates, every entry citing its source.',
  },
  {
    k: 'RATES',
    t: 'Utility-rate intelligence',
    d: 'Auto-locates the project’s address and pulls electricity, gas, carbon and water figures from live databases — every number hyperlinked to its source.',
  },
  {
    k: 'SEARCH',
    t: 'AI search over the corpus',
    d: 'Ask the parsed model corpus a plain-English question; every answer cites the exact field and version it pulled the data from.',
  },
]

export default function MarcusStudio() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-90px' })

  return (
    <section
      className="section"
      ref={ref}
      style={{ background: 'var(--night)', color: 'var(--on-night)', position: 'relative' }}
    >
      {/* faint blueprint grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.5,
          backgroundImage:
            'linear-gradient(rgba(240,239,233,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(240,239,233,0.035) 1px, transparent 1px)',
          backgroundSize: '58px 58px',
          maskImage: 'linear-gradient(180deg, transparent, #000 20%, #000 80%, transparent)',
        }}
      />
      <div className="container-wide" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
            <span className="mono-label" style={{ color: 'var(--indigo-2)' }}>CannonDesign · Mumbai</span>
            <span style={{ width: 22, height: 1, background: 'var(--line-night)' }} />
            <span className="mono-label" style={{ color: 'var(--on-night-3)' }}>
              AI Engineer, Sustainability Automation · May–Jul 2026
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 400,
              fontSize: 'clamp(2.6rem, 6.5vw, 5rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.02em',
              color: 'var(--on-night)',
              maxWidth: '18ch',
            }}
          >
            The Marcus Studio — <em style={{ fontStyle: 'italic', color: 'var(--indigo-2)' }}>weeks of data
            entry, into seconds</em>
          </h2>
        </motion.div>

        {/* headline stat + story */}
        <div className="marcus-lead">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="marcus-stat"
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span className="marcus-big">80h</span>
              <ArrowRight size={30} color="var(--indigo-2)" strokeWidth={2.5} />
              <span className="marcus-big" style={{ color: 'var(--indigo-2)' }}>~2h</span>
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 12.5, letterSpacing: '0.06em', color: 'var(--on-night-3)', marginTop: 10 }}>
              BIM-TO-DOCUMENTATION, PER PROJECT
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.18, ease }}
            style={{ maxWidth: '54ch' }}
          >
            <p style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.35rem)', lineHeight: 1.6, color: 'var(--on-night)' }}>
              Energy simulations spit out hundreds of pages of raw text. The old way: hand-type ~130
              metrics into Excel and LEED calculators, then pay a second person to double-check for
              catastrophic human error. I architected a full-stack AI platform that reads the files
              instead.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--on-night-2)', marginTop: 20 }}>
              A universal parser ingests eQUEST, TRACE 3D Plus and IES-VE outputs — <span style={{ fontFamily: 'var(--mono)', color: 'var(--on-night)', fontSize: 13.5 }}>.SIM / .inp / gbXML</span> — into one
              unified schema, then grounds LLM generation into structured LEED documentation with
              traceability back to source. Co-presented internally with my manager.
            </p>
          </motion.div>
        </div>

        {/* parser flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.24, ease }}
          className="marcus-flow"
        >
          {['eQUEST', 'TRACE 3D Plus', 'IES-VE'].map((s) => (
            <span key={s} className="flow-chip">{s}</span>
          ))}
          <ArrowRight size={16} color="var(--on-night-3)" />
          <span className="flow-chip flow-core">Unified schema</span>
          <ArrowRight size={16} color="var(--on-night-3)" />
          <span className="flow-chip flow-out">130 structured columns</span>
        </motion.div>

        {/* four pillars */}
        <div className="marcus-pillars">
          {pillars.map((p, i) => (
            <motion.div
              key={p.k}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.08, ease }}
              className="pillar"
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--indigo-2)' }}>
                {p.k}
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-night)', margin: '12px 0 10px', letterSpacing: '-0.01em' }}>
                {p.t}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--on-night-2)' }}>{p.d}</p>
            </motion.div>
          ))}
        </div>

        {/* deck figure */}
        <motion.figure
          initial={{ opacity: 0, y: 26 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.4, ease }}
          className="marcus-figure"
        >
          <img src="/marcus/steps.png" alt="Marcus Studio — hours of work distilled into a nine-step pipeline" loading="lazy" />
          <figcaption>
            <span className="mono-label" style={{ color: 'var(--on-night-3)' }}>Fig. 01</span>
            From the internal deck — the nine-step pipeline, sign-in to auto-filled LEED MEPC.
          </figcaption>
        </motion.figure>
      </div>

      <style>{`
        .marcus-lead {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: clamp(32px, 6vw, 80px);
          align-items: start;
          margin-top: clamp(44px, 6vw, 76px);
          padding-top: clamp(44px, 6vw, 76px);
          border-top: 1px solid var(--line-night);
        }
        .marcus-big {
          font-family: var(--serif);
          font-size: clamp(3.4rem, 9vw, 7rem);
          line-height: 0.9;
          letter-spacing: -0.03em;
          color: var(--on-night);
        }
        .marcus-flow {
          display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
          margin-top: clamp(40px, 5vw, 64px);
        }
        .flow-chip {
          font-family: var(--mono); font-size: 12.5px;
          padding: 8px 14px; border-radius: 100px;
          border: 1px solid var(--line-night); color: var(--on-night-2);
        }
        .flow-core { border-color: var(--line-night); background: var(--night-3); color: var(--on-night); }
        .flow-out { border-color: var(--indigo-line); background: rgba(75,59,255,0.14); color: var(--indigo-2); }
        .marcus-pillars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--line-night);
          margin-top: clamp(52px, 7vw, 88px);
          border: 1px solid var(--line-night);
        }
        .pillar { background: var(--night); padding: 30px 26px; }
        .marcus-figure {
          margin-top: clamp(52px, 7vw, 88px);
          border: 1px solid var(--line-night);
          border-radius: 12px;
          overflow: hidden;
          background: var(--night-2);
        }
        .marcus-figure img { width: 100%; display: block; }
        .marcus-figure figcaption {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          font-size: 13px; color: var(--on-night-2);
          border-top: 1px solid var(--line-night);
        }
        @media (max-width: 860px) {
          .marcus-pillars { grid-template-columns: repeat(2, 1fr); }
          .marcus-lead { grid-template-columns: 1fr; gap: 30px; }
        }
        @media (max-width: 520px) {
          .marcus-pillars { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
