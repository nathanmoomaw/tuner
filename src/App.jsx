import { useState } from 'react'
import { useTuner } from './hooks/useTuner'
import './App.css'

/**
 * Maps cents offset to a color on a spectrum:
 * 0 cents = bright green (in tune)
 * ±15 cents = yellow
 * ±30+ cents = red/orange (way off)
 */
function centsToColor(cents, active) {
  if (!active) return 'rgba(156, 163, 175, 0.3)' // dim gray when stale
  const absCents = Math.min(Math.abs(cents), 50)
  // 0 → 120° (green), 50 → 0° (red) in HSL
  const hue = Math.round(120 * (1 - absCents / 50))
  const saturation = 80
  const lightness = 55
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function CentsGauge({ cents, active }) {
  const clampedCents = Math.max(-50, Math.min(50, cents))
  const rotation = (clampedCents / 50) * 45
  const color = centsToColor(cents, active)

  return (
    <div className="gauge">
      <div className="gauge-track">
        <div className="gauge-labels">
          <span className="gauge-label flat">flat</span>
          <span className="gauge-label sharp">sharp</span>
        </div>
        <div className="gauge-ticks">
          {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((tick) => (
            <div
              key={tick}
              className={`gauge-tick ${tick === 0 ? 'center' : ''}`}
            />
          ))}
        </div>
        <div
          className="gauge-needle"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            background: color,
          }}
        />
      </div>
      <div className="cents-value" style={{ color }}>
        {cents > 0 ? '+' : ''}{cents} cents
      </div>
    </div>
  )
}

function App() {
  const [a4, setA4] = useState(440)
  const { listening, note, error, start, stop } = useTuner(a4)

  const displayName = note ? note.name : '--'
  const displayOctave = note ? note.octave : ''
  const displayCents = note ? note.cents : 0
  const displayFreq = note ? `${note.frequency} Hz` : ''
  const isActive = note?.active ?? false
  const noteColor = note ? centsToColor(note.cents, isActive) : undefined

  return (
    <div className="tuner">
      <header className="tuner-header">
        <h1>Tuner</h1>
        <div className="a4-control">
          <label>
            A4 =
            <input
              type="number"
              min="400"
              max="480"
              value={a4}
              onChange={(e) => setA4(Number(e.target.value))}
            />
            Hz
          </label>
        </div>
      </header>

      <main className="tuner-display">
        {error && <p className="error">{error}</p>}

        {!listening ? (
          <button className="start-btn" onClick={start}>
            Start Tuning
          </button>
        ) : (
          <>
            <div className="note-display">
              <div
                className={`note-name ${!isActive ? 'stale' : ''}`}
                style={noteColor ? { color: noteColor } : undefined}
              >
                {displayName}
                {displayOctave !== '' && (
                  <span className="note-octave">{displayOctave}</span>
                )}
              </div>
              <CentsGauge cents={displayCents} active={isActive} />
              <div className="frequency">{displayFreq || '\u00A0'}</div>
            </div>
            <button className="stop-btn" onClick={stop}>
              Stop
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default App
