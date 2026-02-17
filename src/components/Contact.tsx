import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Contact.module.css'

const links = [
  { label: 'Email', href: 'mailto:khelan05@gmail.com', value: 'khelan05@gmail.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/khelanmehta', value: 'linkedin.com/in/khelanmehta' },
  { label: 'GitHub', href: 'https://github.com/khelan-mehta', value: 'github.com/khelan-mehta' },
]

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="contact" className={styles.contact} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.label}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.labelLine} />
          <span className={styles.labelText}>06 / Contact</span>
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Let's <em>Connect</em>
        </motion.h2>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Interested in energy modeling, sustainability tech, or collaboration? 
          I'd love to hear from you.
        </motion.p>

        <div className={styles.links}>
          {links.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i + 0.4 }}
            >
              <span className={styles.linkLabel}>{link.label}</span>
              <span className={styles.linkValue}>{link.value}</span>
              <span className={styles.linkArrow}>↗</span>
            </motion.a>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerLeft}>
            © {new Date().getFullYear()} Khelan Mehta
          </span>
          <span className={styles.footerRight}>
            Built with React + TypeScript
          </span>
        </div>
      </div>
    </section>
  )
}
