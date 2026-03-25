import { useRef, useEffect, useMemo } from 'react'

const TWO_PI = Math.PI * 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Generate chaotic fibonacci-distributed points on a unit sphere.
 * Heavy random jitter + varied sizes for an organic, non-uniform look.
 * Each session gets a unique arrangement via a random seed.
 */
function generatePoints(count, seed) {
  // Simple seeded PRNG (mulberry32)
  let s = seed | 0
  const rand = () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const points = []
  for (let i = 0; i < count; i++) {
    // Fibonacci base with heavy angular jitter for chaos
    const y = 1 - (2 * i) / (count - 1)
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = GOLDEN_ANGLE * i + (rand() - 0.5) * 1.2

    // Push the point slightly off-sphere for depth variation
    const radialJitter = 0.92 + rand() * 0.16

    points.push({
      x: Math.cos(theta) * radiusAtY * radialJitter,
      y: y + (rand() - 0.5) * 0.08,
      z: Math.sin(theta) * radiusAtY * radialJitter,
      hueOffset: rand() * 80 - 40,
      sizeScale: 0.4 + rand() * 1.2,
    })
  }
  return points
}

// Session-level seed so each page load is unique
const SESSION_SEED_BASE = Math.floor(Math.random() * 2147483647)

export function ParticleSphere({
  onClick,
  label = 'Start\nTuning',
  size: preferredSize,
  dotCount = 180,
  seedOffset = 0,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const timeRef = useRef(0)

  const points = useMemo(
    () => generatePoints(dotCount, SESSION_SEED_BASE + seedOffset),
    [dotCount, seedOffset]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const sz = preferredSize || Math.min(200, window.innerWidth - 80)
      const totalH = sz + 30
      canvas.style.width = sz + 'px'
      canvas.style.height = totalH + 'px'
      canvas.width = sz * dpr
      canvas.height = totalH * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.width
      const h = canvas.height
      const sz = w / dpr

      timeRef.current += 0.008

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.scale(dpr, dpr)

      const t = timeRef.current
      const bobY = Math.sin(t * 1.0) * 5
      const rotY = t * 0.25
      const rotX = 0.15

      const cx = sz / 2
      const cy = sz / 2 + bobY
      const radius = sz * 0.38

      // Ground shadow
      const shadowScale = 1 - Math.sin(t * 1.0) * 0.12
      const shadowAlpha = 0.1 + Math.sin(t * 1.0) * 0.03
      const shadowGrad = ctx.createRadialGradient(
        cx, sz * 0.88, 0,
        cx, sz * 0.88, radius * 0.55 * shadowScale
      )
      shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`)
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(cx, sz * 0.88, radius * 0.55 * shadowScale, radius * 0.07, 0, 0, TWO_PI)
      ctx.fill()

      // Subtle inner glow behind dots
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      glowGrad.addColorStop(0, 'rgba(140, 120, 255, 0.02)')
      glowGrad.addColorStop(0.6, 'rgba(100, 80, 200, 0.01)')
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, TWO_PI)
      ctx.fill()

      // Rotate and project each point, then z-sort
      const cosRY = Math.cos(rotY)
      const sinRY = Math.sin(rotY)
      const cosRX = Math.cos(rotX)
      const sinRX = Math.sin(rotX)

      const projected = points.map((p) => {
        // Rotate around Y axis
        let px = p.x * cosRY + p.z * sinRY
        let pz = -p.x * sinRY + p.z * cosRY
        let py = p.y
        // Rotate around X axis (tilt)
        const py2 = py * cosRX - pz * sinRX
        const pz2 = py * sinRX + pz * cosRX

        return {
          sx: cx + px * radius,
          sy: cy - py2 * radius,
          z: pz2,
          hueOffset: p.hueOffset,
          sizeScale: p.sizeScale,
        }
      })

      // Sort back-to-front
      projected.sort((a, b) => a.z - b.z)

      for (const dot of projected) {
        const depth = (dot.z + 1) / 2 // 0 (back) to 1 (front)
        const dotRadius = (0.8 + depth * 2.0) * dot.sizeScale
        const alpha = (0.08 + depth * 0.5)

        // Rainbow hue based on vertical position + per-dot offset
        const baseHue = ((dot.sy - cy + radius) / (radius * 2)) * 300
        const hue = (baseHue + dot.hueOffset + 360) % 360

        ctx.beginPath()
        ctx.arc(dot.sx, dot.sy, dotRadius, 0, TWO_PI)
        ctx.fillStyle = `hsla(${hue}, 80%, ${50 + depth * 15}%, ${alpha})`
        ctx.fill()

        // Front dots get a very subtle glow
        if (depth > 0.75) {
          ctx.beginPath()
          ctx.arc(dot.sx, dot.sy, dotRadius * 1.8, 0, TWO_PI)
          ctx.fillStyle = `hsla(${hue}, 85%, 60%, ${(depth - 0.75) * 0.08})`
          ctx.fill()
        }
      }

      // Label text
      if (label) {
        const lines = label.split('\n')
        const fontSize = Math.round(sz * 0.08)
        ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
        ctx.shadowBlur = 8
        const lineH = fontSize * 1.15
        const startY = cy - ((lines.length - 1) * lineH) / 2
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], cx, startY + i * lineH)
        }
        ctx.shadowBlur = 0
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [points, label, preferredSize])

  return (
    <canvas
      ref={canvasRef}
      className="start-sphere"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={label?.replace('\n', ' ') || 'Button'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick()
      }}
    />
  )
}
