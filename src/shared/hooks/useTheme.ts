import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '@/shared/theme/colors';
import type { AppColors } from '@/shared/theme/colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing, radius } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

export interface ThemeContextValue {
  colors: AppColors;
  shadows: typeof shadows;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  isDark: boolean;
}

export function useTheme(): ThemeContextValue {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? darkColors : lightColors,
    shadows,
    spacing,
    radius,
    typography,
    isDark,
  };
}
