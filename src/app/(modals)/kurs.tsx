import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { useExchangeRates } from '@/features/exchange/useExchangeRates';
import { formatDateTime } from '@/shared/utils/formatters';
import { formatNumber } from '@/shared/utils/formatters';

const DISPLAYED_CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', name: 'Dolar Amerika' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'SGD', flag: '🇸🇬', name: 'Dolar Singapura' },
  { code: 'MYR', flag: '🇲🇾', name: 'Ringgit Malaysia' },
  { code: 'JPY', flag: '🇯🇵', name: 'Yen Jepang' },
  { code: 'GBP', flag: '🇬🇧', name: 'Poundsterling' },
  { code: 'AUD', flag: '🇦🇺', name: 'Dolar Australia' },
  { code: 'CNY', flag: '🇨🇳', name: 'Yuan Tiongkok' },
  { code: 'HKD', flag: '🇭🇰', name: 'Dolar Hong Kong' },
  { code: 'KRW', flag: '🇰🇷', name: 'Won Korea' },
  { code: 'THB', flag: '🇹🇭', name: 'Baht Thailand' },
  { code: 'CAD', flag: '🇨🇦', name: 'Dolar Kanada' },
  { code: 'CHF', flag: '🇨🇭', name: 'Franc Swiss' },
];

export default function KursScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { rates, loading, fromCache, cachedAt, refresh } = useExchangeRates();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title="Kurs Mata Uang"
        showBack
        rightAction={
          <Pressable onPress={() => void refresh()} accessibilityLabel="Refresh kurs">
            {loading
              ? <ActivityIndicator size="small" color={colors.accentPrimary} />
              : <RefreshCw size={20} color={colors.accentPrimary} />
            }
          </Pressable>
        }
      />

      <View style={[styles.statusBar, { backgroundColor: colors.bgCard }]}>
        {fromCache
          ? <WifiOff size={14} color={colors.warning} />
          : <Wifi size={14} color={colors.success} />
        }
        <Text style={[styles.statusText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          {fromCache ? 'Data dari cache' : 'Data terkini'}{cachedAt ? ` · ${formatDateTime(cachedAt)}` : ''}
        </Text>
        <Clock size={12} color={colors.textMuted} />
        <Text style={[styles.statusText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Refresh tiap 6 jam</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.baseLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          1 unit = ... Rupiah (IDR)
        </Text>
        {DISPLAYED_CURRENCIES.map(c => {
          const rate = rates[c.code];
          return (
            <View key={c.code} style={[styles.row, { backgroundColor: colors.bgCard }]}>
              <Text style={styles.flag}>{c.flag}</Text>
              <View style={styles.info}>
                <Text style={[styles.code, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                  {c.code}
                </Text>
                <Text style={[styles.name, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {c.name}
                </Text>
              </View>
              <Text style={[styles.rate, { color: loading ? colors.textMuted : colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}>
                {rate ? `Rp${formatNumber(rate)}` : '—'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  statusText: { fontSize: 11, lineHeight: 16 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 6 },
  baseLabel: { fontSize: 12, lineHeight: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 12 },
  flag: { fontSize: 24 },
  info: { flex: 1 },
  code: { fontSize: 16, lineHeight: 22 },
  name: { fontSize: 12, lineHeight: 16 },
  rate: { fontSize: 16, lineHeight: 22 },
});
