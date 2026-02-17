import { motion } from 'framer-motion'
import styles from './Hero.module.css'

export default function Hero({ onTalkClick }: { onTalkClick: () => void }) {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div
            className={styles.greeting}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className={styles.line} />
            <span className={styles.greetText}>Hello, I'm</span>
          </motion.div>

          <motion.h1
            className={styles.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Khelan <em>Mehta</em>
          </motion.h1>

          <motion.div
            className={styles.roles}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <span className={styles.role}>Energy Modeler</span>
            <span className={styles.dot}>·</span>
            <span className={styles.role}>Full-Stack Developer</span>
            <span className={styles.dot}>·</span>
            <span className={styles.role}>LEED AP BD+C</span>
          </motion.div>

          <motion.p
            className={styles.bio}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Third-year B.Tech ECE student specializing in building energy modeling, 
            simulation, and green building certification. Combining strong programming 
            skills with sustainability knowledge to support energy workflows and 
            building performance analysis.
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <button className={styles.talkBtn} onClick={onTalkClick}>
              <span className={styles.talkPulse} />
              <span className={styles.talkIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </span>
              <span>Talk with Me</span>
            </button>

            <a href="#projects" className={styles.secondaryBtn}>
              <span>View Projects</span>
              <span className={styles.arrow}>↓</span>
            </a>
          </motion.div>
        </div>

        <motion.div
          className={styles.illustration}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.illustrationFrame}>
            <div className={styles.avatarPlaceholder}>
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="80" r="40" stroke="white" strokeWidth="2" fill="none" />
                <path d="M40 180 C40 140 70 110 100 110 C130 110 160 140 160 180" stroke="white" strokeWidth="2" fill="none" />
                <rect x="70" y="100" width="60" height="40" rx="4" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
                <line x1="85" y1="108" x2="115" y2="108" stroke="white" strokeWidth="1" opacity="0.3" />
                <line x1="85" y1="116" x2="110" y2="116" stroke="white" strokeWidth="1" opacity="0.3" />
                <line x1="85" y1="124" x2="105" y2="124" stroke="white" strokeWidth="1" opacity="0.3" />
              </svg>
            </div>
            <div className={styles.floatingTags}>
              <span className={styles.floatTag} style={{ top: '10%', right: '-10%' }}>eQuest</span>
              <span className={styles.floatTag} style={{ bottom: '20%', left: '-8%' }}>LEED</span>
              <span className={styles.floatTag} style={{ top: '40%', right: '-15%' }}>React</span>
              <span className={styles.floatTag} style={{ bottom: '5%', right: '10%' }}>AI/ML</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className={styles.scrollLine} />
        <span className={styles.scrollText}>Scroll</span>
      </motion.div>
    </section>
  )
}
