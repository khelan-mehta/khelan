import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'https://portfoliobe-ebon.vercel.app'

export default function GitHubCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Connecting to GitHub...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (!code || !state) {
      setStatus('Missing authorization code.')
      return
    }

    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/github/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        })
        const data = await res.json()
        if (data.username) {
          sessionStorage.setItem('github_connected', 'true')
          sessionStorage.setItem('github_username', data.username)
          setStatus(`Connected as ${data.username}! Redirecting...`)
          setTimeout(() => navigate('/admin'), 1500)
        } else {
          setStatus('GitHub connection failed.')
        }
      } catch {
        setStatus('Something went wrong. Please try again.')
      }
    })()
  }, [navigate])

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
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--gray-200)',
            borderTopColor: 'var(--black)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 24px',
          }}
        />
        <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--black)' }}>{status}</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
