/**
 * AppColors — token warna yang digunakan di seluruh aplikasi.
 * Satu-satunya sumber warna. Tidak ada warna hardcode di komponen.
 */

export const AppColorsLight = {
  bgPage: '#fff9d2',
  bgCard: '#f5eec8',
  bgSurface: '#ede8b8',
  bgInput: '#f0ebba',
  accentPrimary: '#8cc0eb',
  accentSecondary: '#bfddf0',
  accentWarm: '#f4a35a',
  textPrimary: '#1a1814',
  textMuted: '#6b6555',
  textPlaceholder: '#a89f7e',
  success: '#2e7d32',
  warning: '#e65100',
  danger: '#c62828',
  border: 'rgba(107, 101, 85, 0.15)',
  white: '#ffffff',
  transparent: 'transparent',
} as const;

export const AppColorsDark = {
  bgPage: '#1a1910',
  bgCard: '#242218',
  bgSurface: '#2e2c20',
  bgInput: '#333120',
  accentPrimary: '#6aadd8',
  accentSecondary: '#4a8faf',
  accentWarm: '#d4854a',
  textPrimary: '#f0edd8',
  textMuted: '#9e9a82',
  textPlaceholder: '#6b6755',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#ef5350',
  border: 'rgba(240, 237, 216, 0.1)',
  white: '#ffffff',
  transparent: 'transparent',
} as const;

export type AppColorsType = typeof AppColorsLight;

/** Warna kategori preset */
export const CATEGORY_COLORS = [
  '#8cc0eb', '#bfddf0', '#f4a35a', '#2e7d32', '#e65100',
  '#c62828', '#7b1fa2', '#1565c0', '#00695c', '#558b2f',
  '#ef6c00', '#6d4c41', '#546e7a', '#e91e63', '#9c27b0',
  '#3f51b5', '#009688', '#ff5722', '#795548', '#607d8b',
] as const;

/** Warna wallet preset */
export const WALLET_COLORS = [
  '#8cc0eb', '#bfddf0', '#f4a35a', '#2e7d32', '#e65100',
  '#7b1fa2', '#1565c0', '#00695c', '#ef6c00', '#c62828',
] as const;

/** Mendapatkan AppColors berdasarkan dark mode */
export function getAppColors(isDark: boolean): typeof AppColorsLight {
  return (isDark ? AppColorsDark : AppColorsLight) as typeof AppColorsLight;
}
