import { useEffect, useRef } from 'react'

/* ═══ Philosophy fragments ═══ */
const THOUGHTS: string[] = [
  'If God is omniscient, does prayer change His mind — or only yours?',
  'Free will may be the only prison we build entirely from the inside.',
  'Morality without a lawgiver is gravity without mass — felt, but unexplained.',
  'The universe is under no obligation to make sense to you.',
  'Is the self that chose yesterday the same self that regrets today?',
  'Determinism doesn\'t free you from responsibility — it dissolves the one who\'d be freed.',
  'Every act of creation is first an act of destruction.',
  'If objective truth exists, our believing it doesn\'t make it so — and our doubting it doesn\'t unmake it.',
  'The silence of God is not evidence of absence — it may be the loudest thing in the room.',
  'You are not a drop in the ocean. You are the entire ocean in a drop.',
  'What we observe is not nature itself, but nature exposed to our method of questioning.',
  'A man can do what he wills, but he cannot will what he wills.',
  'The only walls that exist are the ones you\'ve placed in your mind.',
  'To define is to limit.',
  'Consciousness is the universe experiencing itself.',
  'There are no facts, only interpretations.',
  'The unexamined life is not worth living — but the over-examined life is not lived at all.',
  'If everything is permitted, nothing is meaningful.',
  'We are the cosmos made conscious, and life is the means by which the universe understands itself.',
  'Suffering ceases to be suffering the moment it finds a meaning.',
  'The measure of a mind is not what it knows but what it questions.',
  'Perhaps free will is not the ability to choose, but the inability to not choose.',
  'An infinite God who creates finite beings must lose something in translation.',
  'The eye with which I see God is the same eye with which God sees me.',
  'Ethics is not about what we may do, but what we must become.',
  'Time is the substance I am made of. Time is a river which sweeps me along, but I am the river.',
  'In the beginning was the Word — and the Word was a question.',
  'The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself.',
  'Liberty means responsibility. That is why most men dread it.',
  'He who has a why to live can bear almost any how.',
]

/* ═══ Scroll-text state ═══ */
interface ScrollText {
  text: string
  born: number
  dur: number
}


/* ═══ Icosahedron geometry ═══ */
const PHI = (1 + Math.sqrt(5)) / 2
const NN = Math.sqrt(1 + PHI * PHI)

const ICO_V: [number, number, number][] = [
  [-1 / NN, PHI / NN, 0], [1 / NN, PHI / NN, 0],
  [-1 / NN, -PHI / NN, 0], [1 / NN, -PHI / NN, 0],
  [0, -1 / NN, PHI / NN], [0, 1 / NN, PHI / NN],
  [0, -1 / NN, -PHI / NN], [0, 1 / NN, -PHI / NN],
  [PHI / NN, 0, -1 / NN], [PHI / NN, 0, 1 / NN],
  [-PHI / NN, 0, -1 / NN], [-PHI / NN, 0, 1 / NN],
]
const ICO_F = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
]
const ICO_E: [number, number][] = []
{
  const s = new Set<string>()
  for (const [a, b, c] of ICO_F) {
    for (const [p, q] of [[a, b], [b, c], [a, c]] as [number, number][]) {
      const k = `${Math.min(p, q)}-${Math.max(p, q)}`
      if (!s.has(k)) { s.add(k); ICO_E.push([Math.min(p, q), Math.max(p, q)]) }
    }
  }
}

