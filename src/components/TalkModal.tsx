import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import styles from './TalkModal.module.css'
import SoundVisualizer from './SoundVisualizer'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  // Tracks which sentence is currently being spoken (for highlight sync)
  speakingIndex?: number
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Utility: split markdown text into speakable sentences ────────────────────
// Strips markdown syntax so TTS doesn't read "asterisk asterisk bold asterisk asterisk"
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // bold
    .replace(/\*(.+?)\*/g, '$1')       // italic
    .replace(/`(.+?)`/g, '$1')         // inline code
    .replace(/#{1,6}\s/g, '')          // headings
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/^\s*[-*+]\s/gm, '')      // bullet points
    .replace(/^\s*\d+\.\s/gm, '')      // numbered lists
    .trim()
}

// Split text into sentences for progressive TTS
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation, keeping the delimiter
  const raw = stripMarkdown(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  // Merge very short fragments (< 20 chars) with the next sentence
  const merged: string[] = []
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].length < 20 && i < raw.length - 1) {
      merged.push(raw[i] + ' ' + raw[i + 1])
      i++ // skip next
    } else {
      merged.push(raw[i])
    }
  }
  return merged
}

// ─── Markdown render components ───────────────────────────────────────────────
// Shared across all assistant messages for a consistent look.
const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  p: ({ children }) => (
    <p style={{ margin: '0 0 6px 0', lineHeight: 1.6 }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: '#ffffff', fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: '#c8c8d4', fontStyle: 'italic' }}>{children}</em>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '18px', margin: '6px 0', listStyleType: 'disc' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '18px', margin: '6px 0' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '5px', lineHeight: 1.55 }}>{children}</li>
  ),
  code: ({ children }) => (
    <code
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '4px',
        padding: '1px 5px',
        fontFamily: 'monospace',
        fontSize: '0.88em',
        color: '#a8d8ff',
      }}
    >
      {children}
    </code>
  ),
  h1: ({ children }) => (
    <h1 style={{ fontSize: '1.1em', fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '1.05em', fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '1em', fontWeight: 600, margin: '6px 0 3px', color: '#e0e0f0' }}>
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid rgba(255,255,255,0.25)',
        paddingLeft: '10px',
        margin: '6px 0',
        color: '#aaa',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
  ),
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TalkModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  // ── Chat state ───────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ── Voice / TTS state ────────────────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  // Index of the message currently being spoken (for active sentence highlight)
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null)

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceCreatedRef = useRef(false)
  const currentBlobUrlRef = useRef<string | null>(null)
  // Queue of sentence chunks to speak sequentially
  const ttsQueueRef = useRef<string[]>([])
  const isSpeakingQueueRef = useRef(false)

  // ── Initialise Web Audio pipeline ───────────────────────────────────────────
  const initAudioPipeline = useCallback(() => {
    if (audioCtxRef.current) return

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio

    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.82
    analyser.connect(ctx.destination)

    audioCtxRef.current = ctx
    analyserRef.current = analyser

    if (!sourceCreatedRef.current) {
      const source = ctx.createMediaElementSource(audio)
      source.connect(analyser)
      sourceCreatedRef.current = true
    }

    audio.addEventListener('play', () => setIsSpeaking(true))
    audio.addEventListener('ended', () => {
      setIsSpeaking(false)
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current)
        currentBlobUrlRef.current = null
      }
      // Play next chunk in queue
      playNextInQueue()
    })
    audio.addEventListener('pause', () => setIsSpeaking(false))
    audio.addEventListener('error', () => {
      setIsSpeaking(false)
      playNextInQueue()
    })
  }, [])

  // ── TTS sentence queue ───────────────────────────────────────────────────────
  const playNextInQueue = useCallback(async () => {
    if (ttsQueueRef.current.length === 0) {
      isSpeakingQueueRef.current = false
      setSpeakingMsgIndex(null)
      return
    }

    const sentence = ttsQueueRef.current.shift()!
    if (!sentence.trim()) {
      playNextInQueue()
      return
    }

    try {
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume()
      }

      const response = await axios.post(
        `${API_BASE}/api/tts`,
        { text: sentence },
        { responseType: 'blob', timeout: 30_000 }
      )

      const blob = new Blob([response.data], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current)
      }
      currentBlobUrlRef.current = url

      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
      }
    } catch {
      // Skip failed chunk and continue queue
      playNextInQueue()
    }
  }, [])

  // ── Speak a full reply (split into sentences, queue them) ───────────────────
  const speakText = useCallback(
    (text: string, msgIndex: number) => {
      if (!ttsEnabled) return

      // Cancel any existing queue
      ttsQueueRef.current = []
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      const sentences = splitIntoSentences(text)
      if (sentences.length === 0) return

      ttsQueueRef.current = sentences
      isSpeakingQueueRef.current = true
      setSpeakingMsgIndex(msgIndex)

      playNextInQueue()
    },
    [ttsEnabled, playNextInQueue]
  )

  // ── Stop all audio ───────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    ttsQueueRef.current = []
    isSpeakingQueueRef.current = false
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
    setSpeakingMsgIndex(null)
  }, [])

  // ── Modal open / close ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      initAudioPipeline()
      inputRef.current?.focus()
      if (messages.length === 0) {
        const greeting: Message = {
          role: 'assistant',
          content:
            "Hey! I'm Khelan's AI avatar. Ask me anything about his work in energy modeling, sustainability, full-stack development, or just chat! I'll respond as Khelan would.",
          timestamp: new Date(),
        }
        setMessages([greeting])
        setTimeout(() => speakText(greeting.content, 0), 600)
      }
    } else {
      stopSpeaking()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    stopSpeaking()

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_BASE}/api/chat`, {
        message: userMessage.content,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      })

      const reply: string = res.data.reply

      const assistantMessage: Message = {
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const next = [...prev, assistantMessage]
        // Speak using the index of the newly added message
        setTimeout(() => speakText(reply, next.length - 1), 80)
        return next
      })
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Hmm, I'm having trouble connecting right now. Make sure the backend server is running on port 3001 and your OpenAI API key is configured.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div
                  className={`${styles.statusDot} ${isSpeaking ? styles.speaking : isLoading ? styles.loading : ''
                    }`}
                />
                <div>
                  <h3 className={styles.headerTitle}>Talk with Khelan</h3>
                  <p className={styles.headerSub}>
                    {isSpeaking
                      ? 'speaking…'
                      : isLoading
                        ? 'thinking…'
                        : 'AI-powered conversation'}
                  </p>
                </div>
              </div>

              <div className={styles.headerRight}>
                {/* TTS toggle */}
                <button
                  className={`${styles.ttsToggle} ${ttsEnabled ? styles.ttsOn : ''}`}
                  onClick={() => {
                    if (ttsEnabled) stopSpeaking()
                    setTtsEnabled((v) => !v)
                  }}
                  title={ttsEnabled ? 'Voice on — click to mute' : 'Voice off — click to enable'}
                >
                  {ttsEnabled ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  )}
                </button>

                <button className={styles.closeBtn} onClick={onClose}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Sound Visualizer ─────────────────────────────────────────── */}
            <SoundVisualizer
              analyserNode={analyserRef.current}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
            />

            {/* ── Messages ───────────────────────────────────────────────────── */}
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`${styles.message} ${styles[msg.role]}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`${styles.messageBubble} ${speakingMsgIndex === i ? styles.speakingBubble : ''
                      }`}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown components={mdComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Speaking indicator bar under active assistant message */}
                  {msg.role === 'assistant' && speakingMsgIndex === i && (
                    <motion.div
                      className={styles.speakingBar}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  )}

                  <span className={styles.messageTime}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  className={`${styles.message} ${styles.assistant}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className={styles.messageBubble}>
                    <div className={styles.typing}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ──────────────────────────────────────────────────────── */}
            <div className={styles.inputSection}>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                disabled={isLoading}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}