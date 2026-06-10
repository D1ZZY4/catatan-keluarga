## Bug Aktif
(kosong — semua bug sebelumnya sudah diperbaiki)

## Technical Debt
- Biometrik unlock menggunakan device key, bukan PIN key — artinya jika pengguna punya PIN, data dienkripsi dengan PIN key, tapi biometrik membuka dengan device key yang berbeda. Ini bisa menyebabkan data tidak bisa dibaca setelah unlock biometrik. Butuh desain ulang: simpan kunci terenkripsi dengan biometrik, atau gunakan key wrapping.
- Schema `transaction_tags` table ada tapi tidak ada TransactionTagModel di modelClasses — tags tidak bisa di-query via WatermelonDB Association API. Tag-on-transaction saat ini belum diimplementasikan di RN app (ada di old web app Dexie saja).

## Resolved (Batch 8 — sesi ini)
- [FIXED] tentang.tsx: versi SDK ditampilkan sebagai "Expo SDK 53" padahal SDK 56 → dikoreksi
- [FIXED] hapus-data.tsx: "Hapus Semua Data" tidak menghapus tabel `transaction_tags` dan `usage_patterns` — data orphan tersisa setelah reset → kedua tabel ditambahkan ke daftar hapus

## Resolved (Batch 7 — sesi ini)
- [FIXED] TransactionForm tidak auto-select kategori pertama saat type berubah — diperbaiki dengan useEffect yang memantau txType + categories
- [FIXED] backup.tsx: file.write() tidak di-await — race condition (file kosong saat dibagikan)
- [FIXED] transaksi/[id].tsx: hapus transaksi tidak kembalikan saldo dompet — diperbaiki dengan balance reversal
- [FIXED] tentang.tsx: "Expo SDK 53" salah — dikoreksi jadi "Expo SDK 56"
