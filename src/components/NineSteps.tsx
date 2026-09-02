import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  LogIn, FolderPlus, Upload, FileSearch, LayoutDashboard,
  Zap, FileSpreadsheet, BadgeCheck, Save,
} from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as const

type Step = {
  n: string
  title: string
  sub: string
  Icon: typeof LogIn
  segs: [number, number, number]
}

const steps: Step[] = [
  { n: '1', title: 'Sign In', sub: 'Secure auth', Icon: LogIn, segs: [0.34, 0.33, 0.33] },
  { n: '2', title: 'Create Project', sub: 'Set location', Icon: FolderPlus, segs: [0.5, 0.28, 0.22] },
  { n: '3', title: 'Upload Files', sub: '.SIM / PDF', Icon: Upload, segs: [0.4, 0.36, 0.24] },
  { n: '4', title: 'Parse', sub: 'Extract 130 metrics', Icon: FileSearch, segs: [0.62, 0.2, 0.18] },
  { n: '5', title: 'Review Dashboard', sub: 'Analyse charts', Icon: LayoutDashboard, segs: [0.44, 0.3, 0.26] },
  { n: '6', title: 'Fetch Utility Rates', sub: 'Auto-locate prices', Icon: Zap, segs: [0.5, 0.32, 0.18] },
  { n: '7', title: 'Export Standard Excel', sub: 'Download', Icon: FileSpreadsheet, segs: [0.38, 0.34, 0.28] },
  { n: '8', title: 'Auto-fill LEED MEPC', sub: 'Generate compliance', Icon: BadgeCheck, segs: [0.56, 0.26, 0.18] },
  { n: '9', title: 'Project Saved', sub: 'Portfolio updated', Icon: Save, segs: [0.7, 0.18, 0.12] },
]

const ARC = ['#7fce6b', '#e0913f', '#7f8598'] // green · orange · slate — echo of the deck donuts
const GAP = 0.03

/* ─────────────  DESKTOP: horizontal serpentine pipe  ───────────── */

const VBW = 1240
const VBH = 560
const NX = steps.map((_, i) => 84 + i * ((VBW - 168) / (steps.length - 1)))
const HI = 168
const LO = 392
const NY = steps.map((_, i) => (i % 2 === 0 ? LO : HI)) // 1 low, 2 high, 3 low …
const R = 30
const C = 2 * Math.PI * R

const pipePath = (() => {
  let d = `M ${NX[0]} ${NY[0]}`
  for (let i = 1; i < steps.length; i++) {
    const mx = (NX[i - 1] + NX[i]) / 2
    d += ` C ${mx} ${NY[i - 1]} ${mx} ${NY[i]} ${NX[i]} ${NY[i]}`
  }
  return d
})()

function NodeArcs({ segs, active, delay }: { segs: [number, number, number]; active: boolean; delay: number }) {
  let acc = 0
  return (
    <>
      <circle r={R} fill="none" stroke="rgba(240,239,233,0.12)" strokeWidth="7" />
      {segs.map((seg, i) => {
        const start = acc
        acc += seg
        const len = Math.max(seg - GAP, 0.02) * C
        const rot = -90 + start * 360
        return (
          <motion.circle
            key={i}
            r={R}
            fill="none"
            stroke={ARC[i]}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${len} ${C}`}
            initial={{ strokeDashoffset: len, opacity: 0 }}
            animate={active ? { strokeDashoffset: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: delay + 0.15 + i * 0.1, ease }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${rot}deg)` }}
          />
        )
      })}
    </>
  )
}

