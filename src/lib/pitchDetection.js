/**
 * Autocorrelation-based pitch detection.
 * Returns { frequency, clarity } or null if no pitch detected.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function detectPitch(buffer, sampleRate) {
  const size = buffer.length
  const halfSize = Math.floor(size / 2)

  // Check if signal is loud enough
  let rms = 0
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / size)
  if (rms < 0.01) return null

  // Autocorrelation
  const correlations = new Float32Array(halfSize)
  for (let lag = 0; lag < halfSize; lag++) {
    let sum = 0
    for (let i = 0; i < halfSize; i++) {
      sum += buffer[i] * buffer[i + lag]
    }
    correlations[lag] = sum
  }

  // Find the first dip then the next peak
  // Skip lag 0 (always max), find first valley
  let d = 0
  while (d < halfSize - 1 && correlations[d] > correlations[d + 1]) {
    d++
  }

  let bestLag = d
  let bestVal = -1
  for (let i = d; i < halfSize; i++) {
    if (correlations[i] > bestVal) {
      bestVal = correlations[i]
      bestLag = i
    }
  }

  if (bestLag === 0 || bestVal <= 0) return null

  // Parabolic interpolation for sub-sample accuracy
  const prev = correlations[bestLag - 1] || 0
  const curr = correlations[bestLag]
  const next = correlations[bestLag + 1] || 0
  const shift = (prev - next) / (2 * (prev - 2 * curr + next))
  const refinedLag = bestLag + (isFinite(shift) ? shift : 0)

  const frequency = sampleRate / refinedLag
  const clarity = bestVal / correlations[0]

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
