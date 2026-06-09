import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface OfflinePillProps {
  lastUpdated?: Date | null;
}

export function OfflinePill({ lastUpdated }: OfflinePillProps) {
  const { colors } = useTheme();
  const dateStr = lastUpdated
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(lastUpdated)
    : '-';

  return (
    <View style={[styles.pill, { backgroundColor: `${colors.warning}22`, borderColor: `${colors.warning}44` }]}>
      <WifiOff size={12} color={colors.warning} />
      <Text style={[styles.label, { color: colors.warning, fontFamily: 'DMSans-Medium' }]}>
        Mode Luring — Kurs per {dateStr}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
  },
  label: { fontSize: 11, lineHeight: 16 },
});
