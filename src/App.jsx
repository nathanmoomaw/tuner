import { useState, useEffect, useCallback } from 'react'
import { useTuner } from './hooks/useTuner'
import { Visualizer } from './components/Visualizer'
import { NoteWheel } from './components/NoteWheel'
import { CentsSphere } from './components/CentsSphere'
import { ParticleSphere } from './components/ParticleSphere'
import './App.css'

function TunerDisplay({ note }) {
  const displayCents = note ? note.cents : 0
  const isActive = note?.active ?? false

  return (
    <div className="note-display">
      <NoteWheel note={note} />
      <CentsSphere cents={displayCents} active={isActive} />
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
  const [showViz, setShowViz] = useState(true)
  const { listening, mode, setMode, note, chord, error, start, stop, analyserRef } = useTuner(a4)

  const stopWithExitFullscreen = useCallback(() => {
    stop()
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }
  }, [stop])

  const startWithFullscreen = useCallback(() => {
    start()
    // Only request fullscreen on mobile/touch devices
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isMobile) {
      const el = document.documentElement
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {})
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      }
    }
  }, [start])

  const toggle = useCallback(() => {
    if (listening) {
      stopWithExitFullscreen()
    } else {
      startWithFullscreen()
    }
  }, [listening, stopWithExitFullscreen, startWithFullscreen])

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
      <Visualizer analyserRef={analyserRef} active={listening} visible={showViz} />
      <header className="tuner-header">
        <h1 className="logo">
          <span className="logo-letter" style={{color:'#a78bfa', '--rot':'-4deg', '--y':'-1px'}}>t</span>
          <span className="logo-letter" style={{color:'#60a5fa', '--rot':'3deg', '--y':'2px'}}>u</span>
          <span className="logo-letter" style={{color:'#34d399', '--rot':'-2deg', '--y':'-2px'}}>n</span>
          <span className="logo-letter" style={{color:'#fbbf24', '--rot':'5deg', '--y':'1px'}}>e</span>
          <span className="logo-letter" style={{color:'#f87171', '--rot':'-3deg', '--y':'-1px'}}>r</span>
        </h1>
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
          <button
              className={`viz-btn ${showViz ? 'active' : ''}`}
              onClick={() => setShowViz((v) => !v)}
              title={showViz ? 'Hide visualizer' : 'Show visualizer'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M1 8 Q4 3.5 8 8 Q12 12.5 15 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
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
            <ParticleSphere onClick={startWithFullscreen} label={'Start\nTuning'} seedOffset={0} />
            <div className="spacebar-hint">or press spacebar</div>
          </div>
        ) : (
          <>
            {mode === 'tuner' ? (
              <TunerDisplay note={note} />
            ) : (
              <ChordDisplay chord={chord} />
            )}
            <div className="stop-area">
              <ParticleSphere onClick={stopWithExitFullscreen} label="Stop" seedOffset={42} size={100} dotCount={100} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
