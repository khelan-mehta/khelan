import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Projects.module.css'

const projects = [
  {
    title: 'AI-Powered eQuest Report Analysis',
    description:
      'A document processing system for extracting structured data from eQuest energy simulation reports. Features RAG architecture with vector embeddings for semantic search and NLP-based query interface.',
    tags: ['Python', 'Flask', 'OpenAI', 'Vector Search', 'RAG'],
    year: '2024',
  },
  {
    title: 'Smart Shopping Cart System',
    description:
      'ESP32-based RFID scanning system with full-stack web interface. Express.js backend, React frontend with cyberpunk styling, and detailed Arduino firmware integration.',
    tags: ['ESP32', 'RFID', 'React', 'Express.js', 'IoT'],
    year: '2024',
  },
  {
    title: 'Smart Grid Cybersecurity Research',
    description:
      'Comprehensive analysis of FDI attack detection papers with 15-column frameworks covering attack types, ML/DL models, datasets, and deployment considerations.',
    tags: ['Cybersecurity', 'ML/DL', 'Research', 'Smart Grid'],
    year: '2024',
  },
  {
    title: 'Influencer Marketing Platform',
    description:
      'Full-stack platform with data visualization dashboards for influencer performance and campaign tracking with third-party API integrations.',
    tags: ['React', 'Node.js', 'Express', 'APIs', 'Dashboard'],
    year: '2022',
  },
]

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="projects" className={styles.projects} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.label}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.labelLine} />
          <span className={styles.labelText}>03 / Projects</span>
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Featured <em>Projects</em>
        </motion.h2>

        <div className={styles.grid}>
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              className={styles.card}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 * i + 0.3 }}
              data-hover
            >
              <div className={styles.cardTop}>
                <span className={styles.year}>{project.year}</span>
                <span className={styles.arrow}>↗</span>
              </div>
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <p className={styles.cardDesc}>{project.description}</p>
              <div className={styles.cardTags}>
                {project.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
