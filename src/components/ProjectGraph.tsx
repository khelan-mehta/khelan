import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

interface GraphNode {
  id: string
  label: string
  type: 'project' | 'skill'
  x: number
  y: number
  connections: string[]
  desc?: string
}

const graphNodes: GraphNode[] = [
  { id: 'p1', label: 'Verdantra', type: 'project', x: 350, y: 80, connections: ['s1', 's3', 's6', 's8'],
    desc: 'ESG reporting automation — collect once, disclose to GRI/BRSR/ESRS/SBTi/ISSB with cited provenance.' },
  { id: 'p2', label: 'Pinocchio', type: 'project', x: 130, y: 160, connections: ['s2', 's4', 's8'],
    desc: 'Building-energy copilot on a real DOE-2.3 engine — answers from actual simulation runs.' },
  { id: 'p3', label: 'Marcus Studio', type: 'project', x: 580, y: 160, connections: ['s1', 's3', 's8', 's5'],
    desc: 'CannonDesign platform parsing eQUEST/TRACE/IES-VE into one schema — 80h → 2h.' },
  { id: 'p4', label: 'Skilleton', type: 'project', x: 620, y: 320, connections: ['s4', 's7', 's5'],
    desc: 'Workforce-intelligence system · 2nd of 2,200+ at IEEE Tic Tech Toe 2026.' },
  { id: 'p5', label: 'HalluciNot', type: 'project', x: 470, y: 430, connections: ['s3', 's5'],
    desc: 'Hallucination detection & mitigation pipeline · 1st, IEEE DSC 2.0.' },
  { id: 'p6', label: 'equestRag', type: 'project', x: 200, y: 375, connections: ['s1', 's6', 's8', 's5'],
    desc: 'RAG over 1,000+ building-energy docs · 95% extraction accuracy.' },
  { id: 'p7', label: 'NoteNex', type: 'project', x: 80, y: 300, connections: ['s2', 's3'],
    desc: 'AI notes platform · 1st, Mitraroop Startup Hackathon 2026.' },
  { id: 'p8', label: 'Cookie', type: 'project', x: 350, y: 470, connections: ['s4', 's2'],
    desc: 'Real-time animal emergency response · 1st, GDG Techsprint 2025.' },
  { id: 'p9', label: 'Ergo Energy', type: 'project', x: 550, y: 250, connections: ['s8', 's2'],
    desc: 'Client-facing platform for an energy-modelling & green-building consultancy.' },
  // skills
  { id: 's1', label: 'RAG', type: 'skill', x: 450, y: 170, connections: [] },
  { id: 's2', label: 'React', type: 'skill', x: 210, y: 80, connections: [] },
  { id: 's3', label: 'LLM', type: 'skill', x: 680, y: 230, connections: [] },
  { id: 's4', label: 'Node', type: 'skill', x: 100, y: 420, connections: [] },
  { id: 's5', label: 'Python', type: 'skill', x: 270, y: 250, connections: [] },
  { id: 's6', label: 'Vectors', type: 'skill', x: 660, y: 410, connections: [] },
  { id: 's7', label: 'Docker', type: 'skill', x: 60, y: 150, connections: [] },
  { id: 's8', label: 'Energy', type: 'skill', x: 470, y: 340, connections: [] },
]

const ease = [0.16, 1, 0.3, 1] as const

function getCurvePath(from: GraphNode, to: GraphNode) {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  const nx = -dy / len
  const ny = dx / len
  const offset = Math.min(len * 0.12, 30)
  return `M ${from.x} ${from.y} Q ${mx + nx * offset} ${my + ny * offset} ${to.x} ${to.y}`
}

