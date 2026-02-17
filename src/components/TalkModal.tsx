import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import styles from './TalkModal.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function TalkModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchVideo()
      inputRef.current?.focus()
      if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content:
              "Hey! I'm Khelan's AI avatar. Ask me anything about his work in energy modeling, sustainability, full-stack development, or just chat! I'll respond as Khelan would.",
            timestamp: new Date(),
          },
        ])
      }
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchVideo = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/video`)
      if (res.data.videoUrl) {
        setVideoUrl(`${API_BASE}${res.data.videoUrl}`)
      }
    } catch {
      // No video uploaded yet
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Play video while "thinking"
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
      setIsVideoPlaying(true)
    }

    try {
      const res = await axios.post(`${API_BASE}/api/chat`, {
        message: input.trim(),
        history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Keep video playing for a bit after response
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause()
          setIsVideoPlaying(false)
        }
      }, 2000)
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Hmm, I'm having trouble connecting right now. Make sure the backend server is running on port 3001 and your OpenAI API key is configured.",
          timestamp: new Date(),
        },
      ])
      if (videoRef.current) {
        videoRef.current.pause()
        setIsVideoPlaying(false)
      }
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
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={`${styles.statusDot} ${isVideoPlaying ? styles.active : ''}`} />
                <div>
                  <h3 className={styles.headerTitle}>Talk with Khelan</h3>
                  <p className={styles.headerSub}>AI-powered conversation</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Video Section */}
            <div className={styles.videoSection}>
              {videoUrl ? (
                <video
                  ref={videoRef}
                  className={styles.video}
                  src={videoUrl}
                  loop
                  muted
                  playsInline
                />
              ) : (
                <div className={styles.avatarFallback}>
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="40" r="20" stroke="white" strokeWidth="1.5" />
                    <path d="M20 90 C20 70 35 55 50 55 C65 55 80 70 80 90" stroke="white" strokeWidth="1.5" fill="none" />
                  </svg>
                  <span className={styles.avatarLabel}>Upload video in /admin</span>
                </div>
              )}
              <div className={`${styles.videoGlow} ${isVideoPlaying ? styles.active : ''}`} />
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`${styles.message} ${styles[msg.role]}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.messageBubble}>
                    {msg.content}
                  </div>
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
                      <span /><span /><span />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputSection}>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