function Serpentine({ active }: { active: boolean }) {
  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} className="ns-svg" role="img" aria-label="Nine-step Marcus pipeline">
      <defs>
        <linearGradient id="nsflow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fce6b" />
          <stop offset="0.5" stopColor="#4b3bff" />
          <stop offset="1" stopColor="#e0913f" />
        </linearGradient>
      </defs>

      {/* pipe body */}
      <motion.path
        d={pipePath}
        fill="none"
        stroke="rgba(240,239,233,0.09)"
        strokeWidth="26"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : {}}
        transition={{ duration: 2.4, ease }}
      />
      {/* flowing signal line */}
      <motion.path
        d={pipePath}
        fill="none"
        stroke="url(#nsflow)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 2.4, delay: 0.15, ease }}
      />

      {/* nodes */}
      {steps.map((s, i) => {
        const cx = NX[i]
        const cy = NY[i]
        const isHigh = cy === HI
        const delay = 0.35 + (i / (steps.length - 1)) * 2.1
        const tTitleY = isHigh ? -70 : 62
        const tSubY = isHigh ? -50 : 80
        return (
          <g key={s.n} transform={`translate(${cx} ${cy})`}>
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={active ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay, ease }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <circle r={R + 6} fill="var(--night)" />
              <NodeArcs segs={s.segs} active={active} delay={delay} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontFamily: 'var(--serif)', fontSize: 26, fill: 'var(--on-night)' }}
              >
                {s.n}
              </text>
            </motion.g>
            <motion.text
              x="0"
              y={tTitleY}
              textAnchor="middle"
              initial={{ opacity: 0, y: tTitleY + (isHigh ? -6 : 6) }}
              animate={active ? { opacity: 1, y: tTitleY } : {}}
              transition={{ duration: 0.5, delay: delay + 0.2, ease }}
              style={{ fontFamily: 'var(--serif)', fontSize: 22, fill: 'var(--on-night)' }}
            >
              {s.title}
            </motion.text>
            <motion.text
              x="0"
              y={tSubY}
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={active ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: delay + 0.3, ease }}
              style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.02em', fill: 'var(--on-night-3)' }}
            >
              {s.sub}
            </motion.text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─────────────  MOBILE: vertical rail  ───────────── */

function MobileDonut({ segs, active, base }: { segs: [number, number, number]; active: boolean; base: number }) {
  let acc = 0
  const r = 24
  const c = 2 * Math.PI * r
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ display: 'block' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(240,239,233,0.10)" strokeWidth="7" />
      {segs.map((seg, i) => {
        const start = acc
        acc += seg
        const len = Math.max(seg - GAP, 0.02) * c
        const rot = -90 + start * 360
        return (
          <motion.circle
            key={i}
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={ARC[i]}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${len} ${c}`}
            initial={{ strokeDashoffset: len, opacity: 0 }}
            animate={active ? { strokeDashoffset: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: base + 0.2 + i * 0.12, ease }}
            style={{ transform: `rotate(${rot}deg)`, transformOrigin: '36px 36px' }}
          />
        )
      })}
    </svg>
  )
}

function MobileRail({ active }: { active: boolean }) {
  return (
    <div className="ns-rail">
      <motion.span
        className="ns-spine"
        initial={{ scaleY: 0 }}
        animate={active ? { scaleY: 1 } : {}}
        transition={{ duration: 1.8, ease }}
      />
      {steps.map((s, i) => {
        const base = i * 0.14
        const { Icon } = s
        return (
          <div className="ns-step" key={s.n}>
            <div className="ns-node">
              <motion.span
                className="ns-dot"
                initial={{ scale: 0 }}
                animate={active ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: base, ease }}
              >
                <MobileDonut segs={s.segs} active={active} base={base} />
                <span className="ns-num">{s.n}</span>
              </motion.span>
            </div>
            <motion.div
              className="ns-card"
              initial={{ opacity: 0, x: 24 }}
              animate={active ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: base, ease }}
            >
              <span className="ns-icon"><Icon size={17} strokeWidth={2} /></span>
              <div>
                <h4 className="ns-title">{s.title}</h4>
                <span className="ns-sub">{s.sub}</span>
              </div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

export default function NineSteps() {
  const wrap = useRef(null)
  const active = useInView(wrap, { once: true, margin: '-80px' })
  return (
    <div ref={wrap}>
      <div className="ns-desktop"><Serpentine active={active} /></div>
      <div className="ns-mobile"><MobileRail active={active} /></div>

      <style>{`
        .ns-desktop { display: block; }
        .ns-mobile { display: none; }
        .ns-svg { width: 100%; height: auto; overflow: visible; display: block; }

        .ns-rail { position: relative; margin-top: 4px; }
        .ns-spine {
          position: absolute; top: 34px; bottom: 34px; left: 36px; width: 2px;
          transform: translateX(-50%); transform-origin: top center;
          background: linear-gradient(180deg, #7fce6b, #4b3bff 50%, #e0913f);
          border-radius: 2px;
        }
        .ns-step { display: grid; grid-template-columns: 72px 1fr; gap: 16px; align-items: center; padding: 10px 0; }
        .ns-node { display: flex; justify-content: center; }
        .ns-node .ns-dot { position: relative; width: 72px; height: 72px; display: block; }
        .ns-num {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: var(--serif); font-size: 24px; color: var(--on-night);
        }
        .ns-card {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--night-2); border: 1px solid var(--line-night);
          border-radius: 12px; padding: 14px 18px;
        }
        .ns-icon {
          flex-shrink: 0; width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--indigo-wash); color: var(--indigo-2); border: 1px solid var(--indigo-line);
        }
        .ns-title { font-size: 15px; font-weight: 600; color: var(--on-night); letter-spacing: -0.01em; }
        .ns-sub { font-family: var(--mono); font-size: 11.5px; color: var(--on-night-3); }

        @media (max-width: 820px) {
          .ns-desktop { display: none; }
          .ns-mobile { display: block; }
        }
      `}</style>
    </div>
  )
}
