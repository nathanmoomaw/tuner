# Devlog

## 2026-03-25 — Deploy pipeline + visualizer redesign

- Deployed to tuner.obfusco.us (S3 + CloudFront + Route 53)
- Dev environment at tuner-dev.obfusco.us for nmj/* branches
- GitHub Actions CI/CD: auto-deploy on push to main or nmj/* branches
- IAM user github-actions-moomaw with scoped S3/CF permissions
- Redesigned visualizer: flowing rainbow waveform lines (matching reference art)
- Full viewport width, centered vertically behind the key display
- Radial gradient mask dims the center so note/chord info stays legible

## 2026-03-25 — Background audio visualizer

- Canvas-based frequency bar visualizer behind tuner UI
- Uses FFT byte frequency data from shared analyser node
- Bars color-mapped by frequency: warm (low) to cool (high) via HSL
- Subtle opacity (0.15–0.4) so it doesn't compete with the tuner display
- Responsive canvas with devicePixelRatio scaling
- Only renders when mic is active

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
