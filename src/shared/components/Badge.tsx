import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { colors } = useTheme();

  const bgColor = {
    success: `${colors.success}22`,
    danger: `${colors.danger}22`,
    warning: `${colors.warning}22`,
    info: `${colors.accentPrimary}22`,
    neutral: colors.bgSurface,
  }[variant];

  const textColor = {
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    info: colors.accentPrimary,
    neutral: colors.textMuted,
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color: textColor, fontFamily: 'DMSans-Medium' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, lineHeight: 16 },
});
