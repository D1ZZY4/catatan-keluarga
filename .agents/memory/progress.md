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
- M18: SELESAI — Bug hunt tuntas, 35/35 tests pass, TS clean, build clean

## Bug Hunt Session (M18) — Diperbaiki

- [x] FAB overlap BottomSheet → BottomSheet z-[60] (di atas FAB z-50)
- [x] FAB muncul di Settings → tambahkan '/settings' ke PAGES_WITHOUT_FAB
- [x] FAB muncul saat sheet terbuka → tambahkan txSheet.open || ocrOpen || calcOpen ke hideFAB
- [x] Navbar dark mode rusak → tambahkan --bg-card-rgb ke :root dan .dark di styles.css
- [x] Onboarding konten terlalu ke bawah → justify-start pt-[10vh]
- [x] Settings toggle label "Mode Terang/Gelap" ambigu → label statis "Mode Gelap" + deskripsi dinamis

## Catatan
- build-release/BUILD-INSTRUCTIONS.md tersedia sebagai pengganti APK
- Initial bundle: 114.46 KB gzipped (di bawah limit 120 KB spec)
- 35/35 tests passing
- TypeScript: 0 error
- Production build: ✓ clean
