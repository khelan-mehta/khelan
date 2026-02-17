import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './About.module.css'

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className={styles.about} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.label}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.labelLine} />
          <span className={styles.labelText}>01 / About</span>
        </motion.div>

        <div className={styles.grid}>
          <motion.div
            className={styles.left}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className={styles.title}>
              Building a <em>sustainable</em> future through code & energy modeling
            </h2>
          </motion.div>

          <motion.div
            className={styles.right}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className={styles.text}>
              I'm a third-year B.Tech ECE student at Nirma University with a passion 
              for bridging technology and sustainability. As a LEED AP BD+C certified 
              professional, I bring a unique combination of building energy modeling 
              expertise and full-stack development skills.
            </p>
            <p className={styles.text}>
              My work spans from conducting energy simulations using eQuest and IES VE 
              to building AI-powered analysis systems. I believe in using technology 
              to create measurable impact in building performance and environmental 
              sustainability.
            </p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>3+</span>
                <span className={styles.statLabel}>Years of Development</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>LEED</span>
                <span className={styles.statLabel}>AP BD+C Certified</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>8.12</span>
                <span className={styles.statLabel}>CGPA at Nirma Univ.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
