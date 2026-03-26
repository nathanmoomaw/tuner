# Tuner

A simple, ad-free, distraction-free web-based musical tuner. Uses your microphone for real-time pitch detection with a rich visual experience.

**Live:** [tuner.obfusco.us](https://tuner.obfusco.us)
**Dev:** [tuner-dev.obfusco.us](https://tuner-dev.obfusco.us)

## Features

- **Chromatic tuner** -- real-time pitch detection via autocorrelation, displaying note name, octave, cents deviation, and frequency
- **Chord identification** -- FFT-based polyphonic detection matching against major, minor, 7th, sus, dim, aug, and more
- **3D note wheel** -- spherical visualization with 12 chromatic notes on a tilted orbit, smooth lerped rotation, depth-sorted rendering
- **Cents sphere** -- 3D sphere gauge showing flat/sharp deviation with color-coded feedback (green = in tune, red = off)
- **Mobius ribbon visualizer** -- audio-reactive twisted ribbon encircling the key area, expanding outward with frequency energy
- **Particle sphere buttons** -- fibonacci-distributed dot spheres with session-unique patterns, gentle bob and rotation
- **Spectrographic colors** -- green/yellow/red feedback across all UI elements based on tuning accuracy
- **Adjustable reference pitch** -- A4 = 400-480 Hz (default 440)
- **Spacebar start/stop** -- hands-free control
- **Dark theme** -- minimal, readable UI designed for music stands and mobile

## Stack

- Vite + React
- Web Audio API (`getUserMedia`, `AnalyserNode`, FFT)
- Canvas 2D for all visualizations (no libraries)
- npm

## Development

```bash
npm install
npm run dev
```

## Deployment

- **Production** deploys on push to `main` via GitHub Actions
- **Dev** deploys on push to `nmj/*` branches
- Hosted on S3 + CloudFront + Route 53

See [CLAUDE.md](CLAUDE.md) for full deployment details and git workflow.
