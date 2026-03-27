import { useRef, useEffect } from 'react'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const TWO_PI = Math.PI * 2
const NOTE_ANGLE = TWO_PI / 12
const PERFECT_THRESHOLD = 5 // cents — triggers glow
const LOCKED_THRESHOLD = 2 // cents — triggers intense locked glow

export function NoteWheel({ note }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    currentAngle: 0,
    targetAngle: 0,
    cents: 0,
    active: false,
    noteName: null,
    octave: '',
    frequency: 0,
  })
  const rafRef = useRef(null)
  const phaseRef = useRef(0)

  // Update target when note changes
  useEffect(() => {
    const s = stateRef.current
    if (note) {
      const noteIndex = NOTES.indexOf(note.name)
      if (noteIndex >= 0) {
        const centsOffset = (note.cents / 100) * NOTE_ANGLE
        const rawTarget = noteIndex * NOTE_ANGLE + centsOffset

        // Find shortest rotation path
        const normCurrent = ((s.currentAngle % TWO_PI) + TWO_PI) % TWO_PI
        const normTarget = ((rawTarget % TWO_PI) + TWO_PI) % TWO_PI
        let diff = normTarget - normCurrent
        if (diff > Math.PI) diff -= TWO_PI
        if (diff < -Math.PI) diff += TWO_PI
        s.targetAngle = s.currentAngle + diff
      }
      s.noteName = note.name
      s.cents = note.cents
      s.active = note.active
      s.frequency = note.frequency
      s.octave = note.octave
    } else {
      s.active = false
      s.noteName = null
    }
  }, [note])

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const size = Math.min(320, window.innerWidth - 40)
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
      canvas.width = size * dpr
      canvas.height = size * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const s = stateRef.current
      const dpr = window.devicePixelRatio || 1
      const w = canvas.width
      const size = w / dpr

      // Smooth lerp — balanced between responsive and calm
      s.currentAngle += (s.targetAngle - s.currentAngle) * 0.07
      phaseRef.current += 0.04

      ctx.clearRect(0, 0, w, w)
      ctx.save()
      ctx.scale(dpr, dpr)

      const cx = size / 2
      const cy = size / 2
      const radius = size * 0.38
      const tilt = 0.4

      // Ground shadow beneath sphere
      const shadowGrad = ctx.createRadialGradient(
        cx, cy + radius * 0.88, 0,
        cx, cy + radius * 0.88, radius * 0.55
      )
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.18)')
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(cx, cy + radius * 0.88, radius * 0.55, radius * 0.1, 0, 0, TWO_PI)
      ctx.fill()

      // Sphere tint color — follows tuning hue when active
      const bodyHue = s.active && s.noteName
        ? Math.round(120 * (1 - Math.min(Math.abs(s.cents), 50) / 50))
        : 160 // default teal
      const bodyHsl = (l, a) => `hsla(${bodyHue}, 50%, ${l}%, ${a})`

      // Full circular sphere body with 3D lighting
      const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.35, cy - radius * 0.35, radius * 0.08,
        cx, cy, radius
      )
      bodyGrad.addColorStop(0, bodyHsl(75, 0.3))
      bodyGrad.addColorStop(0.2, bodyHsl(60, 0.18))
      bodyGrad.addColorStop(0.5, bodyHsl(40, 0.1))
      bodyGrad.addColorStop(0.8, bodyHsl(20, 0.14))
      bodyGrad.addColorStop(1, bodyHsl(8, 0.25))
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.96, 0, TWO_PI)
      ctx.fill()

      // Rim on sphere edge
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.96, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.12)
      ctx.lineWidth = 2
      ctx.stroke()

      // "In tune" glow — sphere radiates when close to perfect pitch
      if (s.active && s.noteName) {
        const absCents = Math.abs(s.cents)
        if (absCents <= PERFECT_THRESHOLD) {
          const isLocked = absCents <= LOCKED_THRESHOLD
          const pulse = 0.5 + 0.5 * Math.sin(phaseRef.current * (isLocked ? 3 : 2))
          const glowIntensity = isLocked ? 0.25 + pulse * 0.15 : 0.1 + pulse * 0.08
          const glowRadius = isLocked ? radius * 1.3 : radius * 1.15
          const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, glowRadius)
          glowGrad.addColorStop(0, `rgba(74, 222, 128, ${glowIntensity})`)
          glowGrad.addColorStop(0.6, `rgba(74, 222, 128, ${glowIntensity * 0.3})`)
          glowGrad.addColorStop(1, 'rgba(74, 222, 128, 0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(cx, cy, glowRadius, 0, TWO_PI)
          ctx.fill()

          if (isLocked) {
            ctx.beginPath()
            ctx.arc(cx, cy, radius * 0.96, 0, TWO_PI)
            ctx.strokeStyle = `rgba(74, 222, 128, ${0.2 + pulse * 0.15})`
            ctx.lineWidth = 2.5
            ctx.stroke()
          }
        }
      }

      // Longitude meridian (vertical great circle)
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius * 0.18, radius * 0.95, 0, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.06)
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Upper latitude line
      const upperLatY = radius * 0.5
      const upperLatR = Math.sqrt(radius * radius - upperLatY * upperLatY)
      ctx.beginPath()
      ctx.ellipse(cx, cy - upperLatY * tilt, upperLatR, upperLatR * tilt, 0, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.07)
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Lower latitude line
      ctx.beginPath()
      ctx.ellipse(cx, cy + upperLatY * tilt, upperLatR, upperLatR * tilt, 0, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.05)
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Equator (orbit ring) — brighter rim
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius, radius * tilt, 0, 0, TWO_PI)
      ctx.strokeStyle = bodyHsl(60, 0.22)
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Reference indicator at top
      const indY = cy - radius * tilt - 16
      ctx.beginPath()
      ctx.moveTo(cx, indY + 10)
      ctx.lineTo(cx - 6, indY)
      ctx.lineTo(cx + 6, indY)
      ctx.closePath()
      ctx.fillStyle = s.active
        ? bodyHsl(60, 0.6)
        : bodyHsl(60, 0.2)
      ctx.fill()

      // Compute note positions
      const positions = []
      for (let i = 0; i < 12; i++) {
        const angle = i * NOTE_ANGLE - s.currentAngle
        const x = cx + radius * Math.sin(angle)
        const y = cy - radius * Math.cos(angle) * tilt
        const depth = Math.cos(angle)
        positions.push({ i, x, y, depth, name: NOTES[i] })
      }

      // Sort back-to-front for proper z-ordering
      positions.sort((a, b) => a.depth - b.depth)

      for (const p of positions) {
        const t = (p.depth + 1) / 2 // 0=back, 1=front
        const noteScale = 0.35 + 0.65 * t
        const opacity = 0.05 + 0.95 * t * t
        const fontSize = Math.round(22 * noteScale)
        const isFrontNote = p.depth > 0.8 && s.active && p.name === s.noteName

        // Horizontal foreshortening — simulates letters painted on the sphere surface
        // cos(angle) gives the x-component: 1 at front, 0 at sides, -1 at back
        const angle = p.i * NOTE_ANGLE - s.currentAngle
        const foreshorten = Math.cos(angle)
        // At the back (foreshorten < 0), letters appear mirrored/compressed
        const scaleX = foreshorten

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.scale(scaleX, 1)

        if (isFrontNote) {
          const absCents = Math.min(Math.abs(s.cents), 50)
          const hue = Math.round(120 * (1 - absCents / 50))
          const nearPerfect = absCents <= PERFECT_THRESHOLD
          const locked = absCents <= LOCKED_THRESHOLD

          // Glow behind the note
          const glowSize = nearPerfect ? (locked ? fontSize * 1.6 : fontSize * 1.3) : fontSize * 0.9
          const glowPulse = nearPerfect ? 0.5 + 0.5 * Math.sin(phaseRef.current * 3) : 0
          const glowAlpha = nearPerfect ? 0.15 + glowPulse * 0.1 : 0.1
          ctx.save()
          ctx.shadowColor = `hsl(${hue}, 80%, 55%)`
          ctx.shadowBlur = nearPerfect ? 30 + glowPulse * 15 : 20
          ctx.beginPath()
          ctx.arc(0, 0, glowSize / Math.max(Math.abs(scaleX), 0.3), 0, TWO_PI)
          ctx.fillStyle = `hsla(${hue}, 80%, 55%, ${glowAlpha})`
          ctx.fill()
          ctx.restore()

          const noteSize = locked ? Math.round(fontSize * 1.1) : fontSize
          ctx.font = `700 ${noteSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `hsl(${hue}, 80%, 55%)`
          ctx.fillText(p.name, 0, 0)
        } else {
          ctx.font = `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`
          ctx.fillText(p.name, 0, 0)
        }

        ctx.restore()
      }

      // Center display
      if (s.noteName) {
        const absCents = Math.min(Math.abs(s.cents), 50)
        const hue = s.active ? Math.round(120 * (1 - absCents / 50)) : 0
        const centerColor = s.active
          ? `hsl(${hue}, 80%, 55%)`
          : 'rgba(156, 163, 175, 0.3)'

        // Big note name
        ctx.font = `700 ${Math.round(size * 0.24)}px -apple-system, BlinkMacSystemFont, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = centerColor
        ctx.fillText(s.noteName, cx, cy - size * 0.02)

        if (s.active) {
          // Octave superscript
          const noteWidth = ctx.measureText(s.noteName).width
          ctx.font = `400 ${Math.round(size * 0.07)}px -apple-system, sans-serif`
          ctx.fillStyle = 'rgba(156, 163, 175, 0.7)'
          ctx.textAlign = 'left'
          ctx.fillText(String(s.octave), cx + noteWidth / 2 + 2, cy - size * 0.07)

          // Cents
          const centsText = `${s.cents > 0 ? '+' : ''}${s.cents}\u00A2`
          ctx.font = `600 ${Math.round(size * 0.065)}px "SF Mono", "Fira Code", monospace`
          ctx.textAlign = 'center'
          ctx.fillStyle = centerColor
          ctx.fillText(centsText, cx, cy + size * 0.1)

          // Frequency
          ctx.font = `400 ${Math.round(size * 0.045)}px "SF Mono", "Fira Code", monospace`
          ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
          ctx.fillText(`${s.frequency} Hz`, cx, cy + size * 0.16)
        }
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

  return <canvas ref={canvasRef} className="note-wheel" />
}
