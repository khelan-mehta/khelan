import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Experience.module.css'

const experiences = [
  {
    company: 'Ergo Energy LLP',
    role: 'Energy Modeling & Sustainability Consultant Intern',
    period: 'Jul 2024 — Present',
    location: 'Surat, Gujarat',
    points: [
      'Conducted building energy modeling and simulation for commercial projects using eQuest and IES VE',
      'Supported LEED certification processes (BD+C, O+M) through preparation of energy documentation',
      'Developed Python automation workflows for processing simulation outputs',
      'Participated in building energy audits and prepared energy conservation measures',
    ],
  },
  {
    company: 'The IT Company — Brown Ion',
    role: 'Development Team Manager',
    period: 'Jun 2023 — May 2024',
    location: 'Remote',
    points: [
      'Coordinated a development team delivering web applications using agile methodologies',
      'Led development of AI-assisted automation tools for internal operational workflows',
      'Ensured OWASP security standards and architected full-stack MERN solutions',
    ],
  },
  {
    company: 'Admyre',
    role: 'Web Developer',
    period: 'Aug 2021 — Jun 2023',
    location: 'Remote',
    points: [
      'Developed a full-stack influencer marketing platform using React, Node.js, and Express',
      'Built data visualization dashboards for influencer performance tracking',
      'Integrated third-party APIs for social media data collection',
    ],
  },
]

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="experience" className={styles.experience} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.label}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.labelLine} />
          <span className={styles.labelText}>04 / Experience</span>
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          My <em>Experience</em>
        </motion.h2>

        <div className={styles.timeline}>
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              className={styles.item}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i + 0.3 }}
            >
              <div className={styles.itemHeader}>
                <div>
                  <h3 className={styles.company}>{exp.company}</h3>
                  <p className={styles.role}>{exp.role}</p>
                </div>
                <div className={styles.meta}>
                  <span className={styles.period}>{exp.period}</span>
                  <span className={styles.location}>{exp.location}</span>
                </div>
              </div>
              <ul className={styles.points}>
                {exp.points.map((point, j) => (
                  <li key={j} className={styles.point}>{point}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
