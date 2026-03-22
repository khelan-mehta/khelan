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
  url?: string
  live?: string
}

const graphNodes: GraphNode[] = [
  // ── Top ranked projects ──
  { id: 'p1', label: 'Skills Mirage', type: 'project', x: 350, y: 80, connections: ['s1', 's2', 's4', 's5', 's7'],
    desc: 'India\'s 1st workforce intelligence system — live job scraping, AI risk scoring, 3D knowledge graph, bilingual chatbot',
    url: 'https://github.com/khelan-mehta/skills-mirage', live: 'http://147.79.68.52:3600/' },
  { id: 'p2', label: 'Cookie', type: 'project', x: 130, y: 160, connections: ['s2', 's4', 's5', 's3'],
    desc: 'Animal emergency response platform — JWT + OAuth, OpenAI, AWS S3, Google Maps',
    url: 'https://github.com/khelan-mehta/cookie', live: 'https://cookiefe.vercel.app' },
  { id: 'p3', label: 'eQuest RAG', type: 'project', x: 580, y: 160, connections: ['s1', 's3', 's8'],
    desc: 'RAG pipeline for energy simulation reports — LLM PDF generation, vector search',
    url: 'https://github.com/khelan-mehta/equestRag' },
  { id: 'p4', label: 'Fraud Detection', type: 'project', x: 620, y: 310, connections: ['s1', 's3', 's6'],
    desc: 'ML money laundering detection — real-time inference pipeline, anomaly scoring',
    url: 'https://github.com/khelan-mehta/money_laundering', live: 'https://fd-cli-final.vercel.app/' },
  { id: 'p5', label: 'NoteNex', type: 'project', x: 490, y: 420, connections: ['s2', 's5'],
    desc: 'Smart note-taking app — "Smarter Notes. Sharper Thinking."',
    url: 'https://github.com/khelan-mehta/mhfe', live: 'https://mhfe.vercel.app/' },
  { id: 'p6', label: 'IFRS Dashboard', type: 'project', x: 200, y: 370, connections: ['s1', 's2', 's3', 's4', 's7'],
    desc: 'IFRS S1/S2 sustainability automation — compliance scoring, climate risk, RAG with MongoDB Vector Search',
    url: 'https://github.com/khelan-mehta/ifrs' },
  { id: 'p7', label: 'BH Frontend', type: 'project', x: 80, y: 290, connections: ['s2', 's5', 's4'],
    desc: 'Next.js dashboard app — TypeScript, Docker, full-stack',
    url: 'https://github.com/khelan-mehta/bh-frontend', live: 'https://bh-frontend-jbps.vercel.app/dashboard' },
  { id: 'p8', label: 'Ergo Energy', type: 'project', x: 350, y: 470, connections: ['s2', 's5', 's8'],
    desc: 'Production website for global energy modeling & green building consultancy (USA, India, Canada, UK)',
    url: 'https://github.com/khelan-mehta/ergoWebsite', live: 'https://ergoenergysolution.com/' },
  { id: 'p9', label: 'XAI Energy', type: 'project', x: 550, y: 240, connections: ['s1', 's3', 's6', 's8'],
    desc: 'Explainable AI on ASHRAE dataset — LightGBM R²≈0.92, SHAP analysis, K-Means clustering',
    url: 'https://github.com/khelan-mehta/xaiEnergy' },
  // ── Skills ──
  { id: 's1', label: 'Python', type: 'skill', x: 450, y: 170, connections: [] },
  { id: 's2', label: 'React', type: 'skill', x: 210, y: 80, connections: [] },
  { id: 's3', label: 'AI / ML', type: 'skill', x: 680, y: 230, connections: [] },
  { id: 's4', label: 'Node.js', type: 'skill', x: 100, y: 420, connections: [] },
  { id: 's5', label: 'TypeScript', type: 'skill', x: 250, y: 250, connections: [] },
  { id: 's6', label: 'Data Science', type: 'skill', x: 660, y: 410, connections: [] },
  { id: 's7', label: 'Docker', type: 'skill', x: 50, y: 140, connections: [] },
  { id: 's8', label: 'Energy', type: 'skill', x: 480, y: 340, connections: [] },
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
          <svg viewBox="0 0 730 520" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
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
                      {node.id.replace('p', '#')}
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
                  maxWidth: 360,
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
                {(hoveredData.url || hoveredData.live) && (
                  <div style={{
                    marginTop: 6,
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.04em',
                  }}>
                    {hoveredData.url && (
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>GitHub</span>
                    )}
                    {hoveredData.live && (
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>Live</span>
                    )}
                  </div>
                )}
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
