# build-log.md — Riwayat Build dan Audit

## Audit old-code/ (2026-06-10)

### Struktur old-code/
```
old-code/
├── src-backup/          # Source code React web (referensi desain ABSOLUT)
│   ├── app/             # Contexts + AppShell + router
│   ├── features/        # Pages per fitur
│   ├── shared/          # Components, types, utils, services
│   ├── main.tsx         # Entry point React web
│   └── styles.css       # CSS variables + animasi
├── vite.config.ts       # Vite config (web-only, tidak dimigrasi)
├── tailwind.config.ts   # Tailwind web config (referensi token)
├── capacitor.config.ts  # Capacitor (tidak dipakai — pakai Expo)
└── tsconfig.json        # TypeScript config referensi
```

### File-file Key yang Sudah Dibaca
- `shared/types.ts` — Domain types (Wallet, Transaction, Category, Budget, Reminder, AppSettings)
- `shared/crypto/crypto.ts` — AES-GCM 256-bit Web Crypto (akan diganti expo-crypto)
- `shared/db/db.ts` — Dexie schema (akan diganti WatermelonDB)
- `shared/components/BottomNav.tsx` — 5-tab floating pill nav
- `app/AppShell.tsx` — Shell utama: LockScreen overlay, FAB, TransactionForm sheet
- `app/AuthContext.tsx` — Auth state machine: initializing/onboarding/locked/unlocked
- `features/home/HomePage.tsx` — Layout beranda lengkap
- `styles.css` — Color tokens light + dark mode

### Token Warna Terekstrak
Light: bg-page=#fff9d2, bg-card=#f5eec8, bg-surface=#ede8b8, accent-primary=#8cc0eb
Dark: bg-page=#1a1910, bg-card=#242218, accent-primary=#6aadd8
(detail lengkap di architecture.md)

## Riwayat Build APK
(kosong — belum ada build)
