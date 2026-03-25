import { useState, useRef, useCallback, useEffect } from 'react'
import { detectPitch, frequencyToNote } from '../lib/pitchDetection'
import { detectChord } from '../lib/chordDetection'

const FFT_SIZE = 4096

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

        if (result && result.clarity > 0.8) {
          const noteInfo = frequencyToNote(result.frequency, a4Ref.current)
          setNote({
            name: noteInfo.name,
            octave: noteInfo.octave,
            cents: noteInfo.cents,
            frequency: Math.round(result.frequency * 10) / 10,
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
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser
      bufferRef.current = new Float32Array(analyser.fftSize)
      freqBufferRef.current = new Float32Array(analyser.frequencyBinCount)

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
