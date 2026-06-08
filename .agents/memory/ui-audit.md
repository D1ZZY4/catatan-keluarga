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

### Status Terbuka
- Chunk DynamicIcon (Lucide) 165 KB gzipped — besar tapi lazy-loaded, tidak mempengaruhi initial load
- Chunk Tesseract.js 190 KB gzipped — inherently besar karena WebAssembly OCR engine
- StatsPage chunk 119 KB gzipped — di atas 120 KB soft limit; Recharts lib besar, inherent
