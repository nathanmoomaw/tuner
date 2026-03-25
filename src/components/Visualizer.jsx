import { useRef, useEffect } from 'react'

/**
 * Full-viewport audio visualizer.
 * Draws layered flowing waveform lines with rainbow colors, centered vertically.
 * Inspired by colorful spectrographic waveform art.
 */
export function Visualizer({ analyserRef, active, visible = true }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const dataRef = useRef(null)
  const historyRef = useRef([])

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

    // Number of waveform layers to draw
    const LAYER_COUNT = 28
    // How many historical frames to keep for the flowing trail effect
    const HISTORY_LENGTH = 6

    const draw = () => {
      if (!running) return

      const w = canvas.width
      const h = canvas.height

      // Fade previous frame instead of clearing — gives trailing glow
      ctx.fillStyle = 'rgba(15, 17, 23, 0.25)'
      ctx.fillRect(0, 0, w, h)

      const analyser = analyserRef.current
      if (!analyser || !active || !visible) {
        // When inactive, fade to black
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

      // Push current frame to history
      historyRef.current.push(new Uint8Array(data))
      if (historyRef.current.length > HISTORY_LENGTH) {
        historyRef.current.shift()
      }

      const usableBins = Math.floor(data.length * 0.35)

      // Waveforms render as decorative ambient bands at the top and bottom edges,
      // completely clear of the center tuning UI.
      const HALF = Math.floor(LAYER_COUNT / 2)
      const bandSpread = h * 0.14
      const bandCenters = [h * 0.1, h * 0.9]

      for (let layer = 0; layer < LAYER_COUNT; layer++) {
        const isUpper = layer < HALF
        const localIdx = isUpper ? layer : layer - HALF
        const localT = localIdx / (HALF - 1) // 0..1 within the band
        const bandCenter = bandCenters[isUpper ? 0 : 1]
        const yOffset = (localT - 0.5) * bandSpread
        const freqOffset = Math.floor(layer * 1.5)

        // Rainbow hue across all layers
        const hue = (layer / (LAYER_COUNT - 1)) * 300
        // Gentler alpha — decorative, not competing with UI
        const alpha = 0.18 + 0.2 * Math.sin(localT * Math.PI)

        ctx.beginPath()
        ctx.strokeStyle = `hsla(${hue}, 85%, 60%, ${alpha})`
        ctx.lineWidth = 1.5 * devicePixelRatio

        const points = Math.min(w / 2, usableBins)
        const step = usableBins / points

        for (let i = 0; i <= points; i++) {
          const x = (i / points) * w
          const binIndex = Math.min(Math.floor(i * step) + freqOffset, data.length - 1)

          let value = data[binIndex]
          const history = historyRef.current
          for (let hi = 0; hi < history.length; hi++) {
            value += history[hi][binIndex] || 0
          }
          value /= (history.length + 1)

          const amplitude = (value / 255) * h * 0.15
          const y = bandCenter + yOffset
                    + (amplitude * Math.sin((i / points) * Math.PI))
                    - amplitude * 0.5

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            const prevX = ((i - 1) / points) * w
            const cpX = (prevX + x) / 2
            ctx.quadraticCurveTo(cpX, y, x, y)
          }
        }

        ctx.stroke()
      }

      // Soft fade at band edges so waveforms don't have hard cutoffs
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      // Fade top edge
      const topFade = ctx.createLinearGradient(0, 0, 0, h * 0.22)
      topFade.addColorStop(0, 'rgba(0,0,0,0.5)')
      topFade.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = topFade
      ctx.fillRect(0, 0, w, h * 0.22)
      // Fade bottom edge
      const botFade = ctx.createLinearGradient(0, h * 0.78, 0, h)
      botFade.addColorStop(0, 'rgba(0,0,0,0)')
      botFade.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = botFade
      ctx.fillRect(0, h * 0.78, w, h * 0.22)
      ctx.restore()

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
