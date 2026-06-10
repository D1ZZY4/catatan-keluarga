# issues.md — Bug Aktif dan Technical Debt

## Status: Bersih — semua isu aktif telah diselesaikan

---

## Resolved Issues

### 1. WatermelonDB `declare` Babel Error (RESOLVED)
- **Gejala:** `SyntaxError: The 'declare' modifier is only allowed when the 'allowDeclareFields' option...`
- **Fix:** Tambah `['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }]` di `babel.config.js`

### 2. TypeScript 1213 Errors (RESOLVED)
- **Fix:** `bun install` + `npx expo install --fix`

### 3. Web Runtime Errors (RESOLVED)
- WatermelonDB: lazy require pada non-web
- SecureStore: sessionStorage/in-memory fallback pada web
- darkMode: `'class'` di tailwind.config.js
- StyleSheet.setFlag: dihapus

### 4. Infinite Re-render Loop (RESOLVED 2026-06-10)
- **Gejala:** "Maximum update depth exceeded" setiap ~0.3s
- **Root cause 1:** `activeWallets = wallets.filter(...)` di TransactionForm.tsx baris 76 tidak memoized → new array ref tiap render → `buildInitialForm` useCallback berubah → useEffect run → `setForm()` → re-render → loop
- **Fix 1:** Wrap `activeWallets` dengan `useMemo(() => wallets.filter(...), [wallets])`
- **Root cause 2:** `prefill={{ date: Date.now() }}` di wallet/[id].tsx → objek baru tiap render masuk ke buildInitialForm deps
- **Fix 2:** Hapus prefill prop (TransactionForm sudah default ke `Date.now()`)

### 5. Minor Warnings (NON-BLOCKING)
- `shadow*` style props deprecated → dari StyleSheet kita, perlu migrasi ke `boxShadow` bertahap
- `props.pointerEvents` deprecated → dari @gorhom/bottom-sheet (third-party)
- `Accessing element.ref was removed in React 19` → dari third-party lib
