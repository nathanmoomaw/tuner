import { useRef, useEffect } from 'react'

const TWO_PI = Math.PI * 2

export function StartSphere({ onClick }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const size = Math.min(200, window.innerWidth - 80)
      canvas.style.width = size + 'px'
      canvas.style.height = (size + 30) + 'px'
      canvas.width = size * dpr
      canvas.height = (size + 30) * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.width
      const h = canvas.height
      const size = w / dpr

      timeRef.current += 0.012

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.scale(dpr, dpr)

      const t = timeRef.current
      // Gentle bob
      const bobY = Math.sin(t * 1.2) * 6
      // Slow rotation for surface markings
      const rotation = t * 0.3

      const cx = size / 2
      const cy = size / 2 + bobY
      const radius = size * 0.38

      // Ground shadow (stays fixed, gets smaller/lighter as sphere bobs up)
      const shadowScale = 1 - Math.sin(t * 1.2) * 0.15
      const shadowAlpha = 0.12 + Math.sin(t * 1.2) * 0.04
      const shadowGrad = ctx.createRadialGradient(
        cx, size * 0.88, 0,
        cx, size * 0.88, radius * 0.6 * shadowScale
      )
      shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`)
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(cx, size * 0.88, radius * 0.6 * shadowScale, radius * 0.08, 0, 0, TWO_PI)
      ctx.fill()

      // Sphere body
      const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.35, cy - radius * 0.35, radius * 0.08,
        cx, cy, radius
      )
      bodyGrad.addColorStop(0, 'rgba(150, 255, 220, 0.22)')
      bodyGrad.addColorStop(0.2, 'rgba(110, 231, 183, 0.14)')
      bodyGrad.addColorStop(0.5, 'rgba(70, 170, 140, 0.08)')
      bodyGrad.addColorStop(0.8, 'rgba(30, 80, 65, 0.1)')
      bodyGrad.addColorStop(1, 'rgba(10, 30, 25, 0.2)')
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, TWO_PI)
      ctx.fill()

      // Rim glow
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.12)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Specular highlight
      const specGrad = ctx.createRadialGradient(
        cx - radius * 0.32, cy - radius * 0.38, 0,
        cx - radius * 0.32, cy - radius * 0.38, radius * 0.35
      )
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)')
      specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)')
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = specGrad
      ctx.beginPath()
      ctx.arc(cx - radius * 0.32, cy - radius * 0.38, radius * 0.35, 0, TWO_PI)
      ctx.fill()

      // Rotating equator
      const tilt = 0.35
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius * 0.98, radius * 0.98 * tilt, rotation * 0.3, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.1)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Rotating meridian
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius * 0.15, radius * 0.95, rotation, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.06)'
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Second meridian (perpendicular-ish)
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius * 0.15, radius * 0.95, rotation + Math.PI / 3, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.04)'
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Latitude lines
      for (const latFrac of [0.45, -0.45]) {
        const latY = radius * latFrac
        const latR = Math.sqrt(radius * radius - latY * latY)
        ctx.beginPath()
        ctx.ellipse(cx, cy + latY * tilt, latR, latR * tilt, rotation * 0.15, 0, TWO_PI)
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.04)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // "Start Tuning" text
      const fontSize = Math.round(size * 0.085)
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(110, 231, 183, 0.9)'
      ctx.fillText('Start', cx, cy - fontSize * 0.5)
      ctx.fillText('Tuning', cx, cy + fontSize * 0.6)

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="start-sphere"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Start Tuning"
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick()
      }}
    />
  )
}
