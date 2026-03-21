import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const categories = [
  {
    title: 'Energy Modeling',
    items: ['eQUEST', 'EnergyPlus', 'OpenStudio', 'TRACE 700', 'HAP'],
  },
  {
    title: 'Green Building',
    items: ['LEED BD+C', 'LEED O+M', 'GRIHA', 'IGBC', 'ECBC'],
  },
  {
    title: 'AI & ML',
    items: ['TensorFlow', 'PyTorch', 'scikit-learn', 'NLP', 'Computer Vision'],
  },
  {
    title: 'Development',
    items: ['React', 'TypeScript', 'Node.js', 'Python', 'Next.js'],
  },
  {
    title: 'Data & Analytics',
    items: ['PostgreSQL', 'MongoDB', 'Pandas', 'Power BI', 'D3.js'],
  },
  {
    title: 'Sustainability',
    items: ['LCA', 'ESG Reporting', 'Carbon Footprint', 'CSRD', 'GHG Protocol'],
  },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" className="section" ref={ref} style={{ background: '#000' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <span className="section-label">02 — Skills</span>
          <h2 className="section-title">Expertise</h2>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginTop: 8,
          }}
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i, ease }}
              style={{
                background: '#000',
                padding: '32px 28px',
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#fff',
                  marginBottom: 18,
                  letterSpacing: '-0.01em',
                }}
              >
                {cat.title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      padding: '4px 10px',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.35)',
                      borderRadius: 3,
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
