import { useRef, useEffect } from 'react'

/**
 * Full-viewport audio visualizer.
 * Draws an endless Möbius ribbon that encircles the key area,
 * with a subtle 180° twist. Decorative — just for fun.
 */
export function Visualizer({ analyserRef, active, visible = true }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const dataRef = useRef(null)
  const historyRef = useRef([])
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let running = true

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    const LAYER_COUNT = 14
    const HISTORY_LENGTH = 6
    const SEGMENTS = 220
    const TWO_PI = Math.PI * 2

    const draw = () => {
      if (!running) return
      timeRef.current += 0.006

      const w = canvas.width
      const h = canvas.height
      const dpr = devicePixelRatio

      // Fade previous frame — trailing glow
      ctx.fillStyle = 'rgba(15, 17, 23, 0.18)'
      ctx.fillRect(0, 0, w, h)

      const analyser = analyserRef.current
      if (!analyser || !active || !visible) {
        ctx.fillStyle = 'rgba(15, 17, 23, 0.08)'
        ctx.fillRect(0, 0, w, h)
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
        dataRef.current = new Uint8Array(analyser.frequencyBinCount)
      }
      analyser.getByteFrequencyData(dataRef.current)
      const data = dataRef.current

      historyRef.current.push(new Uint8Array(data))
      if (historyRef.current.length > HISTORY_LENGTH) historyRef.current.shift()

      const usableBins = Math.floor(data.length * 0.35)
      const cx = w / 2
      const cy = h / 2
      // Viewport-proportional ellipse — matches the original look
      const margin = 30 * dpr
      const rx = Math.min(w * 0.44, cx - margin)
      // Cap aspect ratio so mobile doesn't get a weird skinny oval
      const ryRaw = Math.min(h * 0.40, cy - margin)
      const ry = Math.min(ryRaw, rx * 1.3)
      const baseWidth = Math.min(w, h) * 0.035
      // Hard cap expansion so ribbon never exceeds viewport
      const maxExpand = Math.min(cx - margin - rx, cy - margin - ry)
      const phase = timeRef.current

      // Compute overall audio energy for global responsiveness
      let totalEnergy = 0
      for (let i = 0; i < usableBins; i++) totalEnergy += data[i]
      const avgEnergy = totalEnergy / usableBins / 255

      for (let layer = 0; layer < LAYER_COUNT; layer++) {
        const layerOffset = ((layer / (LAYER_COUNT - 1)) - 0.5) * 2 // -1 to 1
        const hue = (layer / (LAYER_COUNT - 1)) * 300
        const alpha = 0.1 + 0.12 * (1 - Math.abs(layerOffset))

        ctx.beginPath()

        for (let seg = 0; seg <= SEGMENTS; seg++) {
          const t = seg / SEGMENTS
          const angle = t * TWO_PI + phase

          // Möbius twist: smooth 180° rotation over the full loop
          const twist = Math.cos(t * Math.PI)

          // Layer displacement with twist — kept as signed for visual interest
          const displacement = layerOffset * baseWidth * twist

          // Audio modulation — smoothed with history
          const binIdx = Math.min(
            Math.floor(t * usableBins),
            data.length - 1
          )
          let value = data[binIdx]
          for (let hi = 0; hi < historyRef.current.length; hi++) {
            value += historyRef.current[hi][binIdx] || 0
          }
          value /= (historyRef.current.length + 1)

          const audioNorm = value / 255

          // Strong outward audio push — scales with per-bin intensity AND global energy
          const audioMod = audioNorm * baseWidth * (2.5 + avgEnergy * 3.0)

          // High-frequency vibration for energy feel
          const vibrate = Math.sin(angle * 6 + phase * 10) * audioNorm * baseWidth * 0.3 * Math.abs(layerOffset)

          // Displacement: twist provides visual structure, audio always pushes outward
          const totalDisp = displacement + audioMod * (0.4 + 0.6 * Math.abs(layerOffset)) + vibrate

          // Clamp: never inward past base ellipse, never beyond viewport
          const outwardDisp = Math.min(Math.max(0, totalDisp), maxExpand)

          const x = cx + (rx + outwardDisp) * Math.cos(angle)
          const y = cy + (ry + outwardDisp) * Math.sin(angle)

          if (seg === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.closePath()
        ctx.strokeStyle = `hsla(${hue}, 85%, 60%, ${alpha})`
        ctx.lineWidth = 1.5 * dpr
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      running = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      historyRef.current = []
    }
  }, [analyserRef, active, visible])

  return (
    <canvas
      ref={canvasRef}
      className="visualizer"
      aria-hidden="true"
    />
  )
}
