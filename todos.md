# Personal Todos

Items that require action from me (not Claude).

## Android launch steps (2026-09-15)

Fastest path to an official Play Store install for personal use — skips the public-listing requirements entirely:

1. [ ] Sign up for Google Play Console — $25 one-time fee → https://play.google.com/console/signup
2. [ ] In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle → Create new...** to generate a release keystore (there isn't one yet — current release builds are unsigned). **Back up the resulting `.jks` file somewhere durable** (password manager, external drive) — if it's lost, this app identity can never be updated again, only replaced with a new one.
   - Tell Claude the keystore path + alias once it exists and it can wire a `signingConfig` into `build.gradle` so release builds work from the CLI (`./gradlew bundleRelease`) instead of only through the Android Studio wizard.
3. [ ] In Play Console, create the app (package `us.obfusco.tuner`), then use the **Internal testing** track (not Production) — up to 100 testers by email, live within ~minutes of upload, no reviewer approval, no public listing required.
4. [ ] Complete the minimum required App content forms (still required even for internal testing): content rating questionnaire, data safety form (mic permission — answer "no data collected/shared," it's all on-device), and a privacy policy URL (can be a one-paragraph static page: "Tuner uses the microphone only for local pitch detection; no audio or data ever leaves the device").
5. [ ] Upload the signed `.aab` (Play requires App Bundle format, not `.apk`, for new apps) — Android Studio's signing wizard produces this directly.
6. [ ] Add your own Google account's email as an internal tester in Play Console, accept the opt-in testing link it gives you, then install via the Play Store app like any other app — auto-updates included going forward.

If the app should ever be *publicly* discoverable on Play (not just personal), that's a separate, heavier lift: Google requires new developer accounts to run a **closed testing track with 12 opted-in testers for 14 continuous days** before Production access unlocks, plus full store listing assets (feature graphic, screenshots, descriptions). Not needed for personal use — skip unless that goal changes.

## Apple (lower priority, after Android)

- [ ] Sign up for Apple Developer Program — $99/year → https://developer.apple.com/programs/enroll/
  - Required to submit to App Store and install on personal device outside TestFlight

## Notes

- Bundle ID is already set: `us.obfusco.tuner`
- Capacitor scaffold exists for both iOS and Android (merged to main)
- Build command: `npm run build && npx cap sync`
