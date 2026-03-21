import { motion } from 'framer-motion'
import styles from './Marquee.module.css'

const items = [
  'eQuest', 'IES VE', 'EnergyPlus', 'React', 'TypeScript', 'Node.js',
  'Python', 'LEED AP', 'ASHRAE 90.1', 'TensorFlow', 'MongoDB', 'FastAPI',
  'RAG Systems', 'ESG', 'LCA', 'Machine Learning', 'Firebase', 'Three.js',
]

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const doubled = [...items, ...items]

  return (
    <div className={styles.track}>
      <motion.div
        className={styles.inner}
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{
          x: { duration: 30, repeat: Infinity, ease: 'linear' },
        }}
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className={styles.item}>
            <span className={styles.dot} />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section className={styles.marquee}>
      <MarqueeRow />
      <MarqueeRow reverse />
    </section>
  )
}
