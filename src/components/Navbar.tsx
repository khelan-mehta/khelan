import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Wins', href: '#wins' },
  { label: 'Contact', href: '#contact' },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(24px, 5vw, 56px)',
          background: scrolled ? 'rgba(245,244,239,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px) saturate(1.4)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--line)' : 'transparent'}`,
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}
      >
        <a href="#top" aria-label="Home" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 100 100" aria-hidden>
            <rect width="100" height="100" rx="22" fill="#0b0b0c" />
            <path d="M35 24v52M35 50l26-26M35 50l28 26" stroke="#4b3bff" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--ink)' }}>
            KHELAN&nbsp;MEHTA
          </span>
        </a>

        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'var(--ink-3)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 18px',
              border: '1px solid var(--line-strong)',
              borderRadius: 100,
              color: 'var(--ink)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ink)'
              e.currentTarget.style.color = 'var(--paper)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--ink)'
            }}
          >
            Résumé
          </a>
        </div>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          style={{ display: 'none', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              zIndex: 999,
              background: 'rgba(245,244,239,0.97)',
              backdropFilter: 'blur(18px)',
              borderBottom: '1px solid var(--line)',
              padding: '20px clamp(24px, 5vw, 56px) 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              style={{ fontSize: 18, fontWeight: 500, color: 'var(--indigo)', padding: '12px 0' }}
            >
              Résumé ↗
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
