import { useRef, Suspense, lazy } from 'react'
import { motion, useInView } from 'framer-motion'
import { Rotate3d } from 'lucide-react'
import modelA from '../data/model-a.json'
import modelB from '../data/model-b.json'

const BuildingViewer = lazy(() => import('./BuildingViewer'))

const ease = [0.16, 1, 0.3, 1] as const
const models = [modelA, modelB] as any[]

function ModelCard({ model, i, inView }: { model: any; i: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: 0.12 + i * 0.12, ease }}
      className="model-card"
    >
      <div className="model-stage">
        <Suspense fallback={null}>
          <BuildingViewer model={model} />
        </Suspense>
        <span className="model-hint">
          <Rotate3d size={13} strokeWidth={2} /> drag to orbit · scroll to zoom
        </span>
      </div>
    </motion.div>
  )
}

export default function CurrentModels() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="models" className="section" ref={ref} style={{ background: 'var(--paper-2)' }}>
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 'clamp(32px, 5vw, 56px)' }}
        >
          <div className="sec-head">
            <span className="sec-index">/ on the bench</span>
            <h2 className="sec-title">Live energy models, <em>reconstructed in 3D</em></h2>
          </div>
          <p className="sec-lead">
            Real eQUEST/DOE-2 buildings I’m modelling right now — parsed straight from their
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.9em', color: 'var(--ink-2)' }}> .inp </span>
            source into interactive massing. Spin them.
          </p>
        </motion.div>

        <div className="models-grid">
          {models.map((m, i) => (
            <ModelCard key={i} model={m} i={i} inView={inView} />
          ))}
        </div>
      </div>

      <style>{`
        .models-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(20px, 3vw, 36px);
        }
        .model-card {
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          background:
            radial-gradient(120% 100% at 50% 0%, #fbfaf6 0%, #eeece4 70%, #e6e3d9 100%);
          box-shadow: 0 40px 80px -50px rgba(11,11,12,0.4);
        }
        .model-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3.4;
          touch-action: none;
          cursor: grab;
        }
        .model-stage:active { cursor: grabbing; }
        .model-hint {
          position: absolute;
          left: 14px;
          bottom: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.01em;
          color: var(--ink-3);
          background: rgba(251,250,246,0.72);
          backdrop-filter: blur(6px);
          border: 1px solid var(--line);
          border-radius: 100px;
          padding: 5px 11px;
          pointer-events: none;
        }
        @media (max-width: 820px) {
          .models-grid { grid-template-columns: 1fr; }
          .model-stage { aspect-ratio: 4 / 3.6; }
        }
      `}</style>
    </section>
  )
}
