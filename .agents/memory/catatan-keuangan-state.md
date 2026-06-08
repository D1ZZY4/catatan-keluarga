---
name: Catatan Keuangan app state
description: All milestones complete; key architecture decisions and polish items resolved
---

All M0–M17 milestones are fully implemented and the production build passes with zero TypeScript errors.

**Key decisions:**
- Calculator uses `mathjs` (`create(all)` + `math.evaluate()`) — NOT `Function()` or eval. Same pattern in `src/shared/utils/math.ts`.
- `shake` animation defined in `tailwind.config.ts` under `theme.extend.keyframes`; LockScreen uses `animate-shake` (named class).
- BottomNav is a floating pill container (`mx-3 mb-2 rounded-2xl backdrop-blur-md`) — AppShell spacer div is `h-[72px]` which accounts for this.
- `DynamicIcon` imports `* as LucideIcons` (885KB chunk, 165KB gzip) — necessary because IconPicker needs all icons; it is already in its own lazy chunk.
- All data encrypted with AES-GCM 256 via Web Crypto API before IndexedDB storage (key from PBKDF2 PIN or device fingerprint).

**Why:** Spec explicitly forbids eval/Function constructor for safe expression evaluation.
**How to apply:** Any future calculator or math eval must go through `math.evaluate()` from mathjs.
