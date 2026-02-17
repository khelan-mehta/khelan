import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Skills.module.css'

const skillCategories = [
  {
    title: 'Energy Modeling',
    skills: ['eQuest', 'IES VE', 'EnergyPlus', 'ASHRAE 90.1', 'Load Calculations', 'Performance Analysis'],
  },
  {
    title: 'Green Building',
    skills: ['LEED BD+C', 'LEED O+M', 'Energy Code Compliance', 'WELL Standard', 'Commissioning'],
  },
  {
    title: 'AI / ML',
    skills: ['Machine Learning', 'Deep Learning', 'NLP', 'RAG Systems', 'Vector Databases', 'TensorFlow'],
  },
  {
    title: 'Development',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'Flask', 'FastAPI', 'MongoDB', 'Firebase'],
  },
  {
    title: 'Data & Analytics',
    skills: ['Energy Data Analytics', 'Data Visualization', 'Pandas', 'NumPy', 'Report Automation'],
  },
  {
    title: 'Sustainability',
    skills: ['ESG Metrics', 'Life Cycle Assessment', 'Carbon Footprint', 'CSRD Reporting'],
  },
]

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" className={styles.skills} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.label}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.labelLine} />
          <span className={styles.labelText}>02 / Skills</span>
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          My <em>Skills</em>
        </motion.h2>

        <div className={styles.grid}>
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i + 0.3 }}
            >
              <h3 className={styles.cardTitle}>{cat.title}</h3>
              <div className={styles.tags}>
                {cat.skills.map((skill) => (
                  <span key={skill} className={styles.tag}>
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
