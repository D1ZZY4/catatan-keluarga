export const DEV_FLAGS = {
  bypassOnboarding:
    process.env.EXPO_PUBLIC_BYPASS_ONBOARDING === 'true' && __DEV__,
  bypassAuth:
    process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true' && __DEV__,
} as const;
