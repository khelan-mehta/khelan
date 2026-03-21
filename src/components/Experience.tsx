import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const experiences = [
  {
    company: 'Ergo Energy',
    role: 'Software Engineer',
    period: '2023 — Present',
    description:
      'Leading development of energy analytics platform. Built ML models for building performance prediction and real-time monitoring dashboards.',
  },
  {
    company: 'IT Company Brown Ion',
    role: 'Full Stack Developer',
    period: '2022 — 2023',
    description:
      'Developed web applications and APIs for enterprise clients. Led migration of legacy systems to modern React/Node.js stack.',
  },
  {
    company: 'Admyre',
    role: 'Frontend Developer',
    period: '2021 — 2022',
    description:
      'Built responsive web interfaces and collaborated with design team on UI/UX improvements for consumer-facing products.',
  },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="experience"
      className="section"
      ref={ref}
      style={{ background: '#000' }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <span className="section-label">04 — Experience</span>
          <h2 className="section-title">Where I've worked</h2>
        </motion.div>

        <div style={{ marginTop: 12 }}>
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i, ease }}
              style={{
                padding: '36px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 32,
                alignItems: 'start',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: 4,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {exp.company}
                </h3>
                <span
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.35)',
                    display: 'block',
                    marginBottom: 14,
                  }}
                >
                  {exp.role}
                </span>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.25)',
                    maxWidth: 520,
                  }}
                >
                  {exp.description}
                </p>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  paddingTop: 4,
                }}
              >
                {exp.period}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
