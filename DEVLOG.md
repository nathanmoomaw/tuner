# Devlog

## 2026-03-25 — Sphere opacity + waveform edge bands

- Roughly doubled sphere body gradient opacity on both NoteWheel and CentsSphere
- Boosted specular highlights, rim glow, equator/meridian/latitude line visibility
- Redesigned visualizer: waveforms now render as ambient bands at top and bottom edges only
- Center of viewport is completely clear — no overlap with spheres or tuning UI
- Reduced waveform alpha (decorative, not competing with functional UI)
- Reduced amplitude to keep waveforms within their edge bands
- Soft linear gradient fades at band edges prevent hard cutoffs
- Removed old arch/center-fade approach in favor of edge-only rendering

## 2026-03-25 — Waveform encircle + sphere start button

- Increased waveform arch strength (0.24h) so waveforms fully encircle the key area without touching it
- Stronger center radial fade (0.98 opacity, 0.48 radius) for clean separation
- Start button replaced with animated 3D sphere: gently bobs up/down, slowly rotating globe wireframe
- Sphere has full 3D lighting (gradient body, specular, rim glow, ground shadow)
- Rotating meridians and latitude lines create living globe effect
- "Start Tuning" text rendered on sphere surface
- Hover/active scale transforms for tactile feedback

## 2026-03-25 — Waveform arch, viz toggle, 3D spheres

- Waveform now arches over and under the key area, clearing the center for readability
- Stronger center radial fade (0.92 opacity, larger radius) for mobile legibility
- Text-shadow on all UI elements over the visualizer for contrast
- Visualizer toggle button (wave icon) in header — easily turn waveform on/off
- Both spheres upgraded to full circular 3D bodies (not just orbit ellipses)
- Radial gradient lighting with top-left light source for realistic shading
- Added specular highlights, rim glow, ground shadows beneath both spheres
- Globe wireframe: longitude meridian + latitude lines on note wheel
- More dramatic depth scaling on notes (0.35-1.0 range vs 0.5-1.0)

## 2026-03-25 — Sphere skin + cents sphere

- Enhanced note wheel with 3D sphere skin: filled gradient body with directional lighting, specular highlight, rim light on orbit, inner latitude line for depth
- New CentsSphere component replaces the old flat CentsGauge
- CentsSphere: a smaller 3D sphere that rotates based on cents deviation
- Tick marks along the orbit from -50 to +50 cents, z-sorted for depth
- Glowing indicator dot at the reference point with tuning color (green→red)
- "flat"/"sharp" labels on sides, cents readout in center
- Smooth lerped rotation animation matching the note wheel style
- Removed old DOM-based gauge styles (gauge-track, gauge-needle, etc.)

## 2026-03-25 — Spherical note wheel visualization

- New NoteWheel canvas component: 12 chromatic notes arranged on a 3D-tilted elliptical orbit
- Sphere smoothly spins to the detected note with lerped animation
- Shortest-path rotation handles wrapping (B to C, etc.)
- Z-sorted rendering: front notes are large/bright, back notes are small/dim
- Active note gets colored glow (green=in tune, red=off) matching cents deviation
- Center displays note name, octave, cents, and frequency
- Reference triangle indicator at top of orbit
- Keeps existing CentsGauge below the wheel for precision tuning feedback
- Replaces the old flat text-based TunerDisplay

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
