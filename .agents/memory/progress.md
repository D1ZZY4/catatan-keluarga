---
name: Catat Artha Build Progress
description: Current build status, what is done, what is next for Catat Artha
---

# Build Progress — Catat Artha

## Status: TypeScript BERSIH (0 errors) — Siap EAS Build

## Selesai ✅
- **Foundation**: package.json, tsconfig.json, app.json, babel.config.js, metro.config.js, eas.json, tailwind.config.js
- **Theme Layer**: colors.ts (typed as AppColors interface), typography (+ headingSmall, bodySmall, labelMedium), shadows (+ card), spacing, animation, ThemeContext
- **Config**: labels.ts (AppLabels), periods.ts (AppConfig + PeriodKey)
- **Types**: types.ts (all domain interfaces)
- **Utils**: formatters, textEngine, finance, healthScore, misc, devFlags, pickerBridge (category+wallet bridge)
- **DB Layer**: schema.ts, database.ts, seedData.ts + 7 models — Wallet, Transaction, Category, Budget, Reminder, RecurringTransaction, TransactionTemplate
- **Crypto**: deviceKey.ts, encryption.ts, pinStore.ts
- **Services**: settingsStore.ts, calculatorEngine.ts
- **Hooks**: useSettings.tsx, useAppLock.tsx, useCurrencyRates.ts, useTransactions.ts, useWallets.ts
- **Shared Components**: AppIcon, AppText, AppCard, AppButton, BalanceText, EmptyState, FAB, PinPad, BottomSheetWrapper, LoadingOverlay, TransactionTypeChip, Calculator, SparklineChart, OfflinePill, GuidedHomeTour, DatePickerWrapper, WalletCard, CurrencyInput, AppBar, SkeletonCard, TransactionListItem, Badge, ChipGroup, ColorPicker, Divider, HapticButton, IconPicker, ProgressBar, SearchBar, Toast
- **Routes (5 Tabs)**: index (home), transactions (real data + search/filter), stats (custom SVG charts), wallets, settings
- **Routes (Modals)**: transaction-form (w/ category+wallet picker wire), transaction-detail, wallet-form, calculator, backup, profile-edit, security-settings, category-picker (real DB data), wallet-picker (resolve selection), filter, about, delete-all-confirm
- **Routes (Auth+Onboarding)**: (auth)/lock.tsx, (onboarding)/index.tsx
- **Image Assets**: icon.png (1024x1024), splash.png, adaptive-icon.png, notification-icon.png — semua dibuat dengan ImageMagick

## Kunci Keputusan Teknis
- WatermelonDB decorators: `import { field } from '@nozbe/watermelondb/decorators'`
- MMKV v3: pakai `createMMKV()` bukan `new MMKV()`
- Font paths: `require('../node_modules/@expo-google-fonts/...')`
- FAB prop: `onSelect(type: TransactionType)` bukan `onPress`
- TransactionTypeChip: `showLabel={false}` bukan `iconOnly`
- colors.ts typed as `AppColors` interface (avoid literal type errors)
- tsconfig: `experimentalDecorators: true`, excludes `old-code/`
- FileSystem API (SDK 54): cast with `unknown` to access `documentDirectory`
- expo dev server TIDAK bisa jalan di Replit (freeport-async port scan 11000-65535 blocked)
- Workflow diset ke `bunx tsc --noEmit --watch --pretty` (bukan expo start)
- PickerBridge pattern: module-level singleton callback untuk picker-to-form communication
- stats.tsx: menggunakan custom SimplePieChart/SimpleBarChart/SimpleAreaChart (react-native-svg) bukan victory-native v40 API
- GuidedHomeTour: `accessibilityViewIsModal` bukan `accessibilityRole="dialog"` (Reanimated v4 type issue)
- DatePickerWrapper: `formatDate(value.getTime())` bukan `formatDate(value)` (expects number)
- expo-doctor warnings tentang versi BISA DIABAIKAN — kita terkunci di SDK 54, bukan 55/56
- transactions.tsx sekarang pakai `useTransactions(activePeriod)` dengan search/filter yang benar

## Selanjutnya ⏳
- EAS Build: `bunx eas build --platform android --profile preview`
- Untuk build, perlu: `bunx eas login` dan account Expo terlebih dahulu
