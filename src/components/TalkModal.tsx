import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Volume2, VolumeX } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import SoundVisualizer from './SoundVisualizer'

const API_BASE = 'https://portfoliobe-ebon.vercel.app'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TalkModalProps {
  open: boolean
  onClose: () => void
}

export default function TalkModal({ open, onClose }: TalkModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [visualizerState, setVisualizerState] = useState<'idle' | 'thinking' | 'speaking'>('idle')
  const [pendingText, setPendingText] = useState<string | null>(null)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, pendingText])

  useEffect(() => {
    if (open && messages.length === 0) {
      greet()
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      audioContextRef.current = ctx
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return { ctx: audioContextRef.current, analyser: analyserRef.current! }
  }

  const playTTS = useCallback(async (text: string) => {
    if (!ttsEnabled) return
    try {
      const { ctx, analyser } = ensureAudioContext()
      setVisualizerState('speaking')

      const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const arrayBuffer = await res.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(analyser)
      analyser.connect(ctx.destination)

      source.onended = () => {
        setVisualizerState('idle')
        if (pendingText) {
          setPendingText(null)
        }
      }

      source.start(0)
    } catch {
      setVisualizerState('idle')
    }
  }, [ttsEnabled, pendingText])

  const greet = async () => {
    setLoading(true)
    setVisualizerState('thinking')
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello!', history: [] }),
      })
      const data = await res.json()
      const reply = data.reply || 'Hi there!'
      setMessages([{ role: 'assistant', content: reply }])
      playTTS(reply)
    } catch {
      setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }])
      setVisualizerState('idle')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setVisualizerState('thinking')

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.reply || "Sorry, I couldn't understand that."
      setMessages([...newMessages, { role: 'assistant', content: reply }])
      playTTS(reply)
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
      setVisualizerState('idle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '80vh',
              background: 'var(--white)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--gray-200)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.12)',
              margin: 16,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid var(--gray-100)',
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--black)', fontFamily: 'var(--font-display)' }}>
                  Khelan's AI
                </h3>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Ask me anything</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--gray-200)',
                    background: 'transparent',
                    color: ttsEnabled ? 'var(--black)' : 'var(--gray-400)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={onClose}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--gray-200)',
                    background: 'transparent',
                    color: 'var(--gray-500)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Visualizer */}
            <div style={{ borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}>
              <SoundVisualizer analyser={analyserRef.current} state={visualizerState} />
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                minHeight: 200,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user' ? 'var(--black)' : 'var(--gray-100)',
                      color: msg.role === 'user' ? 'var(--white)' : 'var(--black)',
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                          code: ({ children }) => (
                            <code
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                background: 'var(--gray-200)',
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--gray-400)',
                      }}
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--gray-100)',
                display: 'flex',
                gap: 8,
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--gray-200)',
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  background: 'var(--gray-50)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--gray-400)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--gray-200)')}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: input.trim() ? 'var(--black)' : 'var(--gray-200)',
                  color: input.trim() ? 'var(--white)' : 'var(--gray-400)',
                  transition: 'background 0.2s, color 0.2s',
                  flexShrink: 0,
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
