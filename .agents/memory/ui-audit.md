# ui-audit.md — Audit Visual dan Fitur

## Hasil Audit old-code/ (2026-06-10)

### Halaman yang Ditemukan
- **Beranda (HomePage)**: NetWorthHero + QuickActions + HealthScoreWidget + WalletCardWithSparkline horizontal scroll + BudgetRow + RemindersRow + TransactionListItem terbaru
- **Transaksi (TransactionPage)**: SectionList grouped per tanggal, chip filter periode + jenis, search debounce 150ms, swipe actions, long press batch select
- **Statistik (StatsPage)**: Tab Overview (chart Victory) + tab Hutang/Piutang + tab Tag
- **Dompet (WalletPage)**: DraggableFlatList, FAB tambah, WalletCard dengan sparkline 7 hari
- **Pengaturan (SettingsPage)**: Profil, Keamanan, Tampilan, Notifikasi, Cadangan & Pemulihan, Hapus Semua, Tentang
- **Onboarding**: 5 slide carousel dengan SVG ilustrasi
- **Detail Dompet (WalletDetail)**: Transaksi per dompet + sparkline chart

### Komponen Shared Ditemukan
- **AppBar**: Header per halaman dengan judul + aksi kanan
- **BottomNav**: Floating pill, blur backdrop, 5 tab, dot indicator aktif
- **FAB**: Speed dial ke atas, actions: expense/income/transfer/scan
- **BottomSheet**: Animasi sheet-in CSS — migrasi ke @gorhom/bottom-sheet
- **WalletCard**: Ikon berwarna, nama, saldo (Instrument Serif), sparkline mini
- **TransactionListItem**: Ikon kategori + nama + note + dompet + jumlah + tanggal
- **EmptyState**: SVG kustom per konteks + AppLabels.emptyState
- **SkeletonCard**: Shimmer animasi untuk loading state
- **OfflinePill**: Muncul saat data harga dari cache
- **GuidedHomeTour**: Spotlight 6 step + confetti di akhir
- **Toast**: Notifikasi in-app non-blocking
- **Card**: Wrapper bg-card dengan shadow dan border-radius
- **ColorPicker**: Grid warna untuk wallet/category
- **IconPicker**: Grid ikon untuk wallet/category
- **CurrencyInput**: Input nominal besar, mathjs evaluasi, auto-focus
- **DatePicker**: @react-native-community/datetimepicker
- **ProgressBar**: Hijau/kuning/merah sesuai persentase budget

### Logika Bisnis untuk Dimigrasi
- **computeWalletBalance**: AppDataContext → src/shared/utils/walletUtils.ts
- **crypto.ts (Web Crypto)**: → src/shared/crypto/e2e.ts (expo-crypto + expo-secure-store)
- **PriceService**: fetch manual → CCXT dengan offline fallback
- **TextEngine**: sudah deterministik → migrasi 1:1 ke src/shared/utils/textEngine.ts
- **healthScore**: src/shared/utils/healthScore.ts → migrasi apa adanya
- **suggestCategory**: keyword matching → migrasi ke src/shared/utils/textEngine.ts
- **SmartCacheService**: → src/shared/services/SmartCacheService.ts

### Animasi dan Micro-interaction
- **sheet-in**: CSS translateY(100%)→0 → @gorhom/bottom-sheet spring
- **fade-in**: CSS opacity → Reanimated FadeIn
- **scale-in**: CSS scale(0.92)→1 → Reanimated ZoomIn
- **shimmer**: CSS gradient background-position → Reanimated loop
- **shake**: CSS translateX → Reanimated sequence
- **bounce-in**: CSS scale(0.8)→1.05→1 → Reanimated spring
- **slide-up**: CSS translateY(12px) → Reanimated SlideInDown
- **press scale**: active:scale-[0.98] → Animated.scale onPressIn/Out
- **stagger list**: tidak ada di web → tambah via Reanimated entering stagger
- **confetti**: HTML canvas → react-native-confetti-cannon

### Hal yang TIDAK Perlu Dimigrasi (Web-Only)
- keyboard shortcuts (useKeyboardShortcuts) — tidak relevan mobile
- SideNav — hanya desktop (md: breakpoint)
- Web Notification API — diganti expo-notifications
- IndexedDB/Dexie — diganti WatermelonDB
- CSS variables / Tailwind web className — diganti AppColors + NativeWind
- WebAuthn (navigator.credentials) — diganti expo-local-authentication
- Tesseract.js OCR — diganti @react-native-ml-kit/text-recognition
- `100dvh`, `env(safe-area-inset-*)` CSS — diganti useSafeAreaInsets()
- `localStorage` — diganti SecureStore/WatermelonDB settings

## Fitur Ditemukan (untuk diimplementasikan)
- HealthScore widget di beranda — algoritma sudah ada di old-code
- LocalInsights di tab statistik — pattern recognition sederhana
- TagStats tab — statistik per tag
- SmartCacheService — auto-kategorisasi transaksi berdasarkan usage pattern
- QuickActions yang bisa dikustomisasi (EditQuickActionsSheet)

## Screenshot (akan diisi saat verifikasi)
(kosong — belum ada build)
