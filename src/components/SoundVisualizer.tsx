import { useRef, useEffect, useCallback } from 'react'
import styles from './SoundVisualizer.module.css'

interface SoundVisualizerProps {
  analyserNode: AnalyserNode | null
  isLoading: boolean
  isSpeaking: boolean
}

export default function SoundVisualizer({ analyserNode, isLoading, isSpeaking }: SoundVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const phaseRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    // Clear
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, W, H)

    const BAR_COUNT = 80
    const barW = W / BAR_COUNT

    phaseRef.current += isSpeaking ? 0.035 : isLoading ? 0.055 : 0.012

    if (analyserNode && isSpeaking) {
      // ── Real-time frequency data ──────────────────────────────────────────
      const bufLen = analyserNode.frequencyBinCount
      const freqData = new Uint8Array(bufLen)
      analyserNode.getByteFrequencyData(freqData)

      for (let i = 0; i < BAR_COUNT; i++) {
        // Sample from lower 70% of freq spectrum (most voice-relevant)
        const srcIdx = Math.floor((i / BAR_COUNT) * bufLen * 0.7)
        const magnitude = freqData[srcIdx] / 255

        const bH = Math.max(2, magnitude * H * 0.88)
        const y = (H - bH) / 2

        // Distance from center drives brightness
        const distCenter = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)
        const opacity = (1 - distCenter * 0.4) * (0.35 + magnitude * 0.65)

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(3)})`
        ctx.fillRect(i * barW + 1, y, barW - 2, bH)
      }
    } else if (isLoading) {
      // ── Thinking ripple wave ──────────────────────────────────────────────
      const t = phaseRef.current
      for (let i = 0; i < BAR_COUNT; i++) {
        const wave = Math.sin(i * 0.28 + t) * Math.cos(i * 0.09 - t * 0.6)
        const bH = Math.max(2, (0.04 + Math.abs(wave) * 0.28) * H)
        const y = (H - bH) / 2
        const opacity = 0.12 + Math.abs(wave) * 0.38

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(3)})`
        ctx.fillRect(i * barW + 1, y, barW - 2, bH)
      }
    } else {
      // ── Idle heartbeat ─────────────────────────────────────────────────────
      const pulse = (Math.sin(phaseRef.current * 1.8) + 1) / 2
      for (let i = 0; i < BAR_COUNT; i++) {
        const distCenter = 1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)
        const bH = Math.max(1, (0.008 + distCenter * pulse * 0.055) * H)
        const y = (H - bH) / 2
        const opacity = 0.06 + distCenter * pulse * 0.14

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(3)})`
        ctx.fillRect(i * barW + 1, y, barW - 2, bH)
      }
    }

    animRef.current = requestAnimationFrame(draw)
  }, [analyserNode, isLoading, isSpeaking])

  // Start/restart animation loop whenever deps change
  useEffect(() => {
    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  // Sync canvas pixel buffer to CSS layout size on mount + resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const sync = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }

    sync()

    const ro = new ResizeObserver(sync)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className={[
        styles.wrapper,
        isSpeaking ? styles.speaking : '',
        isLoading ? styles.loading : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Centre overlay: monogram + status badge */}
      <div className={styles.centerOverlay}>
        <div
          className={[
            styles.avatarRing,
            isSpeaking ? styles.ringSpeaking : '',
            isLoading ? styles.ringLoading : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles.monogram}>K</span>
        </div>
        <span className={styles.statusLabel}>
          {isLoading ? 'THINKING' : isSpeaking ? 'SPEAKING' : 'READY'}
        </span>
      </div>

      {/* Ambient outer glow when speaking */}
      {isSpeaking && <div className={styles.outerGlow} />}
    </div>
  )
}
