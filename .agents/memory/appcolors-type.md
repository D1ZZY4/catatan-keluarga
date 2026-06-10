---
name: AppColors Type Pattern
description: How to type theme colors without union type assignment errors in ThemeContext
---

## Rule
Di `ThemeContext.tsx`, gunakan pattern ini:
```typescript
// colors.ts — export type AppColorsType = typeof AppColorsLight (bukan union)
// ThemeContext.tsx:
export type AppColors = typeof AppColorsLight;

const colors = (isDark ? AppColorsDark : AppColorsLight) as AppColors;
```

**Why:** `isDark ? AppColorsDark : AppColorsLight` menghasilkan union type karena kedua object literal punya nilai string literal yang berbeda. TypeScript tidak bisa assign union ke `typeof AppColorsLight` tanpa cast. Menggunakan `AppColorsType` alias dari colors.ts juga tidak membantu karena aliasnya sama. Solusinya adalah define `AppColors = typeof AppColorsLight` langsung di ThemeContext dan cast dengan `as AppColors`.

**How to apply:** Setiap kali ada error "not assignable to type" pada variabel `colors` di ThemeContext, tambahkan cast `as AppColors`. Jangan coba fix di colors.ts karena masalahnya ada di type inference conditional expression.
