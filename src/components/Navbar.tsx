import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      setDark(window.scrollY > window.innerHeight * 0.65)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fg = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const fgHover = dark ? '#fff' : '#000'
  const logo = dark ? '#fff' : '#000'
  const bg = scrolled
    ? dark
      ? 'rgba(0,0,0,0.85)'
      : 'rgba(255,255,255,0.88)'
    : 'transparent'
  const border = scrolled
    ? dark
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.06)'
    : 'transparent'

  const btnBorder = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
  const btnColor = dark ? '#fff' : '#000'
  const btnHoverBg = dark ? '#fff' : '#000'
  const btnHoverColor = dark ? '#000' : '#fff'

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '0 48px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: bg,
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: `1px solid ${border}`,
          transition: 'all 0.5s ease',
        }}
      >
        <a
          href="#"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: logo,
            transition: 'color 0.5s ease',
          }}
        >
          KM
        </a>

        <div
          className="nav-links-desktop"
          style={{ display: 'flex', alignItems: 'center', gap: 32 }}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: fg,
                transition: 'color 0.25s ease',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = fgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = fg)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.03em',
              padding: '7px 18px',
              border: `1px solid ${btnBorder}`,
              borderRadius: 100,
              color: btnColor,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = btnHoverBg
              e.currentTarget.style.color = btnHoverColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = btnColor
            }}
          >
            Resume
          </a>
        </div>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            padding: 8,
            color: logo,
            transition: 'color 0.5s ease',
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed',
              top: 72,
              left: 0,
              right: 0,
              zIndex: 999,
              background: dark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: `1px solid ${border}`,
              padding: '24px 48px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              transition: 'background 0.5s ease',
            }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                }}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