export default function ProjectGraph({ onNodeClick }: { onNodeClick: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const edges: Array<{ from: GraphNode; to: GraphNode; key: string }> = []
  for (const node of graphNodes) {
    for (const connId of node.connections) {
      const target = graphNodes.find((n) => n.id === connId)
      if (target) edges.push({ from: node, to: target, key: `${node.id}-${connId}` })
    }
  }

  const isHighlighted = (nodeId: string) => {
    if (!hovered) return false
    if (nodeId === hovered) return true
    const h = graphNodes.find((n) => n.id === hovered)
    if (h?.connections.includes(nodeId)) return true
    const t = graphNodes.find((n) => n.id === nodeId)
    return !!t?.connections.includes(hovered)
  }
  const isEdgeActive = (a: string, b: string) => !!hovered && (hovered === a || hovered === b)
  const hoveredData = hovered ? graphNodes.find((n) => n.id === hovered) : null

  return (
    <section id="graph" className="section" ref={ref} style={{ background: 'var(--paper)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 12 }}
        >
          <div className="sec-head">
            <span className="sec-index">/ everything else</span>
            <h2 className="sec-title">The knowledge map</h2>
          </div>
          <p className="sec-lead">
            Nine more builds and the skills that connect them. Hover a node — then open the full
            interactive graph.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.15, ease }}
          style={{ position: 'relative', maxWidth: 760, margin: '32px auto 0' }}
        >
          <svg viewBox="0 0 730 540" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
            {edges.map((edge) => {
              const active = isEdgeActive(edge.from.id, edge.to.id)
              return (
                <path
                  key={edge.key}
                  d={getCurvePath(edge.from, edge.to)}
                  fill="none"
                  stroke={active ? 'var(--indigo)' : 'rgba(11,11,12,0.10)'}
                  strokeWidth={active ? 1.4 : 0.6}
                  style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                />
              )
            })}

            {graphNodes.map((node, i) => {
              const isProject = node.type === 'project'
              const r = isProject ? 20 : 11
              const active = isHighlighted(node.id)
              const dimmed = hovered !== null && !active
              return (
                <motion.g
                  key={node.id}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5 + (i % 5) * 0.6, ease: 'easeInOut', delay: i * 0.15 }}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={onNodeClick}
                  style={{ cursor: 'pointer' }}
                >
                  {active && (
                    <circle cx={node.x} cy={node.y} r={r + 10} fill="none" stroke="var(--indigo-line)" strokeWidth={1}>
                      <animate attributeName="r" values={`${r + 8};${r + 16};${r + 8}`} dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.2;1" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={isProject ? (active ? 'var(--indigo)' : 'var(--card)') : active ? 'var(--indigo-wash)' : 'transparent'}
                    stroke={active ? 'var(--indigo)' : dimmed ? 'rgba(11,11,12,0.08)' : 'rgba(11,11,12,0.18)'}
                    strokeWidth={isProject ? 1.5 : 1}
                    style={{ transition: 'all 0.4s' }}
                  />
                  {isProject && (
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={active ? '#fff' : 'var(--ink-4)'}
                      fontSize={8.5}
                      fontFamily="var(--mono)"
                      fontWeight={600}
                      style={{ transition: 'fill 0.4s', pointerEvents: 'none' }}
                    >
                      {node.id.replace('p', '#')}
                    </text>
                  )}
                  <text
                    x={node.x}
                    y={node.y + r + 15}
                    textAnchor="middle"
                    fill={active ? 'var(--ink)' : dimmed ? 'rgba(11,11,12,0.22)' : 'var(--ink-3)'}
                    fontSize={isProject ? 11.5 : 10}
                    fontFamily="var(--mono)"
                    style={{ transition: 'fill 0.4s', pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>
                </motion.g>
              )
            })}
          </svg>

          <AnimatePresence>
            {hoveredData?.desc && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--ink)',
                  padding: '11px 18px',
                  borderRadius: 8,
                  maxWidth: 380,
                  textAlign: 'center',
                  pointerEvents: 'none',
                  boxShadow: '0 20px 40px -20px rgba(11,11,12,0.5)',
                }}
              >
                <p style={{ fontSize: 12.5, color: 'var(--on-night)', lineHeight: 1.5, margin: 0 }}>{hoveredData.desc}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={onNodeClick}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="btn btn-ghost"
            style={{ display: 'flex', margin: '48px auto 0' }}
          >
            Open the full graph →
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