function rotY(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a), s = Math.sin(a)
  return [x * c + z * s, y, -x * s + z * c]
}
function rotX(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a), s = Math.sin(a)
  return [x, y * c - z * s, y * s + z * c]
}
function proj(x: number, y: number, z: number, sc: number): [number, number] {
  const d = 3.5, f = d / (d + z * 0.3)
  return [x * sc * f, y * sc * f]
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function drawWire(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number, rx: number, ry: number,
  color: string,
) {
  const pts: [number, number][] = ICO_V.map(([vx, vy, vz]) => {
    let [x, y, z] = rotX(vx, vy, vz, rx)
    ;[x, y, z] = rotY(x, y, z, ry)
    const [px, py] = proj(x, y, z, r)
    return [cx + px, cy + py]
  })
  ctx.strokeStyle = color
  ctx.lineWidth = 0.8
  for (const [a, b] of ICO_E) {
    ctx.beginPath()
    ctx.moveTo(pts[a][0], pts[a][1])
    ctx.lineTo(pts[b][0], pts[b][1])
    ctx.stroke()
  }
}

interface Props { onNodeClick: () => void }

export default function FloatingNode({ onNodeClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hitRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const scrollRef = useRef(0)
  const hoveringRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let offX = 0, offY = 0
    const trail: { x: number; y: number; rx: number; ry: number }[] = []

    /* ── Philosophy scroll text (single, hover-triggered) ── */
    let scrollText: ScrollText | null = null
    let thoughtIdx = Math.floor(Math.random() * THOUGHTS.length)
    let wasHovering = false

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const t = performance.now() * 0.001
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const sy = scrollRef.current

      /* ── Scroll progress: 0 = hero, 1 = below ── */
      const progress = Math.min(1, Math.max(0, sy / (h * 0.55)))

      /* ── Color channel (0 = black, 255 = white) ── */
      const ch = Math.round(lerp(0, 255, progress))
      const rgb = `${ch},${ch},${ch}`

      /* ── Size: shrinks as you scroll ── */
      const baseR = Math.min(w, h) * 0.055
      const nr = baseR * lerp(1, 0.5, progress)

      /* ── Center: moves to right side as you scroll ── */
      const cx = lerp(w * 0.5, w * 0.82, progress)
      const cy = lerp(h * 0.5, h * 0.42, progress)
      const rx = lerp(w * 0.24, w * 0.1, progress)
      const ry = lerp(h * 0.18, h * 0.18, progress)

      /* ── Lissajous base position ── */
      const bx = cx + Math.sin(t * 0.17) * rx + Math.sin(t * 0.071) * rx * 0.35
      const by = cy + Math.cos(t * 0.13) * ry + Math.cos(t * 0.058) * ry * 0.35

      /* ── Mouse avoidance spring ── */
      const mdx = bx + offX - mx
      const mdy = by + offY - my
      const md = Math.sqrt(mdx * mdx + mdy * mdy)
      if (md < 160 && md > 0) {
        const f = ((160 - md) / 160) * 2.5
        offX += (mdx / md) * f
        offY += (mdy / md) * f
      }
      offX *= 0.955
      offY *= 0.955

      const nx = bx + offX
      const ny = by + offY
      const rxa = t * 0.45
      const rya = t * 0.6

      trail.push({ x: nx, y: ny, rx: rxa, ry: rya })
      if (trail.length > 10) trail.shift()

      /* ── Update click target position (direct DOM) ── */
      if (hitRef.current) {
        const hr = nr * 1.8
        hitRef.current.style.left = `${nx - hr}px`
        hitRef.current.style.top = `${ny - hr}px`
        hitRef.current.style.width = `${hr * 2}px`
        hitRef.current.style.height = `${hr * 2}px`
      }

      ctx.clearRect(0, 0, w, h)

      /* ── Afterimage trail ── */
      for (let i = 0; i < trail.length - 1; i++) {
        const tp = trail[i]
        const a = (i / trail.length) * 0.055
        drawWire(ctx, tp.x, tp.y, nr * 1.5, tp.rx, tp.ry, `rgba(${rgb},${a})`)
      }

      /* ── Orbit rings ── */
      for (let ring = 0; ring < 3; ring++) {
        const phase = t * 1.2 + ring * 2.1
        const rr = nr * 1.8 + (Math.sin(phase) * 0.5 + 0.5) * nr * 0.8
        const oa = (1 - (Math.sin(phase) * 0.5 + 0.5)) * 0.055
        ctx.beginPath()
        ctx.arc(nx, ny, rr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${rgb},${oa})`
        ctx.lineWidth = 0.6
        ctx.stroke()
      }

      /* ── Wireframe shell ── */
      drawWire(ctx, nx, ny, nr * 1.5, rxa, rya, `rgba(${rgb},0.2)`)

      /* ── Core sphere ── */
      const cl = Math.round(lerp(34, 220, progress))
      const cd = Math.round(lerp(0, 255, progress))
      const grad = ctx.createRadialGradient(
        nx - nr * 0.15, ny - nr * 0.15, 0,
        nx, ny, nr * 0.48,
      )
      grad.addColorStop(0, `rgb(${cl},${cl},${cl})`)
      grad.addColorStop(1, `rgb(${cd},${cd},${cd})`)
      ctx.beginPath()
      ctx.arc(nx, ny, nr * 0.48, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      /* ── Highlight spec ── */
      ctx.beginPath()
      ctx.arc(nx - nr * 0.12, ny - nr * 0.14, nr * 0.13, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${lerp(0.18, 0.06, progress)})`
      ctx.fill()

      /* ── KM text ── */
      const km = Math.round(lerp(255, 0, progress))
      ctx.font = `700 ${Math.max(8, nr * 0.32)}px var(--font-display)`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = `rgb(${km},${km},${km})`
      ctx.fillText('#', nx, ny + 1)

      /* ── Label ── */
      const labelAlpha = lerp(0.22, 0.18, progress)
      ctx.font = `400 ${Math.max(8, nr * 0.26)}px var(--font-mono)`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = `rgba(${rgb},${labelAlpha})`
      ctx.fillText('Khelan Mehta', nx, ny + nr * 1.8 + 4)

      const subY = ny + nr * 1.8 + 4 + Math.max(10, nr * 0.32)
      ctx.font = `400 ${Math.max(6, nr * 0.17)}px var(--font-mono)`
      ctx.fillStyle = `rgba(${rgb},${labelAlpha * 0.55})`
      ctx.fillText('click to explore · knowledge graph', nx, subY)

      /* ── Philosophy scroll text (proximity-triggered, DOM element) ── */
      const distToMouse = Math.sqrt((nx - mx) ** 2 + (ny - my) ** 2)
      const isHov = distToMouse < nr * 4
      if (isHov && !wasHovering && !scrollText) {
        scrollText = {
          text: THOUGHTS[thoughtIdx % THOUGHTS.length],
          born: t,
          dur: 10.5,
        }
        thoughtIdx = (thoughtIdx + 1 + Math.floor(Math.random() * 3)) % THOUGHTS.length
        if (textRef.current) {
          textRef.current.textContent = scrollText.text
        }
      }
      wasHovering = isHov

      if (scrollText && textRef.current) {
        const el = textRef.current
        const age = t - scrollText.born
        const life = age / scrollText.dur
        if (life > 1) {
          scrollText = null
          el.style.opacity = '0'
        } else {
          const tw = el.scrollWidth
          const totalTravel = w + tw
          const x = w - life * totalTravel

          const fadeIn = Math.min(1, life * 8)
          const fadeOut = Math.min(1, (1 - life) * 8)
          const alpha = fadeIn * fadeOut * 0.45

          el.style.transform = `translateX(${x}px)`
          el.style.opacity = `${alpha}`
          el.style.color = `rgb(${ch},${ch},${ch})`
        }
      }

      animId = requestAnimationFrame(draw)
    }

    const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onScroll = () => { scrollRef.current = window.scrollY }

    resize()
    scrollRef.current = window.scrollY
    animId = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3 }}
      />
      <div
        ref={textRef}
        style={{
          position: 'fixed',
          top: '55%',
          left: 0,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 5,
          fontFamily: 'var(--font-display)',
          fontWeight: 300,
          fontSize: 'clamp(100px, 18vw, 350px)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      />
      <div
        ref={hitRef}
        onClick={onNodeClick}
        onMouseEnter={() => { hoveringRef.current = true }}
        onMouseLeave={() => { hoveringRef.current = false }}
        data-hover="true"
        style={{
          position: 'fixed',
          borderRadius: '50%',
          zIndex: 4,
        }}
      />
    </>
  )
}
