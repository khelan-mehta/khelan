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
const R = 24
const C = 2 * Math.PI * R
const GAP = 0.03 // fraction gap between arcs

function Donut({ segs, active, base }: { segs: [number, number, number]; active: boolean; base: number }) {
  let acc = 0
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ display: 'block' }}>
      <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(240,239,233,0.10)" strokeWidth="7" />
      {segs.map((seg, i) => {
        const start = acc
        acc += seg
        const visible = Math.max(seg - GAP, 0.02)
        const len = visible * C
        const rotation = -90 + start * 360
        return (
          <motion.circle
            key={i}
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke={ARC[i]}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${len} ${C}`}
            initial={{ strokeDashoffset: len, opacity: 0 }}
            animate={active ? { strokeDashoffset: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: base + 0.2 + i * 0.12, ease }}
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '36px 36px' }}
          />
        )
      })}
    </svg>
  )
}

function StepRow({ step, i, active }: { step: Step; i: number; active: boolean }) {
  const left = i % 2 === 0
  const base = i * 0.14
  const { Icon } = step
  return (
    <div className={`ns-step${left ? ' left' : ' right'}`}>
      <motion.div
        className="ns-card"
        initial={{ opacity: 0, x: left ? -30 : 30 }}
        animate={active ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: base, ease }}
      >
        <span className="ns-icon"><Icon size={17} strokeWidth={2} /></span>
        <div>
          <h4 className="ns-title">{step.title}</h4>
          <span className="ns-sub">{step.sub}</span>
        </div>
      </motion.div>

      <div className="ns-node">
        <motion.span
          className="ns-dot"
          initial={{ scale: 0 }}
          animate={active ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: base, ease }}
        >
          <Donut segs={step.segs} active={active} base={base} />
          <span className="ns-num">{step.n}</span>
        </motion.span>
      </div>

      <div className="ns-spacer" />
    </div>
  )
}

export default function NineSteps() {
  const wrap = useRef(null)
  const inView = useInView(wrap, { once: true, margin: '-100px' })
  return (
    <div className="ns-wrap" ref={wrap}>
      <motion.span
        className="ns-spine"
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 1.8, ease }}
      />
      {steps.map((s, i) => (
        <StepRow key={s.n} step={s} i={i} active={inView} />
      ))}

      <style>{`
        .ns-wrap { position: relative; margin-top: 12px; }
        .ns-spine {
          position: absolute; top: 34px; bottom: 34px; left: 50%; width: 2px;
          transform: translateX(-50%);
          transform-origin: top center;
          background: linear-gradient(180deg, #7fce6b, #4b3bff 50%, #e0913f);
          border-radius: 2px;
        }
        .ns-step {
          display: grid;
          grid-template-columns: 1fr 72px 1fr;
          align-items: center;
          gap: clamp(16px, 3vw, 40px);
          padding: 14px 0;
        }
        .ns-step.left  .ns-card   { grid-column: 1; justify-self: end; text-align: right; flex-direction: row-reverse; }
        .ns-step.left  .ns-spacer { grid-column: 3; }
        .ns-step.right .ns-card   { grid-column: 3; justify-self: start; text-align: left; order: 3; }
        .ns-step.right .ns-spacer { grid-column: 1; order: 1; }
        .ns-node { grid-column: 2; display: flex; justify-content: center; order: 2; }

        .ns-card {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--night-2);
          border: 1px solid var(--line-night);
          border-radius: 12px;
          padding: 14px 18px;
          max-width: 320px;
        }
        .ns-icon {
          flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--indigo-wash); color: var(--indigo-2);
          border: 1px solid var(--indigo-line);
        }
        .ns-title { font-size: 15px; font-weight: 600; color: var(--on-night); letter-spacing: -0.01em; }
        .ns-sub { font-family: var(--mono); font-size: 11.5px; color: var(--on-night-3); }

        .ns-node .ns-dot { position: relative; width: 72px; height: 72px; display: block; }
        .ns-num {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: var(--serif); font-size: 24px; color: var(--on-night);
        }

        @media (max-width: 720px) {
          .ns-spine { left: 36px; }
          .ns-step { grid-template-columns: 72px 1fr; gap: 16px; padding: 10px 0; }
          .ns-step.left .ns-card, .ns-step.right .ns-card {
            grid-column: 2; justify-self: start; text-align: left; flex-direction: row; order: 2;
          }
          .ns-node { grid-column: 1; order: 1; }
          .ns-spacer { display: none; }
        }
      `}</style>
    </div>
  )
}
