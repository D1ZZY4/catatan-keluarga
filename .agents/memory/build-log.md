---
name: Build & APK Log
description: How to build APK for Catatan Keuangan (Expo + EAS)
---

## APK Build Method
- Use **EAS Build** (cloud): `eas build --platform android --profile preview` → APK download link
- Use `--profile production` for AAB (Play Store)
- Local build: `npx expo prebuild` + `./gradlew assembleDebug`

## Key Config
- `eas.json`: profiles for development (APK debug), preview (APK release), production (AAB)
- `app.config.ts`: package=`id.catkeu.app`, versionCode must increment per Play Store upload
- `npm install --legacy-peer-deps` required (React 19 peer conflict with lucide-react-native)

**Why:** EAS manages signing keystore automatically — much simpler than local Gradle signing setup.

**How to apply:** Always use `--legacy-peer-deps` flag. Increment both `version` in package.json and `versionCode` in app.config.ts before each Play Store upload.

## Docs
See `build-release/EAS-BUILD.md` for full step-by-step instructions.
