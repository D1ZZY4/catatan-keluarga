# issues.md — Bug Aktif dan Technical Debt

## Status: Bersih — semua isu telah diselesaikan

---

## Resolved Issues

### 1. WatermelonDB `declare` Babel Error (RESOLVED)
- **Gejala:** `SyntaxError: The 'declare' modifier is only allowed when the 'allowDeclareFields' option...`
- **Penyebab:** `@babel/plugin-transform-flow-strip-types` di dalam `babel-preset-expo` menolak `declare` tanpa `allowDeclareFields: true`
- **Fix:** Tambah `['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }]` di `babel.config.js`
- **Catatan:** Model WatermelonDB HARUS gunakan `declare property: type` (bukan `property!: type`) dan babel.config.js HARUS include plugin ini

### 2. WatermelonDB `property!` Babel Error (RESOLVED)
- **Gejala:** `SyntaxError: Definitely assigned fields cannot be initialized here`
- **Penyebab:** `@babel/plugin-transform-typescript` menolak `!` definite assignment dengan dekorator
- **Fix:** Ganti semua `property!: type` → `declare property: type` di semua model WatermelonDB

### 3. TypeScript 1213 Errors (RESOLVED)
- **Penyebab:** `node_modules` belum terinstall + missing `"jsx": "react-native"` di tsconfig
- **Fix:** `bun install` + `npx expo install --fix`

### 4. Alert import missing di TransactionForm.tsx (RESOLVED)
- **Fix:** Tambah `Alert` ke react-native import list

### 5. Settings clear data TODO (RESOLVED)
- **Fix:** Implementasi `clearAllData` di `repo.ts`, tambah `clearAll` ke `AppDataContext`, sambungkan ke `settings.tsx`

---
