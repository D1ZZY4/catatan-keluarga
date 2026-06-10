/**
 * DEV_FLAGS — hanya aktif saat __DEV__ === true.
 * Gunakan untuk bypass onboarding/auth saat pengembangan.
 */

export const DEV_FLAGS = {
  bypassOnboarding:
    process.env.EXPO_PUBLIC_BYPASS_ONBOARDING === 'true' && __DEV__,
  bypassAuth: process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true' && __DEV__,
  showDevMenu: __DEV__,
} as const;
