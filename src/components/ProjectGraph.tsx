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
  { id: 'p1', label: 'eQuest AI', type: 'project', x: 200, y: 150, connections: ['s1', 's3', 's5'], desc: 'AI-powered energy report analysis with RAG architecture' },
  { id: 'p2', label: 'Smart Cart', type: 'project', x: 500, y: 120, connections: ['s2', 's4', 's6'], desc: 'ESP32 RFID scanning system with full-stack interface' },
  { id: 'p3', label: 'Grid Security', type: 'project', x: 580, y: 300, connections: ['s1', 's3'], desc: 'Smart grid cybersecurity ML/DL research' },
  { id: 'p4', label: 'Influencer App', type: 'project', x: 380, y: 400, connections: ['s2', 's4', 's6'], desc: 'Marketing platform with analytics dashboard' },
  { id: 'p5', label: 'Energy Platform', type: 'project', x: 140, y: 340, connections: ['s1', 's2', 's3', 's5'], desc: 'Energy analytics with ML prediction models' },
  { id: 's1', label: 'Python', type: 'skill', x: 80, y: 60, connections: [] },
  { id: 's2', label: 'React', type: 'skill', x: 350, y: 45, connections: [] },
  { id: 's3', label: 'AI / ML', type: 'skill', x: 650, y: 200, connections: [] },
  { id: 's4', label: 'Node.js', type: 'skill', x: 530, y: 440, connections: [] },
  { id: 's5', label: 'Energy', type: 'skill', x: 50, y: 240, connections: [] },
  { id: 's6', label: 'TypeScript', type: 'skill', x: 240, y: 465, connections: [] },
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
  const cx = mx + nx * offset
  const cy = my + ny * offset
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
}

export default function ProjectGraph({ onNodeClick }: { onNodeClick: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const edges: Array<{ from: GraphNode; to: GraphNode; key: string }> = []
  for (const node of graphNodes) {
    for (const connId of node.connections) {
      const target = graphNodes.find(n => n.id === connId)
      if (target) edges.push({ from: node, to: target, key: `${node.id}-${connId}` })
    }
  }

  const isHighlighted = (nodeId: string) => {
    if (!hovered) return false
    if (nodeId === hovered) return true
    const hoveredNode = graphNodes.find(n => n.id === hovered)
    if (hoveredNode?.connections.includes(nodeId)) return true
    const thisNode = graphNodes.find(n => n.id === nodeId)
    if (thisNode?.connections.includes(hovered)) return true
    return false
  }

  const isEdgeActive = (fromId: string, toId: string) => {
    if (!hovered) return false
    return hovered === fromId || hovered === toId
  }

  const hoveredData = hovered ? graphNodes.find(n => n.id === hovered) : null

  return (
    <section id="projects" className="section" ref={ref} style={{ background: 'transparent' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <span className="section-label">03 — Projects & Skills</span>
          <h2 className="section-title">Knowledge Map</h2>
          <p className="section-subtitle" style={{ marginBottom: 48 }}>
            An interconnected view of projects and the technologies behind them.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease }}
          style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}
        >
          <svg viewBox="0 0 700 510" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
            {/* Edges */}
            {edges.map(edge => {
              const active = isEdgeActive(edge.from.id, edge.to.id)
              return (
                <path
                  key={edge.key}
                  d={getCurvePath(edge.from, edge.to)}
                  fill="none"
                  stroke={active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.05)'}
                  strokeWidth={active ? 1.2 : 0.5}
                  style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                />
              )
            })}

            {/* Nodes */}
            {graphNodes.map((node, i) => {
              const isProject = node.type === 'project'
              const r = isProject ? 22 : 12
              const active = isHighlighted(node.id)
              const dimmed = hovered !== null && !active

              return (
                <motion.g
                  key={node.id}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.5 + (i % 5) * 0.6,
                    ease: 'easeInOut',
                    delay: i * 0.15,
                  }}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={onNodeClick}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulse ring */}
                  {active && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 10}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={1}
                    >
                      <animate
                        attributeName="r"
                        values={`${r + 8};${r + 16};${r + 8}`}
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="1;0.3;1"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={
                      isProject
                        ? active ? '#fff' : 'rgba(255,255,255,0.03)'
                        : 'transparent'
                    }
                    stroke={
                      active
                        ? '#fff'
                        : dimmed
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(255,255,255,0.12)'
                    }
                    strokeWidth={isProject ? 1.5 : 1}
                    style={{ transition: 'all 0.4s' }}
                  />

                  {/* Inner text for projects */}
                  {isProject && (
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={active ? '#000' : 'rgba(255,255,255,0.3)'}
                      fontSize={9}
                      fontFamily="var(--font-mono)"
                      fontWeight={600}
                      style={{ transition: 'fill 0.4s', pointerEvents: 'none' }}
                    >
                      {node.id.replace('p', '0')}
                    </text>
                  )}

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + r + 16}
                    textAnchor="middle"
                    fill={
                      active
                        ? '#fff'
                        : dimmed
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(255,255,255,0.3)'
                    }
                    fontSize={isProject ? 11 : 10}
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.02em"
                    style={{ transition: 'fill 0.4s', pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>
                </motion.g>
              )
            })}
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredData?.desc && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  padding: '10px 18px',
                  borderRadius: 6,
                  maxWidth: 300,
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {hoveredData.desc}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              textAlign: 'center',
              marginTop: 40,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            Click any node to explore the full graph →
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
