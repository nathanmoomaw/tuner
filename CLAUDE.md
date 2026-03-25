# Tuner

A simple, ad-free, distraction-free web-based musical tuner. Primarily for personal use.

## Stack
- Vite + React
- Web Audio API (mic input, pitch detection)
- npm as package manager

## Core Concepts

### Pitch Detection
- Real-time microphone input via Web Audio API
- Accurate pitch detection algorithm (autocorrelation or similar)
- Display detected note, cents sharp/flat, and frequency in Hz

### Tuning Modes
- Standard chromatic tuner
- Guitar (standard, drop D, open tunings, etc.)
- Bass, ukulele, violin, and other string instruments
- Custom/arbitrary reference pitch (A4 = 432 Hz, 440 Hz, etc.)
- Support for all common temperaments

### Design Direction
- Clean, minimal, zero distractions
- No ads, no popups, no tracking
- Large, readable display — works well on a music stand or propped-up phone
- Dark theme by default
- Colorful graphic display to fill screen, geared towards mobile use

## Hosting & Deployment
- Production: tuner.obfusco.us
- Versioned deploys at /v1, /v2, etc. (if needed)

## Git Workflow
- Push after every commit
- Keep CLAUDE.md, DEVLOG.md, ROADMAP.md updated before committing
- DEVLOG: reverse-chronological (newest at top)
- ROADMAP: mark completed items with `[x]`, move to Completed section
- Git auth via `gh auth` with HTTPS
