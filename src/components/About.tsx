import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { value: '3+', label: 'Years' },
  { value: 'LEED', label: 'Certified' },
  { value: '8.12', label: 'CGPA' },
  { value: '20+', label: 'Projects' },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="section" ref={ref} style={{ background: '#000' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <span className="section-label">01 — About</span>
          <h2 className="section-title">Building a sustainable future</h2>
          <p className="section-subtitle" style={{ marginBottom: 64 }}>
            Software engineer bridging sustainability consulting and modern
            engineering with AI-driven solutions for the built environment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#000',
                padding: '40px 0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  marginBottom: 6,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 400,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          style={{
            marginTop: 64,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 48,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 16,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              What I Do
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              From energy simulations to AI-powered analytics, I build tools
              that make buildings smarter and greener. Full-stack engineering
              meets sustainability domain expertise.
            </p>
          </div>
          <div>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 16,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              My Approach
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              Data-driven and design-conscious. Great software should be both
              functional and beautiful — solving real problems while providing
              seamless experiences.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
