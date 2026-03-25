import { useRef, useEffect } from 'react'

/**
 * Full-screen canvas audio visualizer.
 * Draws frequency bars rising from the bottom with hue-mapped colors.
 */
export function Visualizer({ analyserRef, active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const dataRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let running = true

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      if (!running) return

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const analyser = analyserRef.current
      if (!analyser || !active) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      // Reuse or create frequency data buffer
      if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
        dataRef.current = new Uint8Array(analyser.frequencyBinCount)
      }
      analyser.getByteFrequencyData(dataRef.current)
      const data = dataRef.current

      // Only use the lower ~quarter of bins (musically interesting range)
      const usableBins = Math.floor(data.length * 0.25)
      const barCount = Math.min(usableBins, Math.floor(w / 3))
      const step = usableBins / barCount
      const barWidth = w / barCount
      const gap = Math.max(1, barWidth * 0.15)

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor(i * step)
        const value = data[binIndex] / 255

        if (value < 0.02) continue

        const barHeight = value * h * 0.85
        const x = i * barWidth

        // Map bar position to hue: low freq = red/warm, high freq = blue/cool
        const hue = (i / barCount) * 270 + 0
        const saturation = 70 + value * 20
        const lightness = 40 + value * 15
        const alpha = 0.15 + value * 0.25

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`

        // Rounded top via rounded rect
        const bx = x + gap / 2
        const bw = barWidth - gap
        const by = h - barHeight
        const radius = Math.min(bw / 2, 3)

        ctx.beginPath()
        ctx.moveTo(bx + radius, by)
        ctx.lineTo(bx + bw - radius, by)
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + radius)
        ctx.lineTo(bx + bw, h)
        ctx.lineTo(bx, h)
        ctx.lineTo(bx, by + radius)
        ctx.quadraticCurveTo(bx, by, bx + radius, by)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      running = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [analyserRef, active])

  return (
    <canvas
      ref={canvasRef}
      className="visualizer"
      aria-hidden="true"
    />
  )
}
