# Tuner

A simple, ad-free, distraction-free web-based musical tuner. Primarily for personal use.

## Stack
- Vite + React
- Web Audio API (mic input, pitch detection)
- Capacitor (iOS + Android native wrapper)
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
- Production: tuner.obfusco.us (deploys on push to `main`)
- Dev: tuner-dev.obfusco.us (deploys on push to `nmj/*` branches)
- S3 static hosting + CloudFront CDN + Route 53 DNS
- Prod CloudFront distribution: E36G6MIWPKYAOW
- Dev CloudFront distribution: EUQIKHPXMBWL9
- IAM user: github-actions-moomaw
- GitHub Actions workflow: `.github/workflows/deploy.yml`

## Native App
- Bundle ID: `us.obfusco.tuner`
- Capacitor wraps the Vite build output (`dist/`)
- Build native: `npm run build && npx cap sync`
- Open in Xcode: `npx cap open ios`
- Open in Android Studio: `npx cap open android`
- iOS permissions in `ios/App/App/Info.plist`
- Android permissions in `android/app/src/main/AndroidManifest.xml`
- Status: scaffolded, needs Apple + Google developer accounts for publishing

## Git Workflow
- Push after every commit
- Keep CLAUDE.md, DEVLOG.md, ROADMAP.md updated before committing
- DEVLOG: reverse-chronological (newest at top)
- ROADMAP: mark completed items with `[x]`, move to Completed section
- Git auth via `gh auth` with HTTPS

### Weekly Branch Rotation
- Dev work happens on branches named `nmj/wX` where X is the week number (starting from week 1 on 2026-03-25)
- At the start of each new week, create a new branch from `main`: `git checkout -b nmj/wX main && git push -u origin nmj/wX`
- Any push to `nmj/*` auto-deploys to tuner-dev.obfusco.us
- When ready, merge the week's branch to `main` via PR — this deploys to production
- Current active dev branch: `nmj/w1` (week of 2026-03-25)
