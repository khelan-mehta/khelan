import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

const contactLinks = [
  {
    label: 'Email',
    value: 'khelan.mehta@gmail.com',
    href: 'mailto:khelan.mehta@gmail.com',
  },
  {
    label: 'GitHub',
    value: 'github.com/khelan-mehta',
    href: 'https://github.com/khelan-mehta',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/khelan-mehta',
    href: 'https://linkedin.com/in/khelan-mehta',
  },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="contact" className="section" ref={ref} style={{ background: '#000' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 48 }}
        >
          <span className="section-label">06 — Contact</span>
          <h2 className="section-title">Let's connect</h2>
          <p className="section-subtitle">
            Open to opportunities in sustainability tech, energy analytics, and
            full-stack development.
          </p>
        </motion.div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {contactLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.08 * i, ease }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
                transition: 'padding-left 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.paddingLeft = '16px'
                const arrow = e.currentTarget.querySelector(
                  '.contact-arrow'
                ) as HTMLElement
                if (arrow) arrow.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.paddingLeft = '0'
                const arrow = e.currentTarget.querySelector(
                  '.contact-arrow'
                ) as HTMLElement
                if (arrow) arrow.style.opacity = '0.25'
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    color: '#fff',
                    fontWeight: 400,
                  }}
                >
                  {link.value}
                </span>
              </div>
              <ArrowUpRight
                className="contact-arrow"
                size={16}
                color="#fff"
                style={{ opacity: 0.25, transition: 'opacity 0.3s ease' }}
              />
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: 100,
            paddingTop: 40,
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'rgba(255,255,255,0.12)',
              letterSpacing: '0.04em',
            }}
          >
            Designed & built by Khelan Mehta
          </p>
        </motion.div>
      </div>
    </section>
  )
}
