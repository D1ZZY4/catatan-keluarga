import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/shared/hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  haptic?: boolean;
}

export function Button({
  onPress,
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
  haptic = true,
}: ButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bgColor = {
    primary: colors.accentPrimary,
    secondary: colors.bgSurface,
    ghost: 'transparent',
    danger: colors.danger,
  }[variant];

  const textColor = {
    primary: colors.white,
    secondary: colors.textPrimary,
    ghost: colors.accentPrimary,
    danger: colors.white,
  }[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bgColor },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : (
          <Text style={[styles.label, { color: textColor, fontFamily: 'DMSans-SemiBold' }]}>
            {label}
          </Text>
        )
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    minWidth: 44,
    minHeight: 44,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  label: { fontSize: 16, lineHeight: 24 },
});
