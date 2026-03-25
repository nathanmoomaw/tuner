import { useState } from 'react'
import { useTuner } from './hooks/useTuner'
import './App.css'

function CentsGauge({ cents }) {
  // cents ranges from -50 to +50
  const clampedCents = Math.max(-50, Math.min(50, cents))
  const rotation = (clampedCents / 50) * 45 // max 45deg each way

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
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
      </div>
      <div className="cents-value">
        {cents > 0 ? '+' : ''}{cents} cents
      </div>
    </div>
  )
}

function App() {
  const [a4, setA4] = useState(440)
  const { listening, note, error, start, stop } = useTuner(a4)

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
            {note ? (
              <div className="note-display">
                <div className="note-name">
                  {note.name}
                  <span className="note-octave">{note.octave}</span>
                </div>
                <CentsGauge cents={note.cents} />
                <div className="frequency">{note.frequency} Hz</div>
              </div>
            ) : (
              <div className="note-display">
                <div className="note-name listening">--</div>
                <div className="frequency">Listening...</div>
              </div>
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
