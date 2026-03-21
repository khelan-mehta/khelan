import { useRef, useEffect } from 'react'
import styles from './KnowledgeGraph.module.css'

const TEAL = '#00d4aa'
const AMBER = '#f5a623'
const BLUE = '#4a9eff'
const TEXT_C = '#e2e8f0'
const TEXT_DIM_C = '#8899aa'
const TEXT_MUTED_C = '#4a5568'

interface GraphNode {
  id: string
  label: string
  short: string
  nx: number
  ny: number
  color: string
  parent?: string
}

const NODES: GraphNode[] = [
  // Center
  { id: 'km', label: 'KM', short: 'KM', nx: 0, ny: 0, color: TEAL },
  // Categories (pentagon)
  { id: 'energy', label: 'Energy Modeling', short: 'Energy', nx: 0, ny: -0.42, color: TEAL },
  { id: 'green', label: 'Green Building', short: 'Green', nx: 0.40, ny: -0.13, color: AMBER },
  { id: 'ai', label: 'AI / ML', short: 'AI/ML', nx: 0.25, ny: 0.34, color: BLUE },
  { id: 'dev', label: 'Development', short: 'Dev', nx: -0.25, ny: 0.34, color: TEAL },
  { id: 'data', label: 'Data Analytics', short: 'Data', nx: -0.40, ny: -0.13, color: AMBER },
  // Energy subs
  { id: 'equest', label: 'eQuest', short: 'eQ', nx: -0.14, ny: -0.59, color: TEAL, parent: 'energy' },
  { id: 'iesve', label: 'IES VE', short: 'IES', nx: 0, ny: -0.62, color: TEAL, parent: 'energy' },
  { id: 'eplus', label: 'EnergyPlus', short: 'E+', nx: 0.14, ny: -0.59, color: TEAL, parent: 'energy' },
  // Green subs
  { id: 'leed', label: 'LEED BD+C', short: 'LEED', nx: 0.52, ny: -0.27, color: AMBER, parent: 'green' },
  { id: 'ashrae', label: 'ASHRAE 90.1', short: 'ASH', nx: 0.56, ny: -0.13, color: AMBER, parent: 'green' },
  { id: 'well', label: 'WELL', short: 'WELL', nx: 0.52, ny: 0.01, color: AMBER, parent: 'green' },
  // AI subs
  { id: 'dl', label: 'Deep Learning', short: 'DL', nx: 0.39, ny: 0.42, color: BLUE, parent: 'ai' },
  { id: 'nlp', label: 'NLP', short: 'NLP', nx: 0.25, ny: 0.50, color: BLUE, parent: 'ai' },
  { id: 'rag', label: 'RAG Systems', short: 'RAG', nx: 0.11, ny: 0.46, color: BLUE, parent: 'ai' },
  // Dev subs
  { id: 'react', label: 'React', short: 'React', nx: -0.11, ny: 0.46, color: TEAL, parent: 'dev' },
  { id: 'node', label: 'Node.js', short: 'Node', nx: -0.25, ny: 0.50, color: TEAL, parent: 'dev' },
  { id: 'python', label: 'Python', short: 'Py', nx: -0.39, ny: 0.42, color: TEAL, parent: 'dev' },
  // Data subs
  { id: 'pandas', label: 'Pandas', short: 'Pd', nx: -0.52, ny: -0.27, color: AMBER, parent: 'data' },
  { id: 'dataviz', label: 'DataViz', short: 'Viz', nx: -0.56, ny: -0.13, color: AMBER, parent: 'data' },
  { id: 'auto', label: 'Automation', short: 'Auto', nx: -0.52, ny: 0.01, color: AMBER, parent: 'data' },
]

const EDGES: [string, string][] = [
  // Center → categories
  ['km', 'energy'], ['km', 'green'], ['km', 'ai'], ['km', 'dev'], ['km', 'data'],
  // Category → subs
  ['energy', 'equest'], ['energy', 'iesve'], ['energy', 'eplus'],
  ['green', 'leed'], ['green', 'ashrae'], ['green', 'well'],
  ['ai', 'dl'], ['ai', 'nlp'], ['ai', 'rag'],
  ['dev', 'react'], ['dev', 'node'], ['dev', 'python'],
  ['data', 'pandas'], ['data', 'dataviz'], ['data', 'auto'],
  // Cross-connections
  ['energy', 'data'], ['energy', 'green'], ['ai', 'dev'], ['dev', 'data'],
]

function hexToRgb(hex: string): string {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].join(', ')
}

function getRadius(node: GraphNode, mini: boolean): number {
  if (node.id === 'km') return mini ? 20 : 30
  if (!node.parent) return mini ? 14 : 22
  return mini ? 8 : 13
}

function getFontSize(node: GraphNode, mini: boolean): number {
  if (node.id === 'km') return mini ? 13 : 18
  if (!node.parent) return mini ? 8 : 12
  return mini ? 7 : 9.5
}

interface Props {
  mini?: boolean
  onExpand?: () => void
}

