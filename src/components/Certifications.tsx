import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const certifications = [
  { name: 'LEED AP BD+C', org: 'USGBC' },
  { name: 'LEED Green Associate', org: 'USGBC' },
  { name: 'ESG Certified', org: 'CFA Institute' },
  { name: 'Life Cycle Assessment', org: 'UNEP' },
  { name: 'CSRD Reporting', org: 'EU Standards' },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Certifications() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section" ref={ref} style={{ background: '#000' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <span className="section-label">05 — Credentials</span>
          <h2 className="section-title">Certifications</h2>
        </motion.div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 12,
          }}
        >
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.06 * i, ease }}
              style={{
                padding: '16px 24px',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 4,
                transition: 'border-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#fff',
                  display: 'block',
                  marginBottom: 3,
                }}
              >
                {cert.name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.2)',
                }}
              >
                {cert.org}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
