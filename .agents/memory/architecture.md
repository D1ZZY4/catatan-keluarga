---
name: Catat Artha Architecture
description: Key architecture decisions for Catat Artha React Native app
---

# Arsitektur Catat Artha

## Database — WatermelonDB (FINAL)
- Engine: SQLite via @nozbe/watermelondb v0.28
- Decorators: import dari `@nozbe/watermelondb/decorators` (BUKAN root package)
- Tables: wallets, transactions, categories, budgets, reminders, recurring_transactions, transaction_templates
- JSI: `jsi: true` di production (native device), `jsi: false` untuk emulator/jest
- Reactive: @nozbe/withObservables tersedia tapi hooks manual (useWallets, useTransactions) dipakai saat ini

## Enkripsi E2E
- Device key: `expo-crypto` + `expo-secure-store` di `src/shared/crypto/deviceKey.ts`
- Algorithm: AES-GCM 256-bit, key derivation via HKDF
- PIN store: `expo-secure-store` lewat `src/shared/crypto/pinStore.ts`
- Backup: exported JSON dienkripsi dengan device key sebelum share

## State Management
- Settings: MMKV (`createMMKV()` — v3 API) + SettingsContext (React context)
- DB: WatermelonDB DatabaseProvider di root layout
- App lock: AppLockContext (auto-lock setelah X detik idle)
- Currency rates: MMKV cache + useCurrencyRates hook

## Navigation (Expo Router v4)
- Root: Stack (onboarding → auth → tabs/modals)
- Tabs: 5 tab (index/Beranda, transactions, stats, wallets, settings)
- Modals: 12 modal screens di (modals)/ group
- `home.tsx` di (tabs)/ disembunyikan dengan `href: null` — gunakan `index.tsx`

## Theme
- Light/dark mode: ThemeContext + `useColorScheme`
- Colors: `AppColors` interface di colors.ts (bukan `typeof lightColors`)
- Fonts: DM Sans, Instrument Serif, JetBrains Mono via @expo-google-fonts

## Build
- EAS Build: eas.json sudah dikonfigurasi (development APK, preview APK, production AAB)
- Package: `id.catarartha.app`
- Min SDK: Android 6.0 (API 23)
- Expo SDK: 54 (LOCKED — jangan upgrade)

## Replit Dev Workflow
- Workflow: `EXPO_NO_TYPESCRIPT_SETUP=1 bunx expo start --port 8081` (console output mode)
- Metro Bundler berhasil jalan dan menampilkan QR code di console
- Untuk test: scan QR code dengan Expo Go di Android (native dev build)
- Web preview TIDAK bekerja — app menggunakan banyak native-only packages (WatermelonDB, MMKV, biometrics)
- Build APK: `bunx eas build --platform android --profile preview`

## File Structure
- Routes: `src/app/` (expo-router config: `root: 'src/app'`)
- Shared: `src/shared/` (components, theme, types, hooks, crypto, etc.)
- Features: `src/features/` (prices, etc.)
- Path alias: `@/*` → `./src/*` in tsconfig.json

## tsconfig.json Rules
- DO NOT use `extends: "expo/tsconfig.base"` — expo SDK 54 base uses `module: "preserve"` which TS 5.3.3 doesn't support
- Use `EXPO_NO_TYPESCRIPT_SETUP=1` env var in workflow to prevent expo from re-adding the extends
- Standalone tsconfig with all settings explicit is the correct approach
