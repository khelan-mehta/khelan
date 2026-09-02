import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

const certs = [
  { name: 'LEED AP Building Design + Construction', org: 'USGBC', date: 'Dec 2025' },
  { name: 'LEED Green Associate', org: 'USGBC', date: 'Aug 2025' },
  { name: 'CSRD Fundamentals — Level 1', org: 'CSRD Institute', date: 'Sep 2025' },
  { name: 'ESG Performance Measurement', org: 'Alison', date: 'Sep 2025' },
  { name: 'Life Cycle Assessment (Beginner)', org: 'Ecochain', date: 'Sep 2025' },
]

const education = [
  {
    degree: 'B.Tech, Electronics & Communication',
    school: 'Nirma University, Ahmedabad',
    period: '2022 – 2026',
    detail: 'CGPA 8.12 / 10 · DSA · Machine Learning · Computer Networks · OS',
  },
  {
    degree: 'Higher Secondary (CBSE)',
    school: 'Essar International School, Surat',
    period: '2020 – 2022',
    detail: '91.6% · JEE Mains 93.53 percentile',
  },
]

export default function Certifications() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="credentials" className="section" ref={ref} style={{ background: 'var(--paper)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 'clamp(36px, 5vw, 60px)' }}
        >
          <div className="sec-head">
            <span className="sec-index">/ credentials</span>
            <h2 className="sec-title">Certified &amp; schooled</h2>
          </div>
        </motion.div>

        <div className="cred-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease }}
          >
            <span className="mono-label" style={{ display: 'block', marginBottom: 18 }}>Certifications</span>
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {certs.map((c) => (
                <div key={c.name} className="cred-row">
                  <div>
                    <span className="cred-name">{c.name}</span>
                    <span className="cred-org">{c.org}</span>
                  </div>
                  <span className="cred-date">{c.date}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <span className="mono-label" style={{ display: 'block', marginBottom: 18 }}>Education</span>
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {education.map((e) => (
                <div key={e.degree} className="cred-row" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <span className="cred-name">{e.degree}</span>
                    <span className="cred-org">{e.school}</span>
                    <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5, maxWidth: '34ch' }}>
                      {e.detail}
                    </p>
                  </div>
                  <span className="cred-date">{e.period}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .cred-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px, 5vw, 72px);
        }
        .cred-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid var(--line);
        }
        .cred-name { display: block; font-size: 15px; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
        .cred-org { display: block; font-size: 13px; color: var(--ink-3); margin-top: 3px; }
        .cred-date { font-family: var(--mono); font-size: 12px; color: var(--indigo); white-space: nowrap; flex-shrink: 0; }
        @media (max-width: 760px) { .cred-grid { grid-template-columns: 1fr; gap: 44px; } }
      `}</style>
    </section>
  )
}
