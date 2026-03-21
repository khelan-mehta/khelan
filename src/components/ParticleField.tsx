import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  ox: number
  oy: number
  size: number
  opacity: number
  px: number
  py: number
  fx: number
  fy: number
  ax: number
  ay: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const w = window.innerWidth
      const h = window.innerHeight
      const count = Math.min(140, Math.max(40, Math.floor((w * h) / 12000)))

      particles = Array.from({ length: count }, () => {
        const x = Math.random() * w
        const y = Math.random() * h
        return {
          x,
          y,
          ox: x,
          oy: y,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.2 + 0.04,
          px: Math.random() * Math.PI * 2,
          py: Math.random() * Math.PI * 2,
          fx: (Math.random() * 0.4 + 0.15) * 0.001,
          fy: (Math.random() * 0.4 + 0.15) * 0.001,
          ax: Math.random() * 60 + 20,
          ay: Math.random() * 60 + 20,
        }
      })
    }

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const t = performance.now()
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        const targetX = p.ox + Math.sin(t * p.fx + p.px) * p.ax
        const targetY = p.oy + Math.cos(t * p.fy + p.py) * p.ay

        p.x += (targetX - p.x) * 0.015
        p.y += (targetY - p.y) * 0.015

        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160 && dist > 0) {
          const force = ((160 - dist) / 160) * 3
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }

        if (p.ox < -80) p.ox += w + 160
        if (p.ox > w + 80) p.ox -= w + 160
        if (p.oy < -80) p.oy += h + 160
        if (p.oy > h + 80) p.oy -= h + 160

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.fill()
      }

      const connDist = 130
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = dx * dx + dy * dy
          if (d < connDist * connDist) {
            const dist = Math.sqrt(d)
            const alpha = (1 - dist / connDist) * 0.1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    resize()
    animId = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
