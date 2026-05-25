# Changelog

## v1.1 — 2026-05-25

### Improved
- **Pitch detection** — raised MPM cutoff threshold (0.93→0.95) and added subharmonic NSDF check to reduce octave errors on low guitar strings (e.g. open low E reading as B)
- **CentsSphere** — directional tuning arrows: ▲ above cents when flat (tune up), ▼ below when sharp (tune down); hidden at ±2 cents
- **CentsSphere** — orbiting dashed ring circles the sphere clockwise when flat, counterclockwise when sharp; speed scales with deviation; stops at 0
- **CentsSphere** — fixed 'sharp' label clipping on narrow screens

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
