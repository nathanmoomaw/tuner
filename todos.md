# Personal Todos

Items that require action from me (not Claude).

## App Store Publishing

- [ ] Sign up for Google Play Console — $25 one-time fee → https://play.google.com/console/signup
  - Needed to publish Tuner to Android personally ($25 unlocks personal use)
  - App is Capacitor-scaffolded and ready to build once account exists
- [ ] Sign up for Apple Developer Program — $99/year → https://developer.apple.com/programs/enroll/
  - Lower priority than Android, do after Google Play
  - Required to submit to App Store and install on personal device outside TestFlight

## Notes

- Bundle ID is already set: `us.obfusco.tuner`
- Capacitor scaffold exists for both iOS and Android (in nmj/w2, not yet merged to main)
- Build command: `npm run build && npx cap sync`
