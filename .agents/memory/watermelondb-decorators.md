---
name: WatermelonDB TypeScript Decorators
description: tsconfig.json must include experimentalDecorators and emitDecoratorMetadata, and exclude the old-code directory
---

## Rule
`tsconfig.json` harus selalu punya:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["app/**/*.ts", "app/**/*.tsx", "src/**/*.ts", "src/**/*.tsx", "..."],
  "exclude": ["node_modules", "old-code"]
}
```

**Why:** WatermelonDB models gunakan `@field`, `@date`, `@readonly` decorators. Tanpa `experimentalDecorators: true`, TypeScript lempar TS1240 pada setiap decorator. `old-code/` berisi file dari versi lama (React web) yang tidak kompatibel dengan environment Expo dan harus diexclude dari kompilasi TypeScript.

**How to apply:** Selalu cek tsconfig.json saat ada TS1240 errors di model files WatermelonDB. Pastikan `old-code` ada di exclude list juga untuk mencegah false-positive errors dari file lama.
