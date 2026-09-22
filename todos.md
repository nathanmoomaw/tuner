# Personal Todos

Items that require action from me (not Claude).

## Android launch steps (2026-09-15)

Fastest path to an official Play Store install for personal use — skips the public-listing requirements entirely:

1. [x] Sign up for Google Play Console — $25 one-time fee → https://play.google.com/console/signup
2. [ ] In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle → Create new...** to generate a release keystore (there isn't one yet — current release builds are unsigned). **Back up the resulting `.jks` file somewhere durable** (password manager, external drive) — if it's lost, this app identity can never be updated again, only replaced with a new one.
   - Tell Claude the keystore path + alias once it exists and it can wire a `signingConfig` into `build.gradle` so release builds work from the CLI (`./gradlew bundleRelease`) instead of only through the Android Studio wizard.
3. [ ] In Play Console, create the app (package `us.obfusco.tuner`), then use the **Internal testing** track (not Production) — up to 100 testers by email, live within ~minutes of upload, no reviewer approval, no public listing required.
4. [ ] Complete the minimum required App content forms (still required even for internal testing): content rating questionnaire, data safety form (mic permission — answer "no data collected/shared," it's all on-device), and a privacy policy URL (can be a one-paragraph static page: "Tuner uses the microphone only for local pitch detection; no audio or data ever leaves the device").
5. [x] Upload the signed `.aab` (Play requires App Bundle format, not `.apk`, for new apps) — Android Studio's signing wizard produces this directly.
6. [ ] Add your own Google account's email as an internal tester in Play Console, accept the opt-in testing link it gives you, then install via the Play Store app like any other app — auto-updates included going forward.

If the app should ever be *publicly* discoverable on Play (not just personal), that's a separate, heavier lift: Google requires new developer accounts to run a **closed testing track with 12 opted-in testers for 14 continuous days** before Production access unlocks, plus full store listing assets (feature graphic, screenshots, descriptions). Not needed for personal use — skip unless that goal changes.

## Android public listing (Production track) — do this if going public

Builds on everything above (keystore, signed `.aab`, App content forms) — this is the extra work specifically for a public, searchable Play Store listing rather than personal/internal use.

1. [ ] **Closed testing track** — in Play Console, create a Closed testing track (separate from Internal testing), add an email list or Google Group with at least **12 opted-in testers**, and keep the release live there continuously for **14 days**. This is a hard gate for new developer accounts before Production access unlocks — no way to skip it. (Recruiting 12 real testers is the actual bottleneck here — friends/family, a subreddit, or a musician Discord all work.)
2. [ ] **Store listing assets** — required before any public release:
   - App icon: 512×512 PNG (have the favicon/launcher art already, needs export at this size)
   - Feature graphic: 1024×500 PNG/JPG (banner shown at top of listing — doesn't exist yet)
   - Phone screenshots: at least 2, PNG/JPG, 16:9 or 9:16 (have real screenshots from dev work, need to pick/crop clean ones)
   - Short description (≤80 chars) and full description (≤4000 chars)
   - Category (Music) and contact email
3. [ ] **Public-facing privacy policy URL** — the one-paragraph note used for internal testing needs to actually be hosted somewhere public (a static page on tuner.obfusco.us works, e.g. `/privacy`) since Play links to it from the public listing.
4. [ ] **Complete full App content declarations** — beyond the content rating questionnaire and data safety form already done for internal testing, also need: target audience & content (confirm not directed at children — avoids COPPA/Families Policy requirements), ads declaration (none), government apps / financial features declarations (not applicable), and a Play data safety review of what's declared vs. actual permissions.
5. [ ] **Apply for Production access** — once the 14-day closed testing window with 12+ testers is satisfied, Play Console unlocks the option to submit for Production review. Google reviews the app content/policy compliance; can take anywhere from a few hours to ~1-2 weeks.
6. [ ] **Publish to Production** — once approved, roll out to Production (can stage as a % rollout or 100% immediately). App becomes publicly searchable on Play Store.

Ongoing after public launch: Google requires apps to keep `targetSdkVersion` within ~1 year of the latest major Android release or new updates get blocked — a recurring (not one-time) maintenance item.

## Apple (lower priority, after Android)

- [ ] Sign up for Apple Developer Program — $99/year → https://developer.apple.com/programs/enroll/
  - Required to submit to App Store and install on personal device outside TestFlight

## Notes

- Bundle ID is already set: `us.obfusco.tuner`
- Capacitor scaffold exists for both iOS and Android (merged to main)
- Build command: `npm run build && npx cap sync`
