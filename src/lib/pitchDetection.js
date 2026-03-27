/**
 * McLeod Pitch Method (MPM) — Normalized Square Difference Function.
 * Much more accurate than basic autocorrelation, with fewer octave errors.
 * Returns { frequency, clarity } or null if no pitch detected.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Pre-computed Hanning window (lazily initialized per buffer size)
const windowCache = new Map()
function getHanningWindow(size) {
  if (windowCache.has(size)) return windowCache.get(size)
  const win = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)))
  }
  windowCache.set(size, win)
  return win
}

export function detectPitch(buffer, sampleRate) {
  const size = buffer.length

  // Check if signal is loud enough
  let rms = 0
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / size)
  if (rms < 0.01) return null

  // Apply Hanning window to reduce spectral leakage
  const window = getHanningWindow(size)
  const windowed = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    windowed[i] = buffer[i] * window[i]
  }

  // Compute Normalized Square Difference Function (NSDF)
  // NSDF(tau) = 2 * r(tau) / (m(tau))
  // where r(tau) = autocorrelation, m(tau) = sum of squared terms
  const halfSize = Math.floor(size / 2)
  const nsdf = new Float32Array(halfSize)

  for (let tau = 0; tau < halfSize; tau++) {
    let acf = 0  // autocorrelation
    let m = 0    // normalizing term
    for (let i = 0; i < halfSize; i++) {
      acf += windowed[i] * windowed[i + tau]
      m += windowed[i] * windowed[i] + windowed[i + tau] * windowed[i + tau]
    }
    nsdf[tau] = m > 0 ? (2 * acf) / m : 0
  }

  // Find positive-going zero crossings, then find peaks between them
  // MPM: pick the first peak above a threshold (key max * CUTOFF)
  const peaks = []  // { lag, value }

  // Find all local maxima where nsdf > 0
  let positiveRegion = false
  let maxInRegion = -Infinity
  let maxLag = 0

  for (let i = 1; i < halfSize - 1; i++) {
    if (nsdf[i] > 0) {
      if (!positiveRegion) {
        positiveRegion = true
        maxInRegion = -Infinity
      }
      if (nsdf[i] > maxInRegion) {
        maxInRegion = nsdf[i]
        maxLag = i
      }
    } else if (positiveRegion) {
      // Exiting a positive region — record the peak
      if (maxInRegion > 0) {
        peaks.push({ lag: maxLag, value: maxInRegion })
      }
      positiveRegion = false
    }
  }
  // Catch final region
  if (positiveRegion && maxInRegion > 0) {
    peaks.push({ lag: maxLag, value: maxInRegion })
  }

  if (peaks.length === 0) return null

  // Find the global maximum peak value
  let globalMax = -Infinity
  for (const p of peaks) {
    if (p.value > globalMax) globalMax = p.value
  }

  // MPM: pick the first peak that exceeds CUTOFF * globalMax
  // This avoids octave errors by preferring the fundamental
  const CUTOFF = 0.93
  const threshold = CUTOFF * globalMax
  let bestPeak = null
  for (const p of peaks) {
    if (p.value >= threshold) {
      bestPeak = p
      break
    }
  }

  if (!bestPeak || bestPeak.lag === 0) return null

  // Parabolic interpolation for sub-sample accuracy
  const lag = bestPeak.lag
  const prev = nsdf[lag - 1] || 0
  const curr = nsdf[lag]
  const next = nsdf[lag + 1] || 0
  const denom = 2 * (prev - 2 * curr + next)
  const shift = denom !== 0 ? (prev - next) / denom : 0
  const refinedLag = lag + (isFinite(shift) ? shift : 0)

  const frequency = sampleRate / refinedLag
  const clarity = bestPeak.value  // NSDF peak is already normalized 0-1

  // Sanity check: musical range roughly 20 Hz to 5000 Hz
  if (frequency < 20 || frequency > 5000) return null

  return { frequency, clarity }
}

/**
 * Given a frequency and reference A4, return note info.
 */
export function frequencyToNote(frequency, a4 = 440) {
  const semitonesFromA4 = 12 * Math.log2(frequency / a4)
  const roundedSemitones = Math.round(semitonesFromA4)
  const cents = Math.round((semitonesFromA4 - roundedSemitones) * 100)

  // A4 is MIDI note 69
  const midiNote = 69 + roundedSemitones
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = ((midiNote % 12) + 12) % 12
  const name = NOTE_NAMES[noteIndex]

  return { name, octave, cents, midiNote }
}
