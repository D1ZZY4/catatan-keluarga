# MEMORY.md — Master Index Catat Artha

## Gambaran Proyek
- **Nama:** Catat Artha
- **Developer:** Aby Abdillah
- **Target:** Android APK offline-first via Expo EAS Build
- **Stack:** React Native + Expo SDK 54 (TERKUNCI) + WatermelonDB + NativeWind
- **Package Manager:** Bun (TIDAK ada npm/yarn)
- **Enkripsi:** AES-GCM 256-bit via expo-crypto + expo-secure-store
- **Sumber desain:** `old-code/src-backup/` (ABSOLUT — tidak boleh diabaikan)

## Status
Lihat `progress.md` untuk status terkini.

## Pointer ke File Detail
- [progress.md](progress.md) — Status pekerjaan + log checkpoint (SUMBER KEBENARAN UTAMA)
- [architecture.md](architecture.md) — Keputusan arsitektur: DB, enkripsi, state, routing, styling
- [issues.md](issues.md) — Bug aktif, workaround, technical debt
- [ui-audit.md](ui-audit.md) — Audit visual + perbandingan old-code
- [build-log.md](build-log.md) — Riwayat build APK + hasil audit old-code/

## Aturan Keras
1. Expo SDK 54 — TERKUNCI, tidak boleh diupgrade
2. Package manager: Bun (bun add, bun run) — npx hanya untuk expo install
3. Tidak ada hardcode string di komponen — semua dari AppLabels
4. old-code/ adalah sumber kebenaran desain — ikuti presisi
5. WatermelonDB adalah keputusan final untuk storage

## Keputusan Teknis Kritis
- [WatermelonDB decorator config](watermelondb-decorators.md) — tsconfig.json wajib punya experimentalDecorators + emitDecoratorMetadata + exclude old-code
- [AppColors type pattern](appcolors-type.md) — gunakan `type AppColors = typeof AppColorsLight` + cast `as AppColors`; jangan pakai AppColorsType union langsung
- [Babel & Metro WatermelonDB fixes](issues.md) — babel.config.js butuh `['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }]`; metro.config.js butuh shim `better-sqlite3` → `src/mocks/empty-module.js`
