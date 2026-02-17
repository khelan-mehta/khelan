import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Certifications.module.css'

const certs = [
  { name: 'LEED AP BD+C', issuer: 'U.S. Green Building Council', date: 'Dec 2025' },
  { name: 'LEED Green Associate', issuer: 'U.S. Green Building Council', date: 'Aug 2025' },
  { name: 'ESG Performance Measurement', issuer: 'Alison', date: 'Sep 2025' },
  { name: 'Life Cycle Assessment (LCA)', issuer: 'Ecochain', date: 'Sep 2025' },
  { name: 'CSRD Fundamentals Level 1', issuer: 'CSRD Institute', date: 'Sep 2025' },
]

export default function Certifications() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className={styles.certs} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.label}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.labelLine} />
          <span className={styles.labelText}>05 / Certifications</span>
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <em>Certifications</em>
        </motion.h2>

        <div className={styles.list}>
          {certs.map((cert, i) => (
            <motion.div
              key={cert.name}
              className={styles.item}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i + 0.3 }}
            >
              <div className={styles.itemLeft}>
                <span className={styles.itemName}>{cert.name}</span>
                <span className={styles.itemIssuer}>{cert.issuer}</span>
              </div>
              <span className={styles.itemDate}>{cert.date}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
