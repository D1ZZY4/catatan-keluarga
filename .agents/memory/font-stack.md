---
name: Font stack
description: Three-font combination chosen for Catatan Keuangan; how to apply each font
---

## Fonts in use
1. **Sora** (400, 500, 600) — default body/UI font via `font-sans`. Set in `body` CSS and Tailwind sans stack.
2. **Space Grotesk** (400, 500, 600, 700) — financial numbers and currency amounts via Tailwind `font-display` utility. Add `font-display tabular-nums` to any `formatCurrency()` output.
3. **DM Serif Display** (400, italic) — available via Tailwind `font-serif` for future hero/editorial use.

## Where applied
- `WalletCard` balance text
- `TransactionListItem` amount text
- `WalletDetail` balance header
- `WalletPage` net worth header
- `HomePage` net worth hero
- `StatsPage` summary card values + savings rate
- `TransactionPage` income/expense totals
- `BudgetPage` spent/remaining values

**Why:** User explicitly requested replacing Plus Jakarta Sans with 3 aesthetic modern fonts. Sora is clean/geometric for UI, Space Grotesk gives financial data a distinctive look, DM Serif Display adds editorial premium quality.

**How to apply:** Any new component showing currency or large numbers: add `font-display tabular-nums` classes alongside existing font-weight classes.
