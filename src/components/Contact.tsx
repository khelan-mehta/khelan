import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as const

const links = [
  { label: 'Email', value: 'khelan05@gmail.com', href: 'mailto:khelan05@gmail.com' },
  { label: 'Phone', value: '+91 75740 01711', href: 'tel:+917574001711' },
  { label: 'GitHub', value: 'github.com/khelan-mehta', href: 'https://github.com/khelan-mehta' },
  { label: 'LinkedIn', value: 'linkedin.com/in/khelanmehta', href: 'https://linkedin.com/in/khelanmehta' },
]

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-90px' })

  return (
    <section
      id="contact"
      className="section"
      ref={ref}
      style={{ background: 'var(--night)', color: 'var(--on-night)' }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }}
        >
          <span className="mono-label" style={{ color: 'var(--indigo-2)' }}>/ contact</span>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 400,
              fontSize: 'clamp(3rem, 9vw, 7rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
              color: 'var(--on-night)',
              margin: '20px 0 12px',
            }}
          >
            Let’s build something that <em style={{ fontStyle: 'italic', color: 'var(--indigo-2)' }}>ships</em>.
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: 'var(--on-night-2)', maxWidth: '48ch' }}>
            Open to AI-engineering and sustainability-automation roles. The fastest way to reach me is
            email — or ask my AI anything, bottom-right.
          </p>
        </motion.div>

        <div className="contact-links">
          {links.map((l, i) => (
            <motion.a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.07, ease }}
              className="contact-row"
            >
              <div>
                <span className="contact-label">{l.label}</span>
                <span className="contact-value">{l.value}</span>
              </div>
              <ArrowUpRight size={20} className="contact-arrow" />
            </motion.a>
          ))}
        </div>

        <div className="contact-foot">
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--on-night-3)' }}>
            © 2026 Khelan Mehta · Designed &amp; built from scratch
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--on-night-3)' }}>
            khelanmehta.vercel.app
          </span>
        </div>
      </div>

      <style>{`
        .contact-links { margin-top: clamp(48px, 6vw, 84px); border-top: 1px solid var(--line-night); }
        .contact-row {
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
          padding: 26px 0; border-bottom: 1px solid var(--line-night);
          transition: transform 0.35s var(--ease-out-expo);
        }
        .contact-row:hover { transform: translateX(16px); }
        .contact-label {
          display: block; font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--on-night-3); margin-bottom: 7px;
        }
        .contact-value {
          font-family: var(--serif); font-size: clamp(1.4rem, 3vw, 2.1rem);
          color: var(--on-night); letter-spacing: -0.01em;
        }
        .contact-row:hover .contact-value { color: var(--indigo-2); }
        .contact-arrow { color: var(--on-night-3); transition: transform 0.35s var(--ease-out-expo), color 0.35s; flex-shrink: 0; }
        .contact-row:hover .contact-arrow { transform: translate(4px, -4px); color: var(--indigo-2); }
        .contact-foot {
          display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          margin-top: clamp(56px, 7vw, 90px);
        }
        @media (max-width: 520px) {
          .contact-value { font-size: 1.3rem; }
        }
      `}</style>
    </section>
  )
}
