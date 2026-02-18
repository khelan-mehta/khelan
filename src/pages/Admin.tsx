import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import styles from './Admin.module.css'

const API_BASE = "https://portfoliobe-ebon.vercel.app"

const VOICE_OPTIONS = [
  { id: 'alloy',   label: 'Alloy',   desc: 'Neutral, versatile' },
  { id: 'echo',    label: 'Echo',    desc: 'Balanced, clear' },
  { id: 'fable',   label: 'Fable',   desc: 'Expressive, British' },
  { id: 'onyx',    label: 'Onyx',    desc: 'Deep, authoritative' },
  { id: 'nova',    label: 'Nova',    desc: 'Friendly, warm' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft, gentle' },
]

interface VoiceSample {
  filename: string
  size: number
  url: string
  uploadedAt: string
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Context
  const [contextText, setContextText] = useState('')
  const [contextSaved, setContextSaved] = useState(false)

  // Voice config
  const [selectedVoice, setSelectedVoice] = useState('onyx')
  const [voiceSpeed, setVoiceSpeed] = useState(1.0)
  const [voiceConfigSaved, setVoiceConfigSaved] = useState(false)

  // Voice samples
  const [voiceFiles, setVoiceFiles] = useState<File[]>([])
  const [uploadingVoice, setUploadingVoice] = useState(false)
  const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([])
  const [voiceUploadMsg, setVoiceUploadMsg] = useState('')

  // Preview playback
  const [previewLoading, setPreviewLoading] = useState(false)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const voiceFileInputRef = useRef<HTMLInputElement>(null)

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (token) {
      setIsAuthenticated(true)
      fetchAll(token)
    }
  }, [])

  const fetchAll = async (token: string) => {
    try {
      const [contextRes, voiceCfgRes, voiceSamplesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/context`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/admin/voice-config`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/admin/voice-samples`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (contextRes.data.context) setContextText(contextRes.data.context)
      if (voiceCfgRes.data.selectedVoice) setSelectedVoice(voiceCfgRes.data.selectedVoice)
      if (voiceCfgRes.data.speed) setVoiceSpeed(voiceCfgRes.data.speed)
      if (voiceSamplesRes.data.samples) setVoiceSamples(voiceSamplesRes.data.samples)
    } catch {}
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await axios.post(`${API_BASE}/api/admin/login`, { password })
      sessionStorage.setItem('admin_token', res.data.token)
      setIsAuthenticated(true)
      fetchAll(res.data.token)
    } catch {
      setLoginError('Invalid password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setPassword('')
  }

  // ── Context save ────────────────────────────────────────────────────────────
  const handleSaveContext = async () => {
    try {
      const token = sessionStorage.getItem('admin_token')
      await axios.post(
        `${API_BASE}/api/admin/context`,
        { context: contextText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setContextSaved(true)
      setTimeout(() => setContextSaved(false), 2000)
    } catch {
      alert('Failed to save context')
    }
  }

  // ── Voice config save ───────────────────────────────────────────────────────
  const handleSaveVoiceConfig = async () => {
    try {
      const token = sessionStorage.getItem('admin_token')
      await axios.post(
        `${API_BASE}/api/admin/voice-config`,
        { selectedVoice, speed: voiceSpeed },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setVoiceConfigSaved(true)
      setTimeout(() => setVoiceConfigSaved(false), 2000)
    } catch {
      alert('Failed to save voice config')
    }
  }

  // ── Voice sample upload ──────────────────────────────────────────────────────
  const handleVoiceUpload = async () => {
    if (voiceFiles.length === 0) return
    setUploadingVoice(true)
    setVoiceUploadMsg('')

    const formData = new FormData()
    voiceFiles.forEach((f) => formData.append('voice', f))

    try {
      const token = sessionStorage.getItem('admin_token')
      const res = await axios.post(`${API_BASE}/api/admin/upload-voice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      setVoiceUploadMsg(res.data.message)
      setVoiceFiles([])
      if (voiceFileInputRef.current) voiceFileInputRef.current.value = ''
      // Refresh sample list
      const token2 = sessionStorage.getItem('admin_token')!
      const samplesRes = await axios.get(`${API_BASE}/api/admin/voice-samples`, {
        headers: { Authorization: `Bearer ${token2}` },
      })
      setVoiceSamples(samplesRes.data.samples || [])
    } catch {
      setVoiceUploadMsg('Upload failed. Check server connection.')
    } finally {
      setUploadingVoice(false)
    }
  }

  // ── Delete voice sample ─────────────────────────────────────────────────────
  const handleDeleteSample = async (filename: string) => {
    try {
      const token = sessionStorage.getItem('admin_token')
      await axios.delete(`${API_BASE}/api/admin/voice-samples/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setVoiceSamples((prev) => prev.filter((s) => s.filename !== filename))
    } catch {
      alert('Failed to delete sample')
    }
  }

  // ── Preview voice via TTS ────────────────────────────────────────────────────
  const handlePreviewVoice = async () => {
    setPreviewLoading(true)
    try {
      const res = await axios.post(
        `${API_BASE}/api/tts`,
        { text: "Hey! I'm Khelan Mehta — energy modeler, developer, and sustainability enthusiast. Great to meet you!" },
        { responseType: 'blob' }
      )
      const url = URL.createObjectURL(new Blob([res.data], { type: 'audio/mpeg' }))
      if (previewAudioRef.current) {
        previewAudioRef.current.src = url
        previewAudioRef.current.play()
        previewAudioRef.current.onended = () => URL.revokeObjectURL(url)
      } else {
        const a = new Audio(url)
        previewAudioRef.current = a
        a.play()
        a.onended = () => URL.revokeObjectURL(url)
      }
    } catch {
      alert('Preview failed — check server connection and OPENAI_API_KEY.')
    } finally {
      setPreviewLoading(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const formatBytes = (b: number) => {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className={styles.loginPage}>
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.loginLogo}>K</div>
          <h1 className={styles.loginTitle}>Admin Access</h1>
          <p className={styles.loginSub}>Enter password to manage your portfolio</p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              className={styles.loginInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
            />
            {loginError && <p className={styles.error}>{loginError}</p>}
            <button type="submit" className={styles.loginBtn}>
              <span>Authenticate</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <a href="/" className={styles.backLink}>← Back to Portfolio</a>
        </motion.div>
      </div>
    )
  }

  // ── Admin Dashboard ───────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Admin Dashboard</h1>
          <p className={styles.dashSub}>Manage AI voice, avatar & context</p>
        </div>
        <div className={styles.dashActions}>
          <a href="/" className={styles.viewSiteBtn}>View Site ↗</a>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div className={styles.grid}>

        {/* ── VOICE AI SECTION ──────────────────────────────────────────────── */}
        <motion.div
          className={`${styles.card} ${styles.voiceCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className={styles.cardBadge}>NEW</div>
          <h2 className={styles.cardTitle}>Voice AI Replication</h2>
          <p className={styles.cardDesc}>
            Upload audio recordings of your voice (30 sec – 5 min each, up to 5 files).
            Select the OpenAI voice that best matches yours, then save. Your AI avatar
            will speak every response in that voice. For highest fidelity, record yourself
            speaking naturally in a quiet environment.
          </p>

          {/* Upload audio samples */}
          <div className={styles.sectionLabel}>Step 1 — Upload Voice Samples</div>
          <div className={styles.uploadArea}>
            <input
              ref={voiceFileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.webm"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setVoiceFiles(files.slice(0, 5))
              }}
              className={styles.fileInput}
              id="voiceUpload"
            />
            <label htmlFor="voiceUpload" className={styles.uploadLabel}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span>
                {voiceFiles.length > 0
                  ? `${voiceFiles.length} file${voiceFiles.length > 1 ? 's' : ''} selected`
                  : 'Choose audio files (mp3, wav, m4a, ogg…)'}
              </span>
            </label>

            {voiceFiles.length > 0 && (
              <div className={styles.fileList}>
                {voiceFiles.map((f, i) => (
                  <div key={i} className={styles.fileItem}>
                    <span className={styles.fileName}>{f.name}</span>
                    <span className={styles.fileSize}>{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
            )}

            {voiceFiles.length > 0 && (
              <button
                onClick={handleVoiceUpload}
                disabled={uploadingVoice}
                className={styles.uploadBtn}
              >
                {uploadingVoice ? 'Uploading…' : `Upload ${voiceFiles.length} Sample${voiceFiles.length > 1 ? 's' : ''}`}
              </button>
            )}

            {voiceUploadMsg && (
              <motion.p
                className={voiceUploadMsg.includes('fail') ? styles.errorMsg : styles.success}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {voiceUploadMsg}
              </motion.p>
            )}
          </div>

          {/* Existing samples */}
          {voiceSamples.length > 0 && (
            <div className={styles.samplesSection}>
              <div className={styles.sectionLabel}>Uploaded Samples ({voiceSamples.length})</div>
              <div className={styles.sampleList}>
                {voiceSamples.map((s) => (
                  <div key={s.filename} className={styles.sampleItem}>
                    <audio
                      src={`${API_BASE}${s.url}`}
                      controls
                      className={styles.audioPlayer}
                    />
                    <div className={styles.sampleMeta}>
                      <span className={styles.sampleName}>{s.filename}</span>
                      <span className={styles.sampleSize}>{formatBytes(s.size)}</span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteSample(s.filename)}
                      title="Delete sample"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice selection */}
          <div className={styles.sectionLabel} style={{ marginTop: '24px' }}>Step 2 — Select Voice Profile</div>
          <p className={styles.sectionHint}>
            Listen to each preview, then select the voice that most closely matches your recording.
            This voice will be used for all AI responses.
          </p>
          <div className={styles.voiceGrid}>
            {VOICE_OPTIONS.map((v) => (
              <button
                key={v.id}
                className={`${styles.voiceOption} ${selectedVoice === v.id ? styles.voiceSelected : ''}`}
                onClick={() => setSelectedVoice(v.id)}
              >
                <span className={styles.voiceName}>{v.label}</span>
                <span className={styles.voiceDesc}>{v.desc}</span>
              </button>
            ))}
          </div>

          {/* Speed control */}
          <div className={styles.speedRow}>
            <label className={styles.speedLabel}>
              Speed: <strong>{voiceSpeed.toFixed(2)}×</strong>
            </label>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className={styles.speedSlider}
            />
            <span className={styles.speedHint}>0.7× — 1.3×</span>
          </div>

          {/* Preview + Save */}
          <div className={styles.voiceActions}>
            <button
              className={styles.previewBtn}
              onClick={handlePreviewVoice}
              disabled={previewLoading}
            >
              {previewLoading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinIcon}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Preview Voice
                </>
              )}
            </button>

            <button onClick={handleSaveVoiceConfig} className={styles.saveBtn}>
              {voiceConfigSaved ? '✓ Saved!' : 'Save Voice Config'}
            </button>
          </div>
        </motion.div>

        {/* ── AI CONTEXT ─────────────────────────────────────────────────────── */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className={styles.cardTitle}>AI Personality Context</h2>
          <p className={styles.cardDesc}>
            Add additional context about yourself that the AI will use to answer questions.
            This supplements the default context from your resume. Include personal interests,
            communication style, opinions, hobbies, or anything that makes conversations feel authentic.
          </p>

          <textarea
            className={styles.contextInput}
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder={`Example:\n- I love reading sci-fi novels, especially Asimov\n- I'm passionate about net-zero buildings\n- I communicate in a friendly, casual way\n- My dream is to build India's first net-zero campus\n- I enjoy playing cricket on weekends`}
            rows={12}
          />

          <div className={styles.contextActions}>
            <button onClick={handleSaveContext} className={styles.saveBtn}>
              {contextSaved ? '✓ Saved!' : 'Save Context'}
            </button>
            <span className={styles.charCount}>{contextText.length} characters</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}