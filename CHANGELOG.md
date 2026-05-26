# Changelog

## v1.1 — 2026-05-26

### Added
- **Audio-reactive logo** — each letter in the "tuner" wordmark reacts to a different frequency band; scales, rotates, and bounces with audio energy
- **Capacitor native app scaffold** — iOS + Android wrappers with mic permissions, safe-area insets, dark status bar, and splash screen configured (bundle ID: `us.obfusco.tuner`)

### Improved
- **Pitch detection** — raised MPM cutoff threshold (0.93→0.95) and added subharmonic NSDF check to reduce octave errors on low guitar strings (e.g. open low E reading as B)
- **CentsSphere** — directional tuning arrows: ▲ above cents when flat (tune up), ▼ below when sharp (tune down); hidden at ±2 cents
- **CentsSphere** — orbiting elliptical ring (matches sphere tilt) circles clockwise when flat, counterclockwise when sharp; speed scales with deviation; stops at 0
- **CentsSphere** — fixed 'sharp' label clipping on narrow screens; fixed orbit ring being clipped by canvas edges (circle → tilted ellipse)

### Infrastructure
- New branch pattern: `dev/vX.Y` for dev deployments (cut from main)
- `dev/**` branches auto-deploy to tuner-dev.obfusco.us

---

## v1.0 — 2026-03-27

Initial shipped release.

### Features
- Chromatic tuner with McLeod Pitch Method pitch detection
- NoteWheel — 3D sphere showing note orbit with smooth rotation
- CentsSphere — 3D sphere gauge for flat/sharp deviation
- Möbius ribbon visualizer, audio-reactive
- Particle sphere buttons (session-unique fibonacci patterns)
- Chord detection mode
- Mobile fullscreen on start/stop
- Deployed: tuner.obfusco.us (prod) + tuner-dev.obfusco.us (dev)