export default function KnowledgeGraph({ mini = false, onExpand }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const hoveredRef = useRef<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let disposed = false
    let W = 0
    let H = 0
    let sc = 0

    function resize() {
      if (disposed || !canvas) return
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sc = Math.min(W, H) * (mini ? 0.42 : 0.38)
    }
    resize()
    window.addEventListener('resize', resize)

    const edgeParticles = EDGES.map(() => ({
      progress: Math.random(),
      speed: 0.0015 + Math.random() * 0.003,
    }))

    let t = 0

    function toPixel(nx: number, ny: number): [number, number] {
      return [W / 2 + nx * sc, H / 2 + ny * sc]
    }

    function getNode(id: string) {
      return NODES.find((n) => n.id === id)!
    }

    function isConnectedTo(nodeId: string, hovId: string) {
      return EDGES.some(
        ([a, b]) => (a === hovId && b === nodeId) || (b === hovId && a === nodeId),
      )
    }

    function draw() {
      if (disposed || W === 0) return
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      // Fade-in for full mode
      const appear = mini ? 1 : Math.min(t / 0.8, 1)
      const hov = hoveredRef.current

      // ── Edges ──
      EDGES.forEach(([fromId, toId], i) => {
        const fn = getNode(fromId)
        const tn = getNode(toId)
        const [x1, y1] = toPixel(fn.nx, fn.ny)
        const [x2, y2] = toPixel(tn.nx, tn.ny)

        const connected = hov ? hov === fromId || hov === toId : false
        const alpha = (hov ? (connected ? 0.35 : 0.04) : 0.13) * appear

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(${hexToRgb(fn.color)}, ${alpha})`
        ctx.lineWidth = connected ? 1.5 : 0.6
        ctx.stroke()

        // Traveling particle
        const p = edgeParticles[i]
        p.progress = (p.progress + p.speed) % 1
        const px = x1 + (x2 - x1) * p.progress
        const py = y1 + (y2 - y1) * p.progress
        ctx.beginPath()
        ctx.arc(px, py, connected ? 2.5 : 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${hexToRgb(fn.color)}, ${(connected ? 0.7 : 0.3) * appear})`
        ctx.fill()
      })

      // ── Nodes ──
      NODES.forEach((node) => {
        const drift = {
          x: Math.sin(t * 0.4 + node.nx * 5) * 0.005,
          y: Math.cos(t * 0.6 + node.ny * 5) * 0.005,
        }
        const [x, y] = toPixel(node.nx + drift.x, node.ny + drift.y)
        const r = getRadius(node, mini)
        const isHov = hov === node.id
        const conn = hov ? isConnectedTo(node.id, hov) : false
        const dim = hov != null && !isHov && !conn

        // Glow
        if (!dim) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8)
          glow.addColorStop(0, `rgba(${hexToRgb(node.color)}, ${(isHov ? 0.22 : 0.06) * appear})`)
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.beginPath()
          ctx.arc(x, y, r * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Circle
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = dim
          ? `rgba(${hexToRgb(node.color)}, ${0.03 * appear})`
          : `rgba(${hexToRgb(node.color)}, ${(isHov ? 0.22 : 0.10) * appear})`
        ctx.fill()
        ctx.strokeStyle = dim
          ? `rgba(${hexToRgb(node.color)}, ${0.12 * appear})`
          : `rgba(${hexToRgb(node.color)}, ${(isHov ? 0.85 : 0.45) * appear})`
        ctx.lineWidth = isHov ? 2 : 1
        ctx.stroke()

        // Center pulse
        if (node.id === 'km') {
          const pr = r + 3 + Math.sin(t * 1.8) * 3
          ctx.beginPath()
          ctx.arc(x, y, pr, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${hexToRgb(TEAL)}, ${(0.12 + Math.sin(t * 1.8) * 0.08) * appear})`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Label
        const fs = getFontSize(node, mini)
        const weight = node.id === 'km' ? '700' : node.parent ? '400' : '600'
        ctx.font = `${weight} ${fs}px 'Space Mono', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const labelAlpha = dim ? 0.2 : 1
        ctx.fillStyle = isHov
          ? node.color
          : node.parent
            ? TEXT_DIM_C
            : TEXT_C
        ctx.globalAlpha = labelAlpha * appear
        ctx.fillText(mini ? node.short : node.label, x, y)
        ctx.globalAlpha = 1
      })

      // Mini hint
      if (mini) {
        ctx.font = "500 8px 'Space Mono', monospace"
        ctx.fillStyle = TEXT_MUTED_C
        ctx.textAlign = 'center'
        ctx.globalAlpha = 0.5 + Math.sin(t * 1.5) * 0.2
        ctx.fillText('CLICK TO EXPLORE', W / 2, H - 18)
        ctx.globalAlpha = 1
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      let found: string | null = null
      for (const node of NODES) {
        const [px, py] = toPixel(node.nx, node.ny)
        const r = getRadius(node, mini) + 6
        if (Math.hypot(mx - px, my - py) < r) {
          found = node.id
          break
        }
      }
      hoveredRef.current = found
    }

    function onClick() {
      if (mini && onExpand) onExpand()
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click', onClick)

    return () => {
      disposed = true
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [mini, onExpand])

  return (
    <div className={`${styles.container} ${mini ? styles.mini : styles.full}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
