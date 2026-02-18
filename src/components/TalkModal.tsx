import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import styles from './TalkModal.module.css'
import SoundVisualizer from './SoundVisualizer'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Audio pipeline helpers ────────────────────────────────────────────────────
// We create one AudioContext and one AnalyserNode for the lifetime of the modal.
// The MediaElementAudioSourceNode wraps the <audio> element and can only be
// created once per element, so we guard with a ref flag.

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

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Hidden <audio> element for TTS playback
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Web Audio pipeline (stable across renders)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceCreatedRef = useRef(false)
  const currentBlobUrlRef = useRef<string | null>(null)

  // ── Initialise Web Audio pipeline ───────────────────────────────────────────
  const initAudioPipeline = useCallback(() => {
    if (audioCtxRef.current) return // already set up

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

    // Connect the <audio> element to the analyser (only once)
    if (!sourceCreatedRef.current) {
      const source = ctx.createMediaElementSource(audio)
      source.connect(analyser)
      sourceCreatedRef.current = true
    }

    // Wire playback events
    audio.addEventListener('play', () => setIsSpeaking(true))
    audio.addEventListener('ended', () => {
      setIsSpeaking(false)
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current)
        currentBlobUrlRef.current = null
      }
    })
    audio.addEventListener('pause', () => setIsSpeaking(false))
    audio.addEventListener('error', () => setIsSpeaking(false))
  }, [])

  // ── Generate TTS and play ────────────────────────────────────────────────────
  const speakText = useCallback(
    async (text: string) => {
      if (!ttsEnabled) return

      try {
        // Resume AudioContext if browser suspended it (autoplay policy)
        if (audioCtxRef.current?.state === 'suspended') {
          await audioCtxRef.current.resume()
        }

        const response = await axios.post(
          `${API_BASE}/api/tts`,
          { text },
          { responseType: 'blob', timeout: 30000 }
        )

        const blob = new Blob([response.data], { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)

        // Revoke any previously pending blob URL
        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current)
        }
        currentBlobUrlRef.current = url

        if (audioRef.current) {
          audioRef.current.src = url
          await audioRef.current.play()
        }
      } catch {
        // TTS is non-critical — fail silently so chat still works
        setIsSpeaking(false)
      }
    },
    [ttsEnabled]
  )

  // ── Stop any in-progress audio ───────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
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
        // Speak the greeting
        setTimeout(() => speakText(greeting.content), 600)
      }
    } else {
      stopSpeaking()
    }
  }, [isOpen]) // intentional: only fire on open/close

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

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)

      // Speak the response in parallel with rendering the text
      speakText(reply)
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
                  className={`${styles.statusDot} ${
                    isSpeaking ? styles.speaking : isLoading ? styles.loading : ''
                  }`}
                />
                <div>
                  <h3 className={styles.headerTitle}>Talk with Khelan</h3>
                  <p className={styles.headerSub}>
                    {isSpeaking ? 'speaking…' : isLoading ? 'thinking…' : 'AI-powered conversation'}
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  )}
                </button>

                <button className={styles.closeBtn} onClick={onClose}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Sound Visualizer (replaces video) ────────────────────────── */}
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
                  <div className={styles.messageBubble}>{msg.content}</div>
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
