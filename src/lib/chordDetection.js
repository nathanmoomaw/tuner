import { frequencyToNote } from './pitchDetection'

/**
 * Chord interval patterns (semitones from root).
 * Order matters — more specific matches first.
 */
const CHORD_PATTERNS = [
  // Sevenths
  { intervals: [0, 4, 7, 11], name: 'maj7' },
  { intervals: [0, 3, 7, 10], name: 'm7' },
  { intervals: [0, 4, 7, 10], name: '7' },
  { intervals: [0, 3, 6, 10], name: 'm7b5' },
  { intervals: [0, 3, 6, 9], name: 'dim7' },
  // Sixths
  { intervals: [0, 4, 7, 9], name: '6' },
  { intervals: [0, 3, 7, 9], name: 'm6' },
  // Suspended
  { intervals: [0, 5, 7], name: 'sus4' },
  { intervals: [0, 2, 7], name: 'sus2' },
  // Augmented / diminished
  { intervals: [0, 4, 8], name: 'aug' },
  { intervals: [0, 3, 6], name: 'dim' },
  // Triads (last so more specific patterns match first)
  { intervals: [0, 4, 7], name: 'maj' },
  { intervals: [0, 3, 7], name: 'm' },
  // Power chord
  { intervals: [0, 7], name: '5' },
]

/**
 * Extract prominent frequency peaks from FFT data.
 * Returns array of { frequency, magnitude }.
 */
export function extractPeaks(freqData, sampleRate, fftSize, minDb = -60) {
  const binHz = sampleRate / fftSize
  const peaks = []

  // Only look at musically useful range: ~60 Hz to ~2000 Hz
  const minBin = Math.floor(60 / binHz)
  const maxBin = Math.min(Math.floor(2000 / binHz), freqData.length - 2)

  for (let i = minBin + 1; i < maxBin; i++) {
    const mag = freqData[i]
    if (mag < minDb) continue

    // Local maximum: higher than both neighbors
    if (mag > freqData[i - 1] && mag > freqData[i + 1]) {
      peaks.push({ frequency: i * binHz, magnitude: mag })
    }
  }

  // Sort by magnitude descending, take top peaks
  peaks.sort((a, b) => b.magnitude - a.magnitude)

  // Filter out peaks that are likely harmonics of stronger peaks
  const filtered = []
  for (const peak of peaks) {
    let isHarmonic = false
    for (const kept of filtered) {
      const ratio = peak.frequency / kept.frequency
      const nearestInt = Math.round(ratio)
      if (nearestInt >= 2 && nearestInt <= 6 && Math.abs(ratio - nearestInt) < 0.06) {
        isHarmonic = true
        break
      }
    }
    if (!isHarmonic) {
      filtered.push(peak)
    }
    if (filtered.length >= 6) break
  }

  return filtered
}

/**
 * Given a set of detected note pitch classes, identify the chord.
 * Returns { root, name, notes } or null.
 */
export function identifyChord(pitchClasses) {
  if (pitchClasses.length < 2) return null

  // Deduplicate pitch classes
  const unique = [...new Set(pitchClasses)].sort((a, b) => a - b)
  if (unique.length < 2) return null

  let bestMatch = null
  let bestScore = 0

  // Try each pitch class as potential root
  for (const root of unique) {
    const intervals = unique.map((pc) => ((pc - root) + 12) % 12).sort((a, b) => a - b)

    for (const pattern of CHORD_PATTERNS) {
      // Check how many pattern intervals are present
      const matched = pattern.intervals.filter((iv) => intervals.includes(iv)).length
      const score = matched / pattern.intervals.length

      // All pattern intervals must be present
      if (matched === pattern.intervals.length && score > bestScore) {
        bestScore = score
        bestMatch = { root, name: pattern.name }
      }
    }
  }

  return bestMatch
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Full chord detection pipeline: FFT data → chord name.
 */
export function detectChord(freqData, sampleRate, fftSize, a4 = 440) {
  const peaks = extractPeaks(freqData, sampleRate, fftSize)
  if (peaks.length < 2) return null

  const notes = peaks.map((p) => {
    const info = frequencyToNote(p.frequency, a4)
    return { ...info, frequency: p.frequency, magnitude: p.magnitude }
  })

  const pitchClasses = notes.map((n) => ((n.midiNote % 12) + 12) % 12)
  const result = identifyChord(pitchClasses)
  if (!result) return null

  const rootName = NOTE_NAMES[result.root]
  const displayName = result.name === 'maj' ? rootName : `${rootName}${result.name}`

  return {
    chord: displayName,
    root: rootName,
    quality: result.name,
    notes: notes.map((n) => n.name),
    frequencies: notes.map((n) => Math.round(n.frequency)),
  }
}
