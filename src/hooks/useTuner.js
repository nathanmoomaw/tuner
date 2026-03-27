import { useState, useRef, useCallback, useEffect } from 'react'
import { detectPitch, frequencyToNote } from '../lib/pitchDetection'
import { detectChord } from '../lib/chordDetection'

const FFT_SIZE = 8192

export function useTuner(a4 = 440) {
  const [listening, setListening] = useState(false)
  const [mode, setMode] = useState('tuner') // 'tuner' | 'chord'
  const [note, setNote] = useState(null)
  const [chord, setChord] = useState(null)
  const [error, setError] = useState(null)

  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const bufferRef = useRef(null)
  const freqBufferRef = useRef(null)
  const a4Ref = useRef(a4)
  const modeRef = useRef(mode)
  const runningRef = useRef(false)
  const loopRef = useRef(null)
  const staleTimerRef = useRef(null)
  const chordStaleTimerRef = useRef(null)
  const centsHistoryRef = useRef([])
  const freqHistoryRef = useRef([])
  const lastNoteRef = useRef(null)
  const noteConfirmRef = useRef({ name: null, count: 0 })
  const lastUpdateRef = useRef(0)

  useEffect(() => {
    a4Ref.current = a4
  }, [a4])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    loopRef.current = () => {
      if (!runningRef.current) return

      const analyser = analyserRef.current
      const buffer = bufferRef.current
      const freqBuffer = freqBufferRef.current
      if (!analyser || !buffer || !freqBuffer) {
        rafRef.current = requestAnimationFrame(loopRef.current)
        return
      }

      const sampleRate = audioCtxRef.current.sampleRate

      if (modeRef.current === 'tuner') {
        // Single-pitch detection
        analyser.getFloatTimeDomainData(buffer)
        const result = detectPitch(buffer, sampleRate)

        if (result && result.clarity > 0.9) {
          const noteInfo = frequencyToNote(result.frequency, a4Ref.current)

          // Note-change hysteresis: require 3 consecutive detections before switching
          const confirm = noteConfirmRef.current
          if (noteInfo.name !== lastNoteRef.current) {
            if (noteInfo.name === confirm.name) {
              confirm.count++
            } else {
              confirm.name = noteInfo.name
              confirm.count = 1
            }
            if (confirm.count < 3) {
              rafRef.current = requestAnimationFrame(loopRef.current)
              return
            }
            // Confirmed note change
            centsHistoryRef.current = []
            freqHistoryRef.current = []
            lastNoteRef.current = noteInfo.name
          }

          // Rolling median of cents for stability (last 12 readings)
          const cHistory = centsHistoryRef.current
          cHistory.push(noteInfo.cents)
          if (cHistory.length > 12) cHistory.shift()
          const sorted = [...cHistory].sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          const smoothedCents = sorted.length % 2 === 0
            ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
            : sorted[mid]

          // Smooth frequency display
          const fHistory = freqHistoryRef.current
          fHistory.push(result.frequency)
          if (fHistory.length > 6) fHistory.shift()
          const smoothedFreq = Math.round(
            (fHistory.reduce((a, b) => a + b, 0) / fHistory.length) * 10
          ) / 10

          // Throttle state updates to ~20/sec to reduce render churn
          const now = performance.now()
          if (now - lastUpdateRef.current < 50) {
            rafRef.current = requestAnimationFrame(loopRef.current)
            return
          }
          lastUpdateRef.current = now

          setNote({
            name: noteInfo.name,
            octave: noteInfo.octave,
            cents: smoothedCents,
            frequency: smoothedFreq,
            clarity: result.clarity,
            active: true,
          })
          if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
          staleTimerRef.current = setTimeout(() => {
            setNote((prev) => prev ? { ...prev, active: false } : prev)
          }, 1500)
        }
      } else {
        // Chord detection via FFT
        analyser.getFloatFrequencyData(freqBuffer)
        const result = detectChord(freqBuffer, sampleRate, analyser.fftSize, a4Ref.current)

        if (result) {
          setChord({ ...result, active: true })
          if (chordStaleTimerRef.current) clearTimeout(chordStaleTimerRef.current)
          chordStaleTimerRef.current = setTimeout(() => {
            setChord((prev) => prev ? { ...prev, active: false } : prev)
          }, 2000)
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
      analyser.smoothingTimeConstant = 0.6
      source.connect(analyser)
      analyserRef.current = analyser
      bufferRef.current = new Float32Array(analyser.fftSize)
      freqBufferRef.current = new Float32Array(analyser.frequencyBinCount)

      runningRef.current = true
      setListening(true)
      rafRef.current = requestAnimationFrame(loopRef.current)
    } catch (err) {
      console.error('Tuner start error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow mic access and try again.')
      } else {
        setError(`Audio error: ${err.message}`)
      }
    }
  }, [])

  const stop = useCallback(() => {
    runningRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
    if (chordStaleTimerRef.current) clearTimeout(chordStaleTimerRef.current)
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
    freqBufferRef.current = null
    setListening(false)
    setNote(null)
    setChord(null)
  }, [])

  useEffect(() => {
    return () => {
      runningRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  return { listening, mode, setMode, note, chord, error, start, stop, analyserRef }
}
