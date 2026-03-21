import { useRef, useEffect, useCallback } from 'react'

interface SoundVisualizerProps {
  analyser: AnalyserNode | null
  state: 'idle' | 'thinking' | 'speaking'
}

export default function SoundVisualizer({ analyser, state }: SoundVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2

    ctx.clearRect(0, 0, w, h)
    timeRef.current += 0.016

    if (state === 'speaking' && analyser) {
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      const barCount = 64
      const barWidth = 3
      const maxBarHeight = h * 0.4
      const totalWidth = barCount * (barWidth + 2)
      const startX = (w - totalWidth) / 2

      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[index] / 255
        const barHeight = Math.max(2, value * maxBarHeight)

        const x = startX + i * (barWidth + 2)
        const y = cy - barHeight / 2

        const alpha = 0.3 + value * 0.7
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
        ctx.fillRect(x, y, barWidth, barHeight)
      }

      // Center circle pulse
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255
      const radius = 20 + avg * 30
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + avg * 0.1})`
      ctx.fill()

    } else if (state === 'thinking') {
      // Ripple animation
      const rippleCount = 3
      for (let i = 0; i < rippleCount; i++) {
        const phase = (timeRef.current * 2 + i * 1.2) % 3
        const radius = 10 + phase * 40
        const alpha = Math.max(0, 0.3 - phase * 0.1)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fill()

    } else {
      // Idle: gentle heartbeat / breathing
      const scale = 1 + Math.sin(timeRef.current * 1.5) * 0.15
      const radius = 16 * scale

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fill()

      // Subtle orbiting dots
      for (let i = 0; i < 3; i++) {
        const angle = timeRef.current * 0.8 + (i * Math.PI * 2) / 3
        const orbitRadius = 30 + Math.sin(timeRef.current + i) * 5
        const dotX = cx + Math.cos(angle) * orbitRadius
        const dotY = cy + Math.sin(angle) * orbitRadius
        ctx.beginPath()
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
        ctx.fill()
      }
    }

    animRef.current = requestAnimationFrame(draw)
  }, [analyser, state])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: 160,
        display: 'block',
      }}
    />
  )
}
