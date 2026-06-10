import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAppData } from '../../src/shared/context/AppDataContext';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { DynamicIcon } from '../../src/shared/components/DynamicIcon';
import { formatCurrency } from '../../src/shared/utils/format';
import { INCOME_TYPES, EXPENSE_TYPES } from '../../src/shared/constants/transactionTypes';

type Period = 'week' | 'month' | 'year' | 'all';
type StatsTab = 'overview' | 'category' | 'debt';

const PERIOD_LABELS: Record<Period, string> = {
  week: '7 Hari',
  month: 'Bulan Ini',
  year: 'Tahun Ini',
  all: 'Semua',
};

function getPeriodRange(period: Period): { start: number; end: number } {
  const now = Date.now();
  const end = now;
  if (period === 'week') return { start: now - 7 * 86400000, end };
  if (period === 'month') {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return { start: d.getTime(), end };
  }
  if (period === 'year') {
    const d = new Date();
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return { start: d.getTime(), end };
  }
  return { start: 0, end };
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();
  const { transactions, categories } = useAppData();

  const [period, setPeriod] = useState<Period>('month');
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');

  const { start, end } = getPeriodRange(period);
  const filtered = useMemo(
    () => transactions.filter((t) => t.date >= start && t.date <= end),
    [transactions, start, end],
  );

  const totalIncome = useMemo(
    () => filtered.filter((t) => INCOME_TYPES.includes(t.type)).reduce((s, t) => s + t.amount, 0),
    [filtered],
  );
  const totalExpense = useMemo(
    () => filtered.filter((t) => EXPENSE_TYPES.includes(t.type)).reduce((s, t) => s + t.amount, 0),
    [filtered],
  );
  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

  // Category breakdown
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of filtered) {
      if (EXPENSE_TYPES.includes(tx.type)) {
        map[tx.categoryId] = (map[tx.categoryId] ?? 0) + tx.amount;
      }
    }
    return Object.entries(map)
      .map(([catId, amount]) => ({
        category: categories.find((c) => c.id === catId),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [filtered, categories]);

  // Debt tracker
  const debtData = useMemo(() => {
    const given: Record<string, { name: string; total: number }> = {};
    const received: Record<string, { name: string; total: number }> = {};
    for (const tx of transactions) {
      if (tx.type === 'debt_given' && tx.linkedPersonName) {
        const key = tx.linkedPersonName;
        if (!given[key]) given[key] = { name: key, total: 0 };
        given[key]!.total += tx.amount;
      }
      if (tx.type === 'debt_received' && tx.linkedPersonName) {
        const key = tx.linkedPersonName;
        if (!received[key]) received[key] = { name: key, total: 0 };
        received[key]!.total += tx.amount;
      }
      if (tx.type === 'debt_repay' && tx.linkedPersonName) {
        const key = tx.linkedPersonName;
        if (received[key]) received[key]!.total -= tx.amount;
      }
    }
    return {
      given: Object.values(given).filter((d) => d.total > 0),
      received: Object.values(received).filter((d) => d.total > 0),
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <View style={[s.screen, { backgroundColor: c.bgPage, paddingTop: insets.top }]}>
        <Text style={[s.title, { color: c.textPrimary }]}>Statistik</Text>
        <EmptyState
          title="Belum ada data"
          description="Tambahkan transaksi untuk melihat statistik keuangan kamu"
        />
      </View>
    );
  }

  return (
    <View style={[s.screen, { backgroundColor: c.bgPage, paddingTop: insets.top }]}>
      {/* Tab bar */}
      <View style={[s.tabBar, { borderBottomColor: c.bgCard }]}>
        {(['overview', 'category', 'debt'] as StatsTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              s.tab,
              activeTab === tab
                ? { borderBottomColor: c.accentPrimary, borderBottomWidth: 2 }
                : {},
            ]}
          >
            <Text
              style={[
                s.tabText,
                { color: activeTab === tab ? c.accentPrimary : c.textMuted },
              ]}
            >
              {tab === 'overview' ? 'Ringkasan' : tab === 'category' ? 'Kategori' : 'Hutang'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.periodBar, { borderBottomColor: c.bgCard }]}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              s.periodChip,
              period === p
                ? { backgroundColor: c.accentPrimary }
                : { backgroundColor: c.bgCard },
            ]}
          >
            <Text style={[s.periodChipText, { color: period === p ? '#fff' : c.textMuted }]}>
              {PERIOD_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}>
        {/* Overview tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary cards */}
            <View style={s.summaryGrid}>
              <View style={[s.summaryCard, { backgroundColor: '#e8f5e9' }]}>
                <Text style={s.summaryIcon}>↑</Text>
                <Text style={[s.summaryLabel, { color: '#2e7d32' }]}>Pemasukan</Text>
                <Text style={[s.summaryAmount, { color: '#2e7d32' }]}>
                  {formatCurrency(totalIncome, 'IDR')}
                </Text>
              </View>
              <View style={[s.summaryCard, { backgroundColor: '#ffebee' }]}>
                <Text style={s.summaryIcon}>↓</Text>
                <Text style={[s.summaryLabel, { color: '#c62828' }]}>Pengeluaran</Text>
                <Text style={[s.summaryAmount, { color: '#c62828' }]}>
                  {formatCurrency(totalExpense, 'IDR')}
                </Text>
              </View>
            </View>

            {/* Net cashflow */}
            <View style={[s.netCard, { backgroundColor: c.bgCard }]}>
              <View style={s.netRow}>
                <Text style={[s.netLabel, { color: c.textMuted }]}>Net Cash Flow</Text>
                <Text
                  style={[
                    s.netAmount,
                    { color: netCashflow >= 0 ? '#2e7d32' : '#c62828' },
                  ]}
                >
                  {netCashflow >= 0 ? '+' : ''}{formatCurrency(netCashflow, 'IDR')}
                </Text>
              </View>
              <View style={s.netRow}>
                <Text style={[s.netLabel, { color: c.textMuted }]}>Tingkat Tabungan</Text>
                <Text
                  style={[
                    s.netAmount,
                    { color: savingsRate >= 0 ? '#2e7d32' : '#c62828' },
                  ]}
                >
                  {savingsRate}%
                </Text>
              </View>

              {/* Savings bar */}
              <View style={[s.savingsBar, { backgroundColor: c.bgSurface }]}>
                <View
                  style={[
                    s.savingsFill,
                    {
                      width: `${Math.min(100, Math.max(0, savingsRate))}%` as any,
                      backgroundColor: savingsRate >= 20 ? '#2e7d32' : savingsRate >= 0 ? '#e65100' : '#c62828',
                    },
                  ]}
                />
              </View>
              <Text style={[s.savingsHint, { color: c.textMuted }]}>
                {savingsRate >= 30
                  ? '✓ Tingkat tabungan sehat (≥30%)'
                  : savingsRate >= 20
                  ? '◆ Tingkat tabungan cukup (20-29%)'
                  : savingsRate >= 10
                  ? '⚠ Tingkat tabungan rendah (10-19%)'
                  : '✗ Perlu perhatian (<10%)'}
              </Text>
            </View>
          </>
        )}

        {/* Category tab */}
        {activeTab === 'category' && (
          <View style={[s.catList, { backgroundColor: c.bgCard }]}>
            {expenseByCategory.length === 0 ? (
              <Text style={[s.emptyText, { color: c.textMuted }]}>Tidak ada data pengeluaran</Text>
            ) : (
              expenseByCategory.map(({ category: cat, amount }, idx) => {
                const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return (
                  <View key={cat?.id ?? idx} style={[s.catRow, idx < expenseByCategory.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#00000008' }]}>
                    <View style={[s.catIconWrap, { backgroundColor: `${cat?.color ?? '#888'}22` }]}>
                      <DynamicIcon name={cat?.icon ?? 'MoreHorizontal'} size={18} color={cat?.color ?? '#888'} />
                    </View>
                    <View style={s.catInfo}>
                      <Text style={[s.catName, { color: c.textPrimary }]}>{cat?.name ?? 'Lainnya'}</Text>
                      <View style={[s.catBar, { backgroundColor: c.bgSurface }]}>
                        <View
                          style={[
                            s.catBarFill,
                            {
                              width: `${pct}%` as any,
                              backgroundColor: cat?.color ?? c.accentPrimary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={s.catAmounts}>
                      <Text style={[s.catAmount, { color: c.textPrimary }]}>
                        {formatCurrency(amount, 'IDR')}
                      </Text>
                      <Text style={[s.catPct, { color: c.textMuted }]}>{pct}%</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Debt tab */}
        {activeTab === 'debt' && (
          <>
            {debtData.given.length > 0 && (
              <View>
                <Text style={[s.debtSectionTitle, { color: c.textMuted }]}>PIUTANG (Yang perlu mengembalikan ke saya)</Text>
                <View style={[s.debtList, { backgroundColor: c.bgCard }]}>
                  {debtData.given.map((d) => (
                    <View key={d.name} style={s.debtRow}>
                      <View style={[s.debtIcon, { backgroundColor: '#7b1fa220' }]}>
                        <DynamicIcon name="User" size={16} color="#7b1fa2" />
                      </View>
                      <Text style={[s.debtName, { color: c.textPrimary }]}>{d.name}</Text>
                      <Text style={[s.debtAmount, { color: '#7b1fa2' }]}>
                        {formatCurrency(d.total, 'IDR')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {debtData.received.length > 0 && (
              <View>
                <Text style={[s.debtSectionTitle, { color: c.textMuted }]}>HUTANG (Yang harus saya bayar)</Text>
                <View style={[s.debtList, { backgroundColor: c.bgCard }]}>
                  {debtData.received.map((d) => (
                    <View key={d.name} style={s.debtRow}>
                      <View style={[s.debtIcon, { backgroundColor: '#c6282820' }]}>
                        <DynamicIcon name="User" size={16} color="#c62828" />
                      </View>
                      <Text style={[s.debtName, { color: c.textPrimary }]}>{d.name}</Text>
                      <Text style={[s.debtAmount, { color: '#c62828' }]}>
                        {formatCurrency(d.total, 'IDR')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {debtData.given.length === 0 && debtData.received.length === 0 && (
              <EmptyState title="Tidak ada hutang/piutang aktif" description="Semua sudah lunas!" />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 24, fontFamily: 'Instrument-Serif', padding: 20 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 13, fontFamily: 'DM-Sans-SemiBold' },
  periodBar: { borderBottomWidth: 1, flexShrink: 0 },
  periodChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  periodChipText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  summaryGrid: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, borderRadius: 20, padding: 16, gap: 4 },
  summaryIcon: { fontSize: 18 },
  summaryLabel: { fontSize: 11, fontFamily: 'DM-Sans-Medium' },
  summaryAmount: { fontSize: 15, fontFamily: 'JetBrains-Mono', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  netCard: { borderRadius: 20, padding: 16, gap: 12 },
  netRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  netLabel: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  netAmount: { fontSize: 15, fontFamily: 'JetBrains-Mono', fontVariant: ['tabular-nums'] },
  savingsBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  savingsFill: { height: '100%', borderRadius: 3 },
  savingsHint: { fontSize: 12, fontFamily: 'DM-Sans' },
  catList: { borderRadius: 20, overflow: 'hidden' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  catIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catInfo: { flex: 1, gap: 6 },
  catName: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  catBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
  catAmounts: { alignItems: 'flex-end' },
  catAmount: { fontSize: 13, fontFamily: 'JetBrains-Mono', fontVariant: ['tabular-nums'] },
  catPct: { fontSize: 11, fontFamily: 'DM-Sans', marginTop: 2 },
  emptyText: { textAlign: 'center', padding: 32, fontFamily: 'DM-Sans' },
  debtSectionTitle: { fontSize: 10, fontFamily: 'DM-Sans-SemiBold', letterSpacing: 1, marginBottom: 8 },
  debtList: { borderRadius: 16, overflow: 'hidden' },
  debtRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  debtIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  debtName: { flex: 1, fontSize: 14, fontFamily: 'DM-Sans-Medium' },
  debtAmount: { fontSize: 14, fontFamily: 'JetBrains-Mono', fontVariant: ['tabular-nums'] },
});
