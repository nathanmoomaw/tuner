import { useRef, useEffect } from 'react'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const TWO_PI = Math.PI * 2
const NOTE_ANGLE = TWO_PI / 12

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

      // Smooth lerp — slow rotation for a calm, fluid feel
      s.currentAngle += (s.targetAngle - s.currentAngle) * 0.04

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

      // Full circular sphere body with 3D lighting
      const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.35, cy - radius * 0.35, radius * 0.08,
        cx, cy, radius
      )
      bodyGrad.addColorStop(0, 'rgba(150, 255, 220, 0.38)')
      bodyGrad.addColorStop(0.2, 'rgba(110, 231, 183, 0.22)')
      bodyGrad.addColorStop(0.5, 'rgba(70, 170, 140, 0.12)')
      bodyGrad.addColorStop(0.8, 'rgba(30, 80, 65, 0.16)')
      bodyGrad.addColorStop(1, 'rgba(10, 30, 25, 0.3)')
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.96, 0, TWO_PI)
      ctx.fill()

      // Rim glow on sphere edge
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.96, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.15)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Specular highlight (top-left)
      const specGrad = ctx.createRadialGradient(
        cx - radius * 0.32, cy - radius * 0.38, 0,
        cx - radius * 0.32, cy - radius * 0.38, radius * 0.35
      )
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
      specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)')
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = specGrad
      ctx.beginPath()
      ctx.arc(cx - radius * 0.32, cy - radius * 0.38, radius * 0.35, 0, TWO_PI)
      ctx.fill()

      // Longitude meridian (vertical great circle)
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius * 0.18, radius * 0.95, 0, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.06)'
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Upper latitude line
      const upperLatY = radius * 0.5
      const upperLatR = Math.sqrt(radius * radius - upperLatY * upperLatY)
      ctx.beginPath()
      ctx.ellipse(cx, cy - upperLatY * tilt, upperLatR, upperLatR * tilt, 0, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.07)'
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Lower latitude line
      ctx.beginPath()
      ctx.ellipse(cx, cy + upperLatY * tilt, upperLatR, upperLatR * tilt, 0, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.05)'
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Equator (orbit ring) — brighter rim
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius, radius * tilt, 0, 0, TWO_PI)
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.25)'
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
        ? 'rgba(110, 231, 183, 0.7)'
        : 'rgba(110, 231, 183, 0.2)'
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

        if (isFrontNote) {
          const absCents = Math.min(Math.abs(s.cents), 50)
          const hue = Math.round(120 * (1 - absCents / 50))

          // Glow behind the note
          ctx.save()
          ctx.shadowColor = `hsl(${hue}, 80%, 55%)`
          ctx.shadowBlur = 20
          ctx.beginPath()
          ctx.arc(p.x, p.y, fontSize * 0.9, 0, TWO_PI)
          ctx.fillStyle = `hsla(${hue}, 80%, 55%, 0.1)`
          ctx.fill()
          ctx.restore()

          ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `hsl(${hue}, 80%, 55%)`
          ctx.fillText(p.name, p.x, p.y)
        } else {
          ctx.font = `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`
          ctx.fillText(p.name, p.x, p.y)
        }
      }

      // Center display
      if (s.noteName) {
        const absCents = Math.min(Math.abs(s.cents), 50)
        const hue = s.active ? Math.round(120 * (1 - absCents / 50)) : 0
        const centerColor = s.active
          ? `hsl(${hue}, 80%, 55%)`
          : 'rgba(156, 163, 175, 0.3)'

        // Big note name
        ctx.font = `700 ${Math.round(size * 0.2)}px -apple-system, BlinkMacSystemFont, sans-serif`
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
          ctx.font = `500 ${Math.round(size * 0.055)}px "SF Mono", "Fira Code", monospace`
          ctx.textAlign = 'center'
          ctx.fillStyle = centerColor
          ctx.fillText(centsText, cx, cy + size * 0.1)

          // Frequency
          ctx.font = `400 ${Math.round(size * 0.04)}px "SF Mono", "Fira Code", monospace`
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
