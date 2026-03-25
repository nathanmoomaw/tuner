import { useState, useEffect, useCallback } from 'react'
import { useTuner } from './hooks/useTuner'
import { Visualizer } from './components/Visualizer'
import './App.css'

function centsToColor(cents, active) {
  if (!active) return 'rgba(156, 163, 175, 0.3)'
  const absCents = Math.min(Math.abs(cents), 50)
  const hue = Math.round(120 * (1 - absCents / 50))
  return `hsl(${hue}, 80%, 55%)`
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

function TunerDisplay({ note }) {
  const displayName = note ? note.name : '--'
  const displayOctave = note ? note.octave : ''
  const displayCents = note ? note.cents : 0
  const displayFreq = note ? `${note.frequency} Hz` : ''
  const isActive = note?.active ?? false
  const noteColor = note ? centsToColor(note.cents, isActive) : undefined

  return (
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
  )
}

function ChordDisplay({ chord }) {
  const isActive = chord?.active ?? false

  return (
    <div className="chord-display">
      <div className={`chord-name ${!isActive ? 'stale' : ''}`}>
        {chord ? chord.chord : '--'}
      </div>
      {chord && (
        <div className={`chord-notes ${!isActive ? 'stale' : ''}`}>
          {chord.notes.join(' \u2022 ')}
        </div>
      )}
      <div className="chord-hint">
        {!chord ? 'Play a chord...' : '\u00A0'}
      </div>
    </div>
  )
}

function App() {
  const [a4, setA4] = useState(440)
  const { listening, mode, setMode, note, chord, error, start, stop, analyserRef } = useTuner(a4)

  const toggle = useCallback(() => {
    if (listening) {
      stop()
    } else {
      start()
    }
  }, [listening, start, stop])

  // Spacebar to start/stop
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toggle])

  return (
    <div className="tuner">
      <Visualizer analyserRef={analyserRef} active={listening} />
      <header className="tuner-header">
        <h1>Tuner</h1>
        <div className="header-controls">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'tuner' ? 'active' : ''}`}
              onClick={() => setMode('tuner')}
            >
              Note
            </button>
            <button
              className={`mode-btn ${mode === 'chord' ? 'active' : ''}`}
              onClick={() => setMode('chord')}
            >
              Chord
            </button>
          </div>
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
        </div>
      </header>

      <main className="tuner-display">
        {error && <p className="error">{error}</p>}

        {!listening ? (
          <div className="start-area">
            <button className="start-btn" onClick={start}>
              Start Tuning
            </button>
            <div className="spacebar-hint">or press spacebar</div>
          </div>
        ) : (
          <>
            {mode === 'tuner' ? (
              <TunerDisplay note={note} />
            ) : (
              <ChordDisplay chord={chord} />
            )}
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
