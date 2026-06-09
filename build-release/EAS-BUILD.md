# Panduan Build APK — Catatan Keuangan

## Prasyarat

1. **Node.js** ≥ 18 + **npm** atau **bun**
2. **EAS CLI** — `npm install -g eas-cli`
3. Akun Expo: https://expo.dev → sign up gratis
4. Login: `eas login`

---

## Build APK (Preview — sideload)

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build APK langsung ke cloud (gratis)
eas build --platform android --profile preview
```

Setelah selesai (~5–10 menit), link download APK akan muncul di terminal.
APK bisa di-install langsung di perangkat Android (enable "Unknown Sources").

---

## Build AAB (Production — Play Store)

```bash
eas build --platform android --profile production
```

Upload `.aab` ke Google Play Console.

---

## Build Lokal (tanpa cloud)

Butuh **Android Studio** + **JDK 17**:

```bash
# Generate native project
npx expo prebuild --platform android --clean

# Build debug APK
cd android && ./gradlew assembleDebug

# APK ada di:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Konfigurasi

| Key | Value |
|-----|-------|
| Package | `id.catkeu.app` |
| Version | lihat `package.json` |
| versionCode | lihat `app.config.ts` (`android.versionCode`) |
| Min SDK | 24 (Android 7.0) |
| Target SDK | 34 |

---

## Menaikkan Versi

Edit `package.json`:
```json
{ "version": "1.1.0" }
```

Edit `app.config.ts`:
```ts
android: { versionCode: 2 }
```

---

## Signing Keystore

EAS mengelola keystore otomatis. Untuk keystore sendiri:
```bash
eas credentials
```

Backup keystore ke tempat aman — tidak bisa diganti setelah publish ke Play Store.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `peer conflict` | Gunakan `npm install --legacy-peer-deps` |
| `jsi: true` error | Set `jsi: false` di `db/index.ts` untuk emulator |
| Build gagal di EAS | Cek log di https://expo.dev/accounts/[user]/projects |
| Icon tidak muncul | Pastikan `src/assets/icons/` berisi `icon.png`, `splash.png`, `adaptive-icon.png` |
