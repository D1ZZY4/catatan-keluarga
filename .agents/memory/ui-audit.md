## Temuan Audit UI

### Diperbaiki (Session sebelumnya)
- [x] Font stack salah (Sora/Space Grotesk) → diganti dengan DM Sans + Instrument Serif + JetBrains Mono
- [x] Tidak ada iOS PWA meta tags → ditambahkan apple-mobile-web-app-capable, status-bar-style, title
- [x] favicon.svg tidak ada → dibuat di public/favicon.svg
- [x] `hasWebAuthn` undefined di OnboardingPage → diganti `supportsWebAuthn`
- [x] Cell key menggunakan index array di StatsPage → diganti dengan entry.name
- [x] `void formatRelative` dead code di HomePage → dihapus
- [x] `placeholder.tsx` dead file → dihapus

### Diperbaiki (Session terkini — M18 Bug Hunt)
- [x] FAB overlap BottomSheet — BottomSheet dinaikkan ke z-[60]
- [x] FAB tampil di halaman Settings → '/settings' ditambahkan ke PAGES_WITHOUT_FAB
- [x] FAB tampil saat form/OCR/kalkulator terbuka → hideFAB sekarang cek txSheet.open || ocrOpen || calcOpen
- [x] Navbar dark mode frosted glass rusak → --bg-card-rgb ditambahkan ke :root (255,235,204) dan .dark (36,34,24)
- [x] Onboarding konten terlalu ke bawah → justify-start pt-[10vh]
- [x] Settings toggle "Mode Terang/Gelap" membingungkan → label statis "Mode Gelap", deskripsi dinamis

### Status Terbuka
- Navbar pill border-radius 16px (spec minta 28px) — minor, bisa diperketat jika perlu
- Chunk DynamicIcon (Lucide) 165 KB gzipped — besar tapi lazy-loaded, tidak mempengaruhi initial load
- Chunk Tesseract.js 190 KB gzipped — inherently besar karena WebAssembly OCR engine
