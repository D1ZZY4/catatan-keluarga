import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {illustration && <View style={styles.illu}>{illustration}</View>}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {description && (
        <Text style={[styles.desc, { color: colors.textMuted }]}>{description}</Text>
      )}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[styles.btn, { backgroundColor: colors.accentPrimary }]}
        >
          <Text style={styles.btnText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  illu: { marginBottom: 20 },
  title: { fontSize: 16, fontFamily: 'DM-Sans-SemiBold', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 13, fontFamily: 'DM-Sans', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  btnText: { color: '#fff', fontSize: 14, fontFamily: 'DM-Sans-SemiBold' },
});
