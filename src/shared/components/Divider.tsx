import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface DividerProps {
  vertical?: boolean;
  margin?: number;
}

export function Divider({ vertical = false, margin = 0 }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: colors.border, margin },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { height: StyleSheet.hairlineWidth, width: '100%' },
  vertical: { width: StyleSheet.hairlineWidth, height: '100%' },
});
