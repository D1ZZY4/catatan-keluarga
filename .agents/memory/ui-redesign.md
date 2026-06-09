---
name: UI Redesign patterns
description: Design language decisions from old-code/src-backup/ ported to RN — layout patterns, component quirks, icon availability
---

## Core design language (from old-code reference)
- **NetWorthHero**: `bgCard` background header, `InstrumentSerif-Regular` for large balance, "Sembunyikan/Tampilkan" text toggle pill (not eye icon), income/expense mini cards with `bgSurface` + colored border
- **QuickActions**: 4-column flex row, each item is a card (rounded 20) with icon container (`bg18` tint) + uppercase tiny label. NOT pill buttons.
- **HealthScore**: expandable widget (press to toggle), `Activity` icon, color-coded score bar, factors shown when expanded
- **Wallets on Beranda**: horizontal `ScrollView` of `WalletCard` components at 160px width each, NOT vertical list
- **Recent transactions on Beranda**: single grouped `View` with `borderRadius:20` + `overflow:hidden` + hairline dividers between rows
- **Transaksi screen**: date-grouped sections, each section's transactions in a single rounded card container with hairline dividers — NOT individual cards per transaction
- **Dompet screen**: net worth header + 2-column `flexWrap: 'wrap'` grid of WalletCard
- **Statistik screen**: tab navigation (Ringkasan / Per Kategori) + period pills + summary 3-card row
- **Pengaturan**: grouped rows in rounded-20 `View` with `bgSurface` bg, hairline dividers between rows within a group, section labels uppercase 11px letter-spaced

## WalletCard
- Has color accent stripe at top (5px, `color30` alpha) — achieved via `overflow:hidden` on the card + a View before the body
- Type shown as small pill badge (`color15` bg + `color` text) in top-right of header
- Balance in `InstrumentSerif-Regular` at 22px

## BottomNav / _layout
- Glassmorphism: `${bgCard}E8` background on the pill
- Tab items: icon (strokeWidth 2.5 when active, 1.8 inactive) + label (10px DMSans) + active dot (4×4 blue dot below)
- FAB rendered outside Tabs, in the same fragment

## AppBar
- Frosted glass: `${bgCard}E0` background
- Rounded back button with `bgSurface` background
- Prop: `rightAction` (not `rightElement`)

## Icons — lucide-react-native missing icons
- `BookOpen` does NOT exist in this version of lucide-react-native — use `FileText` instead
- Always verify icon existence before using rare ones

**Why:** Matching the old-code/src-backup/ design language was the core UX goal. These patterns ensure visual consistency with the reference design.
