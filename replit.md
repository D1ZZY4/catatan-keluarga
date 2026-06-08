# Catatan Keuangan

Buku kas digital offline-first untuk keluarga / personal finance PWA in Bahasa Indonesia.

## Stack
- React 18 + TypeScript (strict) + Vite 6 + Tailwind CSS 3
- Dexie.js (IndexedDB) + Web Crypto API (AES-GCM 256) for encrypted offline storage
- Mathjs for safe expression evaluation (no eval/Function constructor)
- Tesseract.js for OCR receipt scanning
- PWA with service worker (vite-plugin-pwa)

## Architecture
- All data encrypted at rest in IndexedDB with AES-GCM 256 using PBKDF2-derived key
- Offline-first: no server, no API keys, all processing on device
- Auth: optional 4–6 digit PIN + WebAuthn biometrics
- Multi-wallet support with live exchange rates (Frankfurter + CoinGecko)

## Dev
```bash
bun run dev    # Start dev server on port 5000
bun run build  # Production build
```

## User Preferences
- Bahasa Indonesia throughout the UI
- Warm cream/yellow color theme (--bg-page: #fff9d2)
- Pill-style floating bottom navigation bar
