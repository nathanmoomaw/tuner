import { useRef, useEffect } from 'react'

const LETTERS = [
  { char: 't', color: '#a78bfa', baseRot: -4, baseY: -1 },
  { char: 'u', color: '#60a5fa', baseRot: 3, baseY: 2 },
  { char: 'n', color: '#34d399', baseRot: -2, baseY: -2 },
  { char: 'e', color: '#fbbf24', baseRot: 5, baseY: 1 },
  { char: 'r', color: '#f87171', baseRot: -3, baseY: -1 },
]

// Each letter reacts to a different frequency band
const BAND_OFFSETS = [0.05, 0.15, 0.3, 0.5, 0.7]

export function ReactiveLogo({ analyserRef, active }) {
  const spansRef = useRef([])
  const rafRef = useRef(null)
  const smoothRef = useRef(new Float32Array(5))

  useEffect(() => {
    if (!active) {
      // Reset to base transforms when not active
      spansRef.current.forEach((span, i) => {
        if (span) {
          const l = LETTERS[i]
          span.style.transform = `rotate(${l.baseRot}deg) translateY(${l.baseY}px)`
        }
      })
      smoothRef.current.fill(0)
      return
    }

    const animate = () => {
      const analyser = analyserRef?.current
      if (!analyser) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(data)
      const len = data.length
      const smooth = smoothRef.current

      for (let i = 0; i < 5; i++) {
        // Sample a band of frequencies for each letter
        const center = Math.floor(BAND_OFFSETS[i] * len)
        const bandSize = Math.max(4, Math.floor(len * 0.04))
        let sum = 0
        for (let j = center - bandSize; j <= center + bandSize; j++) {
          if (j >= 0 && j < len) sum += data[j]
        }
        const avg = sum / (bandSize * 2 + 1) / 255 // normalize 0-1
        // Smooth
        smooth[i] += (avg - smooth[i]) * 0.3
      }

      for (let i = 0; i < 5; i++) {
        const span = spansRef.current[i]
        if (!span) continue
        const l = LETTERS[i]
        const energy = smooth[i]

        const rot = l.baseRot + energy * 8 * (i % 2 === 0 ? 1 : -1)
        const y = l.baseY + energy * -4
        const scale = 1 + energy * 0.25

        span.style.transform = `rotate(${rot}deg) translateY(${y}px) scale(${scale})`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, analyserRef])

  return (
    <h1 className="logo">
      {LETTERS.map((l, i) => (
        <span
          key={i}
          ref={el => spansRef.current[i] = el}
          className="logo-letter"
          style={{
            color: l.color,
            '--rot': `${l.baseRot}deg`,
            '--y': `${l.baseY}px`,
          }}
        >
          {l.char}
        </span>
      ))}
    </h1>
  )
}
