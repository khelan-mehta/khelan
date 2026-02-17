import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import styles from './Admin.module.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [contextText, setContextText] = useState('')
  const [contextSaved, setContextSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (token) {
      setIsAuthenticated(true)
      fetchCurrentState(token)
    }
  }, [])

  const fetchCurrentState = async (token: string) => {
    try {
      const [videoRes, contextRes] = await Promise.all([
        axios.get(`${API_BASE}/api/video`),
        axios.get(`${API_BASE}/api/admin/context`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      if (videoRes.data.videoUrl) {
        setCurrentVideo(`${API_BASE}${videoRes.data.videoUrl}`)
      }
      if (contextRes.data.context) {
        setContextText(contextRes.data.context)
      }
    } catch {}
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await axios.post(`${API_BASE}/api/admin/login`, { password })
      sessionStorage.setItem('admin_token', res.data.token)
      setIsAuthenticated(true)
      fetchCurrentState(res.data.token)
    } catch {
      setLoginError('Invalid password')
    }
  }

  const handleUpload = async () => {
    if (!videoFile) return
    setUploading(true)
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append('video', videoFile)

    try {
      const token = sessionStorage.getItem('admin_token')
      const res = await axios.post(`${API_BASE}/api/admin/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      setCurrentVideo(`${API_BASE}${res.data.videoUrl}`)
      setUploadSuccess(true)
      setVideoFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      alert('Upload failed. Check server connection.')
    } finally {
      setUploading(false)
    }
  }

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

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setPassword('')
  }

  // Login Screen
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

  // Admin Dashboard
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Admin Dashboard</h1>
          <p className={styles.dashSub}>Manage your AI avatar video and context</p>
        </div>
        <div className={styles.dashActions}>
          <a href="/" className={styles.viewSiteBtn}>View Site ↗</a>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Video Upload Section */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className={styles.cardTitle}>AI Avatar Video</h2>
          <p className={styles.cardDesc}>
            Upload a video of yourself that will play when visitors interact with your AI avatar. 
            This video loops while the AI generates responses to create the illusion of a live conversation.
          </p>

          {currentVideo && (
            <div className={styles.currentVideo}>
              <video src={currentVideo} controls className={styles.videoPreview} />
              <span className={styles.videoLabel}>Current video</span>
            </div>
          )}

          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className={styles.fileInput}
              id="videoUpload"
            />
            <label htmlFor="videoUpload" className={styles.uploadLabel}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{videoFile ? videoFile.name : 'Choose video file'}</span>
            </label>

            {videoFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={styles.uploadBtn}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            )}

            {uploadSuccess && (
              <motion.p
                className={styles.success}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Video uploaded successfully!
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* AI Context Section */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            <span className={styles.charCount}>
              {contextText.length} characters
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
