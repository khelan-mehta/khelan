import { motion } from 'framer-motion'

interface AnimatedTitleProps {
  children: string
  className?: string
  em?: string
  delay?: number
  inView: boolean
}

export default function AnimatedTitle({ children, className, em, delay = 0.2, inView }: AnimatedTitleProps) {
  // Split text, wrapping the em word(s) in <em>
  const parts = em ? children.split(em) : [children]

  const allWords: { text: string; isEm: boolean }[] = []
  parts.forEach((part, i) => {
    part.split(' ').filter(Boolean).forEach(w => allWords.push({ text: w, isEm: false }))
    if (em && i < parts.length - 1) {
      em.split(' ').filter(Boolean).forEach(w => allWords.push({ text: w, isEm: true }))
    }
  })

  return (
    <h2 className={className} style={{ overflow: 'hidden' }}>
      {allWords.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
          }}
        >
          {word.isEm ? <em>{word.text}</em> : word.text}
        </motion.span>
      ))}
    </h2>
  )
}
