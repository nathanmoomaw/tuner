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

      const centerY = h * 0.5
      const usableBins = Math.floor(data.length * 0.35)

      // Draw each layer as a flowing waveform line
      for (let layer = 0; layer < LAYER_COUNT; layer++) {
        const layerT = layer / (LAYER_COUNT - 1) // 0..1

        // Rainbow hue across layers
        const hue = layerT * 300 // red → magenta → blue → cyan → green → yellow
        const alpha = 0.3 + 0.35 * Math.sin(layerT * Math.PI) // brighter in middle

        // Each layer is offset vertically and reads slightly different frequency ranges
        const yOffset = (layerT - 0.5) * h * 0.45
        const freqOffset = Math.floor(layer * 1.5)

        // Arch: push waveforms away from vertical center at horizontal center
        const archDir = layerT < 0.5 ? -1 : 1
        const centerCloseness = 1 - Math.abs(layerT - 0.5) * 2
        const archStrength = h * 0.13 * (0.3 + 0.7 * centerCloseness)

        ctx.beginPath()
        ctx.strokeStyle = `hsla(${hue}, 85%, 60%, ${alpha})`
        ctx.lineWidth = 1.5 * devicePixelRatio

        const points = Math.min(w / 2, usableBins)
        const step = usableBins / points

        for (let i = 0; i <= points; i++) {
          const x = (i / points) * w
          const binIndex = Math.min(Math.floor(i * step) + freqOffset, data.length - 1)

          // Average with history for smoother movement
          let value = data[binIndex]
          const history = historyRef.current
          for (let hi = 0; hi < history.length; hi++) {
            value += history[hi][binIndex] || 0
          }
          value /= (history.length + 1)

          const amplitude = (value / 255) * h * 0.32
          const archFactor = Math.sin((i / points) * Math.PI)
          const archY = archDir * archFactor * archStrength
          const y = centerY + yOffset + (amplitude * Math.sin((i / points) * Math.PI))
                    - amplitude * 0.5 + archY

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            // Smooth curve to next point
            const prevX = ((i - 1) / points) * w
            const cpX = (prevX + x) / 2
            ctx.quadraticCurveTo(cpX, y, x, y)
          }
        }

        ctx.stroke()

        // Draw a mirrored, dimmer version below for depth
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${hue}, 85%, 60%, ${alpha * 0.3})`
        ctx.lineWidth = 1 * devicePixelRatio

        for (let i = 0; i <= points; i++) {
          const x = (i / points) * w
          const binIndex = Math.min(Math.floor(i * step) + freqOffset, data.length - 1)

          let value = data[binIndex]
          const history = historyRef.current
          for (let hi = 0; hi < history.length; hi++) {
            value += history[hi][binIndex] || 0
          }
          value /= (history.length + 1)

          const amplitude = (value / 255) * h * 0.32
          const archFactor = Math.sin((i / points) * Math.PI)
          const mirrorArchY = -archDir * archFactor * archStrength
          const y = centerY - yOffset - (amplitude * Math.sin((i / points) * Math.PI))
                    + amplitude * 0.5 + mirrorArchY

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

      // Apply a stronger radial fade in the center for key zone legibility
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      const gradient = ctx.createRadialGradient(
        w / 2, centerY, 0,
        w / 2, centerY, Math.min(w, h) * 0.42
      )
      gradient.addColorStop(0, 'rgba(0,0,0,0.92)')
      gradient.addColorStop(0.4, 'rgba(0,0,0,0.6)')
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.2)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
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
