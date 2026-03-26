# Roadmap

## Up Next
- [ ] Guitar tuning presets (standard, drop D, open G, DADGAD, etc.)
- [ ] Other instrument presets (bass, ukulele, violin, cello, etc.)

## Completed
- [x] Project scaffold (Vite + React)
- [x] Mic input via Web Audio API (getUserMedia)
- [x] Pitch detection algorithm (autocorrelation)
- [x] Chromatic tuner display (note name, cents, frequency)
- [x] Visual indicator (needle/gauge showing sharp/flat)
- [x] Reference pitch setting (A4 = 440 Hz default, adjustable)
- [x] Dark theme UI
- [x] Mobile-friendly layout
- [x] Spectrographic color feedback (green=in tune, red=off)
- [x] Persistent note display (holds last detected note)
- [x] Stable layout (no jiggle between listening/detected states)
- [x] Chord identification mode (FFT peak extraction + chord matching)
- [x] Spacebar start/stop
- [x] Background audio visualizer (frequency bars)
- [x] Redesigned visualizer (flowing rainbow waveforms, center fade)
- [x] Deploy to tuner.obfusco.us (S3 + CloudFront + CI/CD)
- [x] Dev environment at tuner-dev.obfusco.us
- [x] Spherical note wheel visualization (3D orbit, animated rotation, color-coded tuning)
- [x] Sphere skin with 3D lighting, specular highlight, and opacity
- [x] Cents sphere — 3D sphere gauge for flat/sharp deviation
- [x] Waveform arch over/under key area for readability
- [x] Visualizer toggle button
- [x] Enhanced 3D sphere rendering (full body, specular, shadows, wireframe)
- [x] Waveform encircles key area without touching it
- [x] Animated 3D sphere start button (bobbing, rotating)
- [x] Increased sphere opacity for better visibility
- [x] Visualizer moved to top/bottom edge bands (decorative framing, clear center)
- [x] Möbius ribbon visualizer (endless twisted ribbon encircling key area, audio-reactive)
- [x] Particle sphere buttons (fibonacci dot distribution, rainbow colors, session-unique patterns)
- [x] Grid-style particle spheres with reduced opacity
- [x] Outward-only ribbon vibration (expands away from key area)
- [x] Particle sphere favicon
- [x] Bigger, more audio-responsive ribbon (outward-only expansion)
- [x] Chaotic fibonacci particle sphere buttons
- [x] Smoother NoteWheel rotation (reduced lerp for calmer transitions)
- [x] Stop button repositioned above visualizer ribbon
- [x] Multicolored lowercase logo in Roboto Mono
- [x] Mobile fullscreen on start (removes browser chrome for full viewport)
