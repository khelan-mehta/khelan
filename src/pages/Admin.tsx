import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Save, Upload, Trash2, Play, Volume2, LogIn } from 'lucide-react'

const API_BASE = 'https://portfoliobe-ebon.vercel.app'

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [context, setContext] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('nova')
  const [speed, setSpeed] = useState(1)
  const [voiceSamples, setVoiceSamples] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [previewText, setPreviewText] = useState('Hello, this is a voice preview.')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (token) loadData()
  }, [token])

  const login = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        sessionStorage.setItem('admin_token', data.token)
        setLoginError('')
      } else {
        setLoginError('Invalid password')
      }
    } catch {
      setLoginError('Connection failed')
    }
  }

  const loadData = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [ctxRes, voiceRes, samplesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/context`, { headers }),
        fetch(`${API_BASE}/api/admin/voice-config`, { headers }),
        fetch(`${API_BASE}/api/admin/voice-samples`, { headers }),
      ])
      const ctxData = await ctxRes.json()
      const voiceData = await voiceRes.json()
      const samplesData = await samplesRes.json()

      if (ctxData.context) setContext(ctxData.context)
      if (voiceData.selectedVoice) setSelectedVoice(voiceData.selectedVoice)
      if (voiceData.speed) setSpeed(voiceData.speed)
      if (samplesData.samples) setVoiceSamples(samplesData.samples)
    } catch {}
  }

  const saveContext = async () => {
    setSaving(true)
    try {
      await fetch(`${API_BASE}/api/admin/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ context }),
      })
    } catch {}
    setSaving(false)
  }

  const saveVoiceConfig = async () => {
    setSaving(true)
    try {
      await fetch(`${API_BASE}/api/admin/voice-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ selectedVoice, speed }),
      })
    } catch {}
    setSaving(false)
  }

  const uploadSamples = async (files: FileList) => {
    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append('audio', f))
    try {
      await fetch(`${API_BASE}/api/admin/upload-voice`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      loadData()
    } catch {}
  }

  const deleteSample = async (filename: string) => {
    try {
      await fetch(`${API_BASE}/api/admin/voice-samples/${filename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setVoiceSamples(voiceSamples.filter((s) => s !== filename))
    } catch {}
  }

  const previewVoice = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.play()
    } catch {}
  }

  if (!token) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--white)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: 40,
            border: '1px solid var(--gray-200)',
            borderRadius: 16,
            margin: 24,
          }}
        >
          <Lock size={24} style={{ marginBottom: 24 }} />
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Admin Access</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 32 }}>
            Enter your password to continue.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--gray-200)',
              borderRadius: 10,
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              outline: 'none',
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />

          {loginError && (
            <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{loginError}</p>
          )}

          <button
            onClick={login}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--black)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <LogIn size={16} />
            Sign in
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Admin Dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 48 }}>
          Manage your AI voice, context, and voice samples.
        </p>

        {/* AI Context */}
        <section style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>AI Context / Personality</h2>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              padding: 16,
              border: '1px solid var(--gray-200)',
              borderRadius: 10,
              fontSize: 14,
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.7,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={saveContext}
            disabled={saving}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: 'var(--black)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Context'}
          </button>
        </section>

        {/* Voice Config */}
        <section style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Voice Configuration</h2>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 8, display: 'block' }}>
              Voice
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVoice(v)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--gray-200)',
                    background: selectedVoice === v ? 'var(--black)' : 'var(--white)',
                    color: selectedVoice === v ? 'var(--white)' : 'var(--gray-600)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 8, display: 'block' }}>
              Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#000' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <input
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--gray-200)',
                borderRadius: 8,
                fontSize: 13,
                outline: 'none',
                minWidth: 200,
              }}
            />
            <button
              onClick={previewVoice}
              style={{
                padding: '10px 16px',
                border: '1px solid var(--gray-200)',
                borderRadius: 8,
                background: 'var(--white)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Play size={14} />
              Preview
            </button>
          </div>

          <button
            onClick={saveVoiceConfig}
            disabled={saving}
            style={{
              padding: '10px 20px',
              background: 'var(--black)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Voice Config'}
          </button>
        </section>

        {/* Voice Samples */}
        <section style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Voice Samples</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && uploadSamples(e.target.files)}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '10px 20px',
              border: '1px dashed var(--gray-300)',
              borderRadius: 8,
              background: 'var(--gray-50)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              color: 'var(--gray-600)',
            }}
          >
            <Upload size={14} />
            Upload samples (max 5)
          </button>

          {voiceSamples.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No voice samples uploaded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {voiceSamples.map((s) => (
                <div
                  key={s}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Volume2 size={14} color="var(--gray-400)" />
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{s}</span>
                  </div>
                  <button
                    onClick={() => deleteSample(s)}
                    style={{
                      padding: 4,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--gray-400)',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
