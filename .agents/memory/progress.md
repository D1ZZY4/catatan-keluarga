## Status Milestone

- M0: Selesai — Skema Dexie, wrapper crypto AES-GCM, tipe TypeScript, formatter, seeder kategori, utils
- M1: Selesai — App shell, React Router v6, bottom nav, FAB, app bar, toggle dark mode, layout utama
- M2: Selesai — Onboarding carousel 5 slide + setup PIN/biometrik + animasi swipe
- M3: Selesai — LockScreen PIN pad + WebAuthn biometrik + cooldown + auto-lock
- M4: Selesai — Wallet CRUD + sparkline + multi-currency + konversi harga live
- M5: Selesai — Kategori CRUD + seeder default + icon/color picker
- M6: Selesai — Form transaksi 3 langkah (bottom sheet) + semua jenis transaksi
- M7: Selesai — Halaman transaksi + filter + search
- M8: Selesai — Dashboard beranda (net worth, budget preview, pengingat, transaksi terbaru)
- M9: Selesai — Anggaran per kategori + progress bar + notifikasi budget
- M10: Selesai — Statistik (pie chart, bar chart, area chart, tren, debt tab)
- M11: Selesai — Pengingat tagihan + NotificationService
- M12: Selesai — OCR scanner Tesseract.js + konfirmasi data
- M13: Selesai — Backup & restore file .catkeu terenkripsi
- M14: Selesai — Settings (profil, PIN, biometrik, dark mode, auto-lock, notifikasi, hapus data, tentang)
- M15: Selesai — PriceService (Frankfurter, CoinGecko, XAU)
- M16: Selesai — Multi-currency + pemilih mata uang 160+ fiat + kripto
- M17: Sebagian — PWA manifest + vite-plugin-pwa + ikon; APK Bubblewrap tidak bisa dibuild (tidak ada Android SDK di Replit); BUILD-INSTRUCTIONS.md tersedia
- M18: SELESAI — Bug hunt tuntas, TS clean, build clean
- M19: SELESAI — Audit penuh: CSS tokens lengkap, aksesibilitas, empty states, tablet sidebar
- M20: SELESAI — OfflinePill, HealthScoreWidget, GuidedHomeTour (5 langkah, auto-advance), LocalInsights (StatsPage), useKeyboardShortcuts (N/E/I + Esc), data-tour attributes, HealthScoreWidget + GuidedHomeTour di HomePage
- M21: SELESAI — CSV export (BackupPage, BOM, kompatibel Excel), share transaksi (navigator.share + clipboard fallback), tags input step 3 (max 5, chip UI, Enter/comma/Backspace), jadwal mode gelap otomatis (localStorage, interval 60s, UI jam mulai/selesai)

## Semua Spec Gap Ditutup (Sesi Terakhir)

- [x] Versi auto-inject dari package.json (VITE_APP_VERSION, VITE_BUILD_DATE)
- [x] 3 dompet default di-seed saat completeOnboarding
- [x] Welcome screen pasca-onboarding (confetti + wallet preview)
- [x] SmartCacheService (adaptive TTL, eviksi, preload pattern)
- [x] Tablet sidebar (SideNav md+, BottomNav md:hidden)
- [x] CSS token lengkap sesuai spec
- [x] Optimistic updates di AppDataContext (semua 15 mutasi)
- [x] Swipe kiri → hapus / swipe kanan → duplikat di TransactionListItem
- [x] MIT License modal di Settings
- [x] Developer: Aby Abdillah di Tentang Aplikasi
- [x] Wallet.sortOrder?: number — field ditambah ke type + seed data
- [x] Drag-to-reorder WalletPage — useDragReorder hook + "Atur Urutan" toggle + pointer events
- [x] TransactionForm auto-select kategori pertama saat type berubah di step 1
- [x] Settings Tampilan: mata uang dasar, format tanggal, ukuran teks (useDisplaySettings hook)
- [x] AppShell loads display settings on mount via loadDisplaySettings()
- [x] WalletForm defaults to baseCurrency setting for new wallets
- [x] StatsPage wallet filter chips (multi-select, chip dengan "Semua" + per-wallet)
- [x] OverviewTab accepts walletIds prop for wallet-scoped stats
- [x] Sparkline 7 hari (bukan 30) sesuai spec §8
- [x] format.ts: formatDate mendukung id/us/iso format via module-level variable

## Catatan
- build-release/BUILD-INSTRUCTIONS.md tersedia sebagai pengganti APK
- TypeScript: 0 error (verified post-sesi)
- Production build: ✓ clean (26s)
- Bundle main: 114.94 KB gzipped (batas spec 120 KB ✓)
- PWA: 49 entries precached
- §28/§29 audit clean: no console.log, no `any`, no `100vh`, no `#FFFFFF`
- BottomSheet: role="dialog" + aria-modal="true" + aria-labelledby ✓
- All routes lazy-loaded ✓
- Fonts: DM Sans + Instrument Serif + JetBrains Mono, display=swap via Google Fonts ✓
- index.html: lang="id", viewport-fit=cover, theme-color, apple-mobile-web-app-capable ✓
