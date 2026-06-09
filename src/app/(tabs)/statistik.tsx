import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useStatData } from '@/features/stats/useStatData';
import { formatCurrency, formatCompact } from '@/shared/utils/formatters';
import { BarChart3 } from 'lucide-react-native';

type PeriodFilter = 'week' | 'month' | '3month' | '6month' | 'year';

const PERIOD_OPTIONS = [
  { value: 'week' as PeriodFilter,   label: 'Minggu Ini' },
  { value: 'month' as PeriodFilter,  label: 'Bulan Ini' },
  { value: '3month' as PeriodFilter, label: '3 Bulan' },
  { value: '6month' as PeriodFilter, label: '6 Bulan' },
  { value: 'year' as PeriodFilter,   label: 'Tahun Ini' },
];

export default function StatistikScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const { totalIncome, totalExpense, categoryExpenses, loading } = useStatData(period);

  const netFlow = totalIncome - totalExpense;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={styles.padding}>
          <SkeletonCard height={44} />
          <SkeletonCard height={100} style={styles.gap} />
          <SkeletonCard height={200} style={styles.gap} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 140 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        Statistik
      </Text>

      <ChipGroup options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.success}18` }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Pemasukan
          </Text>
          <Text style={[styles.summaryAmt, { color: colors.success, fontFamily: 'InstrumentSerif-Regular' }]}>
            {formatCompact(totalIncome)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.danger}18` }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Pengeluaran
          </Text>
          <Text style={[styles.summaryAmt, { color: colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
            {formatCompact(totalExpense)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: `${netFlow >= 0 ? colors.success : colors.danger}18` }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Selisih
          </Text>
          <Text style={[styles.summaryAmt, { color: netFlow >= 0 ? colors.success : colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
            {formatCompact(Math.abs(netFlow))}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        Pengeluaran per Kategori
      </Text>

      {categoryExpenses.length === 0 ? (
        <EmptyState
          title="Belum ada data statistik"
          subtitle="Mulai catat transaksi untuk melihat statistik."
          icon={<BarChart3 size={48} color={colors.textMuted} />}
        />
      ) : (
        <View style={styles.categoryList}>
          {categoryExpenses.slice(0, 8).map(item => (
            <View key={item.categoryId} style={[styles.catRow, { backgroundColor: colors.bgCard }]}>
              <View style={styles.catInfo}>
                <Text style={[styles.catName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                  {item.categoryName}
                </Text>
                <Text style={[styles.catAmt, { color: colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <View style={[styles.catBar, { backgroundColor: colors.bgSurface }]}>
                <View
                  style={[
                    styles.catBarFill,
                    {
                      backgroundColor: colors.danger,
                      width: `${Math.round(item.percent * 100)}%` as `${number}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  padding: { padding: 16, gap: 12 },
  gap: { marginTop: 12 },
  title: { fontSize: 24, lineHeight: 32 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, gap: 4 },
  summaryLabel: { fontSize: 11, lineHeight: 16 },
  summaryAmt: { fontSize: 20, lineHeight: 26 },
  sectionTitle: { fontSize: 18, lineHeight: 26, marginTop: 8 },
  categoryList: { gap: 8 },
  catRow: { padding: 12, borderRadius: 12, gap: 8 },
  catInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 14, lineHeight: 20 },
  catAmt: { fontSize: 13, lineHeight: 20 },
  catBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: 6, borderRadius: 3 },
});
