# Devlog

## 2026-03-25 — Chord detection mode, spacebar control

- Added chord identification mode (Note/Chord toggle in header)
- FFT-based peak extraction with harmonic filtering for polyphonic detection
- Chord dictionary: major, minor, 7th, maj7, m7, dim, aug, sus2, sus4, 6th, m7b5, dim7, power chords
- Spacebar toggles start/stop for hands-free use
- Shared audio pipeline between tuner and chord modes

## 2026-03-25 — UX polish: persistent display, spectrographic colors

- Note persists on screen for 1.5s after signal drops (fades to stale state)
- Spectrographic color feedback: green when in tune, yellow/red as cents drift
- Colors applied to note name, gauge needle, and cents readout
- Removed "Listening..." text — gauge always visible to reduce layout jiggle
- Smooth transitions on all color and position changes

## 2026-03-25 — Core chromatic tuner implemented

- Built autocorrelation-based pitch detection engine
- Created `useTuner` hook for mic input via Web Audio API (getUserMedia)
- Chromatic tuner UI: note name, octave, cents gauge, frequency display
- Adjustable A4 reference pitch (default 440 Hz)
- Dark theme, minimal design, mobile-friendly layout
- Removed Vite scaffold boilerplate

## 2026-03-24 — Project created

- Scaffolded Vite + React project.
- Created GitHub repo and initial project docs.
