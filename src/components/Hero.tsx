import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface HeroProps {
  onTalkClick: () => void
  onGraphClick: () => void
}

const ease = [0.16, 1, 0.3, 1]

interface HP {
  x: number; y: number; ox: number; oy: number
  sz: number; op: number
  px: number; py: number; fx: number; fy: number
  ax: number; ay: number
}

export default function Hero({ onTalkClick, onGraphClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const sectionRef = useRef<HTMLElement>(null)

  const setup = useCallback(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const rect = section.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const w = rect.width
    const h = rect.height
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = Math.min(90, Math.floor((w * h) / 16000))
    const particles: HP[] = Array.from({ length: count }, () => {
      const x = Math.random() * w
      const y = Math.random() * h
      return {
        x, y, ox: x, oy: y,
        sz: Math.random() * 1.3 + 0.4,
        op: Math.random() * 0.1 + 0.02,
        px: Math.random() * Math.PI * 2, py: Math.random() * Math.PI * 2,
        fx: (Math.random() * 0.3 + 0.12) * 0.001,
        fy: (Math.random() * 0.3 + 0.12) * 0.001,
        ax: Math.random() * 50 + 15, ay: Math.random() * 50 + 15,
      }
    })
    return { ctx, w, h, particles }
  }, [])

  useEffect(() => {
    let state = setup()
    if (!state) return
    let animId: number

    const draw = () => {
      if (!state) return
      const { ctx, w, h, particles } = state
      const t = performance.now() * 0.001
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        const tx = p.ox + Math.sin(t * p.fx + p.px) * p.ax
        const ty = p.oy + Math.cos(t * p.fy + p.py) * p.ay
        p.x += (tx - p.x) * 0.015
        p.y += (ty - p.y) * 0.015

        const dx = p.x - mx, dy = p.y - my
        const md = Math.sqrt(dx * dx + dy * dy)
        if (md < 130 && md > 0) {
          const f = ((130 - md) / 130) * 2.5
          p.x += (dx / md) * f
          p.y += (dy / md) * f
        }

        if (p.ox < -60) p.ox += w + 120
        if (p.ox > w + 60) p.ox -= w + 120
        if (p.oy < -60) p.oy += h + 120
        if (p.oy > h + 60) p.oy -= h + 120

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,0,0,${p.op})`
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < 120 * 120) {
            const d = Math.sqrt(d2)
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,0,0,${(1 - d / 120) * 0.05})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    const onMouse = (e: MouseEvent) => {
      const sec = sectionRef.current
      if (!sec) return
      const r = sec.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onResize = () => { state = setup() }

    animId = requestAnimationFrame(draw)
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
    }
  }, [setup])

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '120px 24px 120px',
        background: '#fff',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 220,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #000 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 36,
            padding: '6px 16px',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 100,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000', display: 'block' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 400,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)',
            }}
          >
            Software Engineer
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.12, ease }}
          style={{
            fontSize: 'clamp(60px, 12vw, 160px)', fontWeight: 700,
            letterSpacing: '-0.055em', lineHeight: 0.85, color: '#000', marginBottom: 28,
          }}
        >
          Khelan<br />
          <span style={{ fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.04em' }}>
            Mehta
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 36 }}
        >
          {['Energy Modeling', 'AI / ML', 'Full Stack', 'Green Building'].map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.25)',
              }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5, ease }}
          style={{
            width: 48, height: 1, background: 'rgba(0,0,0,0.12)',
            margin: '0 auto 32px', transformOrigin: 'center',
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease }}
          style={{
            fontSize: 15, lineHeight: 1.9, color: 'rgba(0,0,0,0.35)',
            maxWidth: 380, margin: '0 auto 48px', fontWeight: 400,
          }}
        >
          Building at the intersection of sustainability
          and technology. LEED certified, full-stack
          developer, AI enthusiast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={onTalkClick}
            style={{
              padding: '12px 30px', border: 'none', borderRadius: 100,
              color: '#fff', fontSize: 13, fontWeight: 500, letterSpacing: '0.015em',
              background: '#000', transition: 'all 0.35s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Talk to me
          </button>
          <button
            onClick={onGraphClick}
            style={{
              padding: '12px 30px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 100,
              color: 'rgba(0,0,0,0.5)', fontSize: 13, fontWeight: 500, letterSpacing: '0.015em',
              background: 'transparent', transition: 'all 0.35s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.35)'
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
              e.currentTarget.style.color = 'rgba(0,0,0,0.5)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Explore Graph
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} color="rgba(255,255,255,0.35)" />
        </motion.div>
      </motion.div>
    </section>
  )
}
