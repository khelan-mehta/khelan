import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

const ledger: [string, string][] = [
  ['National hackathon wins', '5+'],
  ['Best finish', '2nd / 2,200+ teams'],
  ['CannonDesign workflow', '80h → ~2h'],
  ['Credential', 'LEED AP BD+C'],
  ['B.Tech ECE · Nirma', 'CGPA 8.12 / 10'],
]

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="section" ref={ref} style={{ background: 'var(--paper)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <div className="sec-head">
            <span className="sec-index">/ about</span>
            <h2 className="sec-title">The short version</h2>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem, 3.4vw, 2.75rem)',
            lineHeight: 1.28,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            maxWidth: '22ch',
            marginTop: 52,
          }}
        >
          I build the tooling that removes manual reporting work — and I{' '}
          <em style={{ color: 'var(--indigo)' }}>understand the reporting</em> it has to serve.
        </motion.p>

        <div className="about-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-2)', marginBottom: 22, maxWidth: '52ch' }}>
              I’m an AI engineer who ships production LLM systems for sustainability. Hands-on across
              the full RAG stack — hybrid retrieval, reranking, agentic pipelines, evaluation and
              hallucination control — with a bias toward grounding every claim in a citation.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-3)', maxWidth: '52ch' }}>
              The domain isn’t incidental. I’m LEED AP BD+C, I’ve run building-energy audits and LEED
              baseline models, and I’ve reconciled one messy set of source data against GRI, BRSR,
              ESRS/CSRD, SBTi and ISSB without losing the thread from disclosure back to raw evidence.
              That’s the hard part — and it’s where I like to work.
            </p>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="about-ledger"
          >
            {ledger.map(([k, v]) => (
              <div key={k} className="ledger-row">
                <dt>{k}</dt>
                <span className="ledger-dots" aria-hidden />
                <dd>{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: clamp(32px, 6vw, 80px);
          margin-top: clamp(48px, 6vw, 80px);
          align-items: start;
        }
        .about-ledger {
          border-top: 1px solid var(--line);
        }
        .ledger-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 15px 0;
          border-bottom: 1px solid var(--line);
        }
        .ledger-row dt {
          font-size: 13.5px;
          color: var(--ink-3);
          white-space: nowrap;
        }
        .ledger-dots {
          flex: 1;
          border-bottom: 1px dotted var(--line-strong);
          transform: translateY(-3px);
        }
        .ledger-row dd {
          font-family: var(--mono);
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          white-space: nowrap;
        }
        @media (max-width: 820px) {
          .about-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
