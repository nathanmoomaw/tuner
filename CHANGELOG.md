# Changelog

## v1.1 — 2026-05-25

### Improved
- **Pitch detection** — raised MPM cutoff threshold and added subharmonic check to reduce octave errors on low guitar strings (e.g. open low E reading as B)
- **CentsSphere** — directional tuning arrows: ▲ above cents when flat (tune up), ▼ below when sharp (tune down)
- **CentsSphere** — orbiting ring animation circles the sphere clockwise when flat, counterclockwise when sharp; speed scales with deviation; stops at perfect pitch
- **CentsSphere** — fixed 'sharp' label clipping on narrow screens

### Infrastructure
- New branch pattern: `dev/vX.Y` replaces `nmj/wX` for dev deployments
- `dev/**` branches now auto-deploy to tuner-dev.obfusco.us

### Personal (not in app)
- Created `todos.md` for items requiring manual action (app store signups, etc.)

---

## v1.0 — 2026-03-27

Initial shipped release.

### Features
- Chromatic tuner with McLeod Pitch Method pitch detection
- NoteWheel — 3D sphere showing note orbit with smooth rotation
- CentsSphere — 3D sphere gauge for flat/sharp deviation
- Möbius ribbon visualizer, audio-reactive
- Particle sphere buttons (session-unique fibonacci patterns)
- Audio-reactive logo letters
- Chord detection mode
- Mobile fullscreen on start/stop
- Deployed: tuner.obfusco.us (prod) + tuner-dev.obfusco.us (dev)
- Capacitor scaffold for iOS + Android native apps
