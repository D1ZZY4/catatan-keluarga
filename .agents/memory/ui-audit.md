## Temuan Audit UI

### Diperbaiki (Session sebelumnya)
- [x] Font stack salah (Sora/Space Grotesk) → diganti dengan DM Sans + Instrument Serif + JetBrains Mono
- [x] Tidak ada iOS PWA meta tags → ditambahkan apple-mobile-web-app-capable, status-bar-style, title
- [x] favicon.svg tidak ada → dibuat di public/favicon.svg
- [x] `hasWebAuthn` undefined di OnboardingPage → diganti `supportsWebAuthn`
- [x] Cell key menggunakan index array di StatsPage → diganti dengan entry.name
- [x] `void formatRelative` dead code di HomePage → dihapus
- [x] `placeholder.tsx` dead file → dihapus

### Diperbaiki (M18 Bug Hunt)
- [x] FAB overlap BottomSheet — BottomSheet dinaikkan ke z-[60]
- [x] FAB tampil di halaman Settings → '/settings' ditambahkan ke PAGES_WITHOUT_FAB
- [x] FAB tampil saat form/OCR/kalkulator terbuka → hideFAB sekarang cek txSheet.open || ocrOpen || calcOpen
- [x] Navbar dark mode frosted glass rusak → --bg-card-rgb ditambahkan ke :root dan .dark
- [x] Onboarding konten terlalu ke bawah → justify-start pt-[10vh]
- [x] Settings toggle "Mode Terang/Gelap" membingungkan → label statis "Mode Gelap", deskripsi dinamis

### Diperbaiki (M19 — Audit penuh sesi ini)
- [x] `--bg-surface: #ffffff` (putih murni!) → diperbaiki ke `#EDE8B8` (warm cream); dark `#2e2c20`
- [x] `--bg-card` diselaraskan ke spec: `#F5EEC8` (bukan `#FFEBCC`); --bg-card-rgb diperbarui ke 245,238,200
- [x] Token CSS hilang ditambahkan: `--bg-input`, `--accent-warm`, `--text-placeholder`, `--border`, `--shadow-sm`, `--shadow-md`, `--shadow-inset` (light + dark)
- [x] Tailwind config: token baru `bg-input`, `accent-warm`, `text-placeholder` ditambahkan
- [x] WelcomeScreen.tsx warna hardcoded → pakai `var(--success)`, `var(--accent-primary)`, `var(--accent-warm)`
- [x] ReminderEmptyIllustration SVG baru ditambahkan ke EmptyState.tsx (motif bel notifikasi)
- [x] ReminderPage empty state sekarang menggunakan ReminderEmptyIllustration
- [x] ReminderPage toggle button → aria-label dinamis "Aktifkan/Nonaktifkan pengingat"
- [x] ReminderPage delete button → aria-label="Hapus pengingat"
- [x] AppShell.tsx JSX broken structure (Suspense blocks di luar wrapper div) → diperbaiki
- [x] Tablet sidebar (SideNav) + BottomNav md:hidden + FAB md:hidden

### Diperbaiki (Sesi terbaru — UI polish berdasarkan feedback pengguna)
- [x] Greeting "Halo, Nama" terlalu kebawah (pt-14) → dikurangi ke pt-5
- [x] Greeting statis "Halo" → sekarang dinamis/random 20+ varian berdasarkan waktu (pagi/siang/sore/malam), hari (Senin, akhir pekan), tanggal (awal/akhir bulan)
- [x] FAB tombol Plus → diganti MoreVertical (titik tiga ⋮); satu tap = toggle speed dial; dial menampilkan aksi cepat + "Edit Aksi Cepat"
- [x] Quick Actions hardcoded → sekarang customizable, disimpan di IndexedDB (settings key: 'quickActions'), default 4 aksi
- [x] EditQuickActionsSheet — bottom sheet baru: tambah/hapus aksi, reset ke bawaan, simpan
- [x] Form transaksi judul hardcoded "Catat Transaksi" → sekarang menampilkan nama tipe ("Pengeluaran", "Pemasukan", dll.)
- [x] Kartu dompet di beranda tidak bisa diklik → sekarang wrapped Link ke /wallets/:id

### Diperbaiki (§30–§31 Bug-Hunt Sesi Ini)
- [x] Build KRITIS: main chunk 6.52 MB → manualChunks Vite (vendor-lucide, vendor-iconsax, vendor-react, vendor-dexie, dll.) + Workbox 5MB limit; main index 19.98 kB gzipped
- [x] TX_TYPES chips tidak dirender di header TransactionPage → chip row ditambahkan; filter sheet sekarang hanya Dompet
- [x] Dark schedule global: AppShell.tsx interval 60s, tidak bergantung pada SettingsPage terbuka
- [x] AppShell loading state pakai h-screen → diperbaiki ke h-[100dvh]
- [x] OfflinePill komponen ada tapi tidak dipakai → diintegrasikan ke WalletPage.tsx (stale mode)

### Status Terbuka
- Chunk DynamicIcon (Lucide) 165 KB gzipped — besar tapi lazy-loaded, tidak mempengaruhi initial load
- Chunk Tesseract.js 190 KB gzipped — inherently besar karena WebAssembly OCR engine
- StatsPage chunk 119 KB gzipped — di atas 120 KB soft limit; Recharts lib besar, inherent
