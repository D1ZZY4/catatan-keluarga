# architecture.md — Keputusan Arsitektur Catat Artha

## Stack Utama
- **Framework:** React Native via Expo SDK 54 (TERKUNCI)
- **Routing:** Expo Router (file-based)
- **State:** React Context + useReducer (tidak ada Redux/Zustand)
- **Database:** WatermelonDB (SQLite wrapper) — keputusan FINAL
- **Enkripsi:** expo-crypto (AES-GCM 256-bit) + expo-secure-store (kunci)
- **Styling:** NativeWind v5 + StyleSheet untuk non-Tailwind cases
- **Animasi:** react-native-reanimated (semua animasi spring/stagger/shimmer)
- **Navigation:** @gorhom/bottom-sheet untuk form sheet
- **Chart:** Victory Native (VictoryPie, VictoryBar, VictoryArea, VictoryLine)
- **Price Data:** CCXT (semua harga — crypto, forex, emas)

## Warna (dari old-code/src-backup/styles.css)
### Light Mode
- bg-page: #fff9d2
- bg-card: #f5eec8
- bg-surface: #ede8b8
- bg-input: #f0ebba
- accent-primary: #8cc0eb
- accent-secondary: #bfddf0
- accent-warm: #f4a35a
- text-primary: #1a1814
- text-muted: #6b6555
- text-placeholder: #a89f7e
- success: #2e7d32
- warning: #e65100
- danger: #c62828

### Dark Mode
- bg-page: #1a1910
- bg-card: #242218
- bg-surface: #2e2c20
- bg-input: #333120
- accent-primary: #6aadd8
- accent-secondary: #4a8faf
- accent-warm: #d4854a
- text-primary: #f0edd8
- text-muted: #9e9a82
- success: #4caf50
- warning: #ff9800
- danger: #ef5350

## Tipografi
- DM Sans — font utama (sans)
- Instrument Serif — display/balance besar
- JetBrains Mono — angka/monospace

## Enkripsi E2E
- AES-GCM 256-bit
- PBKDF2 100.000 iterasi untuk derivasi kunci dari PIN
- IV baru setiap enkripsi
- Kunci disimpan di SecureStore (TIDAK AsyncStorage)
- Semua field sensitif di WatermelonDB menggunakan suffix _enc
- e2e.lock() dipanggil saat app masuk background

## Struktur Folder Target
```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab screens
│   │   ├── index.tsx      # Beranda
│   │   ├── transactions.tsx
│   │   ├── stats.tsx
│   │   ├── wallets.tsx
│   │   └── settings.tsx
│   ├── (dev)/             # Dev tools (hanya __DEV__)
│   │   └── ui-check.tsx
│   ├── onboarding.tsx
│   └── _layout.tsx
├── features/              # Feature modules
│   ├── auth/
│   ├── backup/
│   ├── budgets/
│   ├── calculator/
│   ├── categories/
│   ├── home/
│   ├── ocr/
│   ├── onboarding/
│   ├── recurring/
│   ├── reminders/
│   ├── settings/
│   ├── stats/
│   ├── transactions/
│   └── wallets/
└── shared/
    ├── components/        # Komponen reusable
    ├── config/            # AppLabels, AppConfig, AppColors
    ├── constants/         # transactionTypes, etc.
    ├── crypto/            # E2E encryption wrapper
    ├── data/              # Static fallbacks, currencies
    ├── db/                # WatermelonDB schema, models, repo
    ├── hooks/             # Custom hooks
    ├── services/          # PriceService, NotificationService, SmartCache
    ├── types.ts           # Domain types
    └── utils/             # format, haptic, math, misc, textEngine, devFlags
```

## Navigasi Tab
5 tab: Beranda (Home), Transaksi (TrendingUp), Statistik (BarChart2), Dompet (Wallet), Pengaturan (Settings)
- Semua dari lucide-react-native
- Active: accent-primary, strokeWidth 2.5
- Inactive: text-muted, strokeWidth 1.75
- Bottom nav floating dengan blur, rounded-[28px], shadow

## Onboarding Flow
1. onboarding.tsx: 5 slide carousel
2. Setup nama + PIN di slide 5
3. Seed 3 dompet default: Tunai, Bank, Tabungan
4. Seed kategori default (12 expense + 8 income)
5. Guided home tour (6 step + done)

## Auth Flow
- Status: initializing → onboarding | locked | unlocked
- Auto-lock setelah N detik di background
- Biometrik via expo-local-authentication
- Fallback ke PIN
- MAX 5 percobaan salah, cooldown 30 detik
