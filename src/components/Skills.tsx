import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

const categories = [
  {
    id: 'A',
    title: 'AI / LLM',
    items: [
      'RAG (chunking · hybrid retrieval · reranking · eval)',
      'Agentic & multi-step pipelines',
      'Tool / function calling',
      'Hallucination detection',
      'Grounding & citation provenance',
      'FAISS · Qdrant',
      'Embeddings (BGE-M3)',
      'Voice agents',
      'TensorFlow · PyTorch · scikit-learn',
    ],
  },
  {
    id: 'B',
    title: 'ESG & Reporting',
    items: [
      'ESG KPI tracking',
      'Disclosure-framework mapping & crosswalks',
      'GRI · BRSR · ESRS-CSRD · SBTi · ISSB',
      'Materiality assessment',
      'Carbon accounting & GHG reconciliation',
      'LCA',
      'Gap analysis & audit-readiness',
      'ESG dashboarding',
    ],
  },
  {
    id: 'C',
    title: 'Energy Modeling',
    items: [
      'eQUEST · DOE-2.3',
      'IES VE · TRACE 3D Plus',
      'EnergyPlus',
      'ASHRAE 90.1 · Title 24',
      'LEED BD+C & O+M',
      'Revit · Rhino / Grasshopper',
      'gbXML',
    ],
  },
  {
    id: 'D',
    title: 'Engineering',
    items: [
      'Python · FastAPI · Flask',
      'TypeScript · Node · Express',
      'React · Next.js',
      'PostgreSQL · MongoDB · Redis',
      'Docker · Fly.io · Vercel · Cloudflare',
      'REST / OpenAPI · SSE',
      'JWT auth · OWASP · Git',
    ],
  },
]

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" className="section" ref={ref} style={{ background: 'var(--paper-2)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}
        >
          <div className="sec-head">
            <span className="sec-index">/ stack</span>
            <h2 className="sec-title">What I reach for</h2>
          </div>
        </motion.div>

        <div className="skills-grid">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="skill-col"
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--indigo)' }}>{cat.id}</span>
                <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                  {cat.title}
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
                {cat.items.map((it) => (
                  <li
                    key={it}
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: 'var(--ink-2)',
                      padding: '9px 0',
                      borderTop: '1px solid var(--line-2)',
                    }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(24px, 3vw, 44px);
        }
        @media (max-width: 900px) { .skills-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; } }
        @media (max-width: 480px) { .skills-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  )
}
