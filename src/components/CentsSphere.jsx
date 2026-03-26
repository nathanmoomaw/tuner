import { useRef, useEffect } from 'react'

const TWO_PI = Math.PI * 2
const TICK_CENTS = [-50, -40, -30, -20, -10, -5, 0, 5, 10, 20, 30, 40, 50]
// Map ±50 cents to ±70° of rotation
const MAX_ANGLE = (70 / 180) * Math.PI

export function CentsSphere({ cents = 0, active = false }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    currentAngle: 0,
    targetAngle: 0,
    cents: 0,
    active: false,
  })
  const rafRef = useRef(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const s = stateRef.current
    s.cents = cents
    s.active = active
    // Map cents to rotation angle
    const clamped = Math.max(-50, Math.min(50, cents))
    s.targetAngle = (clamped / 50) * MAX_ANGLE
  }, [cents, active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = Math.min(280, window.innerWidth - 40)
      const h = Math.round(w * 0.55)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      canvas.width = w * dpr
      canvas.height = h * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const s = stateRef.current
      const dpr = window.devicePixelRatio || 1
      const cw = canvas.width
      const ch = canvas.height
      const w = cw / dpr
      const h = ch / dpr

      // Smooth lerp — slower for calmer, less jittery movement
      s.currentAngle += (s.targetAngle - s.currentAngle) * 0.06
      phaseRef.current += 0.04

      ctx.clearRect(0, 0, cw, ch)
      ctx.save()
      ctx.scale(dpr, dpr)

      const cx = w / 2
      const cy = h * 0.48
      const rx = w * 0.4
      const ry = rx * 0.4
      const tilt = 0.4

      // Tuning color based on cents
      const absCents = Math.min(Math.abs(s.cents), 50)
      const hue = s.active ? Math.round(120 * (1 - absCents / 50)) : 0
      const tuneColor = s.active
        ? `hsl(${hue}, 80%, 55%)`
        : 'rgba(156, 163, 175, 0.3)'

      // Ground shadow
      const shadowGrad = ctx.createRadialGradient(
        cx, cy + ry * 1.8, 0,
        cx, cy + ry * 1.8, rx * 0.5
      )
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.12)')
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(cx, cy + ry * 1.8, rx * 0.5, rx * 0.06, 0, 0, TWO_PI)
      ctx.fill()

      // Sphere tint — follows tuning hue
      const bodyHsl = (l, a) => `hsla(${hue}, 50%, ${l}%, ${a})`

      // Full sphere body with 3D lighting
      const sphereR = rx * 0.65
      const bodyGrad = ctx.createRadialGradient(
        cx - sphereR * 0.35, cy - sphereR * 0.35, sphereR * 0.08,
        cx, cy, sphereR
      )
      bodyGrad.addColorStop(0, bodyHsl(75, 0.3))
      bodyGrad.addColorStop(0.2, bodyHsl(60, 0.18))
      bodyGrad.addColorStop(0.5, bodyHsl(40, 0.1))
      bodyGrad.addColorStop(0.8, bodyHsl(20, 0.14))
      bodyGrad.addColorStop(1, bodyHsl(8, 0.25))
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.arc(cx, cy, sphereR, 0, TWO_PI)
      ctx.fill()

      // Rim
      ctx.beginPath()
      ctx.arc(cx, cy, sphereR, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.12)
      ctx.lineWidth = 1.5
      ctx.stroke()

      // "In tune" glow — sphere radiates when near zero cents
      if (s.active) {
        const absCents = Math.abs(s.cents)
        if (absCents <= 5) {
          const isLocked = absCents <= 2
          const pulse = 0.5 + 0.5 * Math.sin(phaseRef.current * (isLocked ? 3 : 2))
          const glowIntensity = isLocked ? 0.2 + pulse * 0.12 : 0.08 + pulse * 0.06
          const glowR = isLocked ? sphereR * 1.3 : sphereR * 1.15
          const glowGrad = ctx.createRadialGradient(cx, cy, sphereR * 0.3, cx, cy, glowR)
          glowGrad.addColorStop(0, `rgba(74, 222, 128, ${glowIntensity})`)
          glowGrad.addColorStop(0.6, `rgba(74, 222, 128, ${glowIntensity * 0.3})`)
          glowGrad.addColorStop(1, 'rgba(74, 222, 128, 0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(cx, cy, glowR, 0, TWO_PI)
          ctx.fill()

          if (isLocked) {
            ctx.beginPath()
            ctx.arc(cx, cy, sphereR, 0, TWO_PI)
            ctx.strokeStyle = `rgba(74, 222, 128, ${0.15 + pulse * 0.12})`
            ctx.lineWidth = 2
            ctx.stroke()
          }
        }
      }

      // Meridian line
      ctx.beginPath()
      ctx.ellipse(cx, cy, sphereR * 0.15, sphereR * 0.95, 0, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.06)
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Orbit ring (equator)
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.2)
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Reference indicator at top (center = in tune)
      const refY = cy - ry - 10
      ctx.beginPath()
      ctx.moveTo(cx, refY + 7)
      ctx.lineTo(cx - 4, refY)
      ctx.lineTo(cx + 4, refY)
      ctx.closePath()
      ctx.fillStyle = s.active
        ? bodyHsl(60, 0.5)
        : bodyHsl(60, 0.2)
      ctx.fill()

      // Tick marks along the orbit — z-sorted
      const ticks = []
      for (const c of TICK_CENTS) {
        // Each tick's angle = its cents position mapped to orbit angle, offset by current rotation
        const tickAngle = (c / 50) * MAX_ANGLE - s.currentAngle
        const x = cx + rx * Math.sin(tickAngle)
        const y = cy - ry * Math.cos(tickAngle)
        const depth = Math.cos(tickAngle)
        ticks.push({ c, x, y, depth })
      }
      ticks.sort((a, b) => a.depth - b.depth)

      for (const tick of ticks) {
        const t = (tick.depth + 1) / 2
        const opacity = 0.05 + 0.95 * t * t
        const isCenter = tick.c === 0
        const isMajor = tick.c % 10 === 0
        const tickLen = isCenter ? 18 : isMajor ? 14 : 9
        const tickW = isCenter ? 3 : isMajor ? 2.2 : 1.5

        // Draw tick mark (radial line from orbit)
        const angle = Math.atan2(tick.x - cx, -(tick.y - cy))
        const nx = Math.sin(angle)
        const ny = -Math.cos(angle)
        ctx.beginPath()
        ctx.moveTo(tick.x, tick.y)
        ctx.lineTo(tick.x + nx * tickLen * tilt, tick.y + ny * tickLen * tilt)
        ctx.strokeStyle = isCenter
          ? `rgba(110, 231, 183, ${opacity * 0.9})`
          : isMajor
            ? `rgba(255, 255, 255, ${opacity * 0.5})`
            : `rgba(255, 255, 255, ${opacity * 0.35})`
        ctx.lineWidth = tickW
        ctx.stroke()

        // Add cents label on major ticks (except center)
        if (isMajor && !isCenter && t > 0.3) {
          const labelDist = tickLen + 8
          const lx = tick.x + nx * labelDist * tilt
          const ly = tick.y + ny * labelDist * tilt
          ctx.font = `400 ${Math.round(8 * (0.7 + 0.3 * t))}px -apple-system, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `rgba(156, 163, 175, ${opacity * 0.3})`
          ctx.fillText(`${tick.c}`, lx, ly)
        }
      }

      // Glowing indicator dot — sits at the top (reference point) since the sphere rotates under it
      // The sphere rotates to bring the current cents to the top, so the dot is always at angle = -currentAngle
      // which maps to the "0 cents" position shifted by the sphere rotation
      // Actually: the dot represents "where you are" — it should be at the top, and the sphere ticks rotate under it
      // So the dot is always at the top of the orbit
      const dotX = cx
      const dotY = cy - ry
      const dotRadius = s.active ? 5 : 3

      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius, 0, TWO_PI)
      ctx.fillStyle = tuneColor
      ctx.fill()

      // Labels
      ctx.font = `400 10px -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.textBaseline = 'middle'
      const labelOpacity = s.active ? 0.5 : 0.25
      ctx.fillStyle = `rgba(156, 163, 175, ${labelOpacity})`
      ctx.textAlign = 'right'
      ctx.fillText('flat', cx - rx - 8, cy)
      ctx.textAlign = 'left'
      ctx.fillText('sharp', cx + rx + 8, cy)

      // Center cents display
      if (s.active) {
        const centsText = `${s.cents > 0 ? '+' : ''}${s.cents}\u00A2`
        ctx.font = `500 14px "SF Mono", "Fira Code", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = tuneColor
        ctx.fillText(centsText, cx, cy + 2)
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="cents-sphere" />
}
