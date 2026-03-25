import { useState, useRef, useCallback, useEffect } from 'react'
import { detectPitch, frequencyToNote } from '../lib/pitchDetection'

const FFT_SIZE = 4096

export function useTuner(a4 = 440) {
  const [listening, setListening] = useState(false)
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)

  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const bufferRef = useRef(null)
  const a4Ref = useRef(a4)
  const runningRef = useRef(false)
  const loopRef = useRef(null)

  useEffect(() => {
    a4Ref.current = a4
  }, [a4])

  // Store loop in a ref to avoid self-reference in useCallback
  useEffect(() => {
    loopRef.current = () => {
      if (!runningRef.current) return

      const analyser = analyserRef.current
      const buffer = bufferRef.current
      if (analyser && buffer) {
        analyser.getFloatTimeDomainData(buffer)
        const result = detectPitch(buffer, audioCtxRef.current.sampleRate)

        if (result && result.clarity > 0.8) {
          const noteInfo = frequencyToNote(result.frequency, a4Ref.current)
          setNote({
            name: noteInfo.name,
            octave: noteInfo.octave,
            cents: noteInfo.cents,
            frequency: Math.round(result.frequency * 10) / 10,
            clarity: result.clarity,
          })
        } else {
          setNote(null)
        }
      }

      rafRef.current = requestAnimationFrame(loopRef.current)
    }
  }, [])

  const start = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx

      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      source.connect(analyser)
      analyserRef.current = analyser
      bufferRef.current = new Float32Array(analyser.fftSize)

      runningRef.current = true
      setListening(true)
      rafRef.current = requestAnimationFrame(loopRef.current)
    } catch {
      setError('Microphone access denied. Please allow mic access and try again.')
    }
  }, [])

  const stop = useCallback(() => {
    runningRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    analyserRef.current = null
    bufferRef.current = null
    setListening(false)
    setNote(null)
  }, [])

  useEffect(() => {
    return () => {
      runningRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  return { listening, note, error, start, stop }
}
