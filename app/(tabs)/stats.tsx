/**
 * StatsScreen — statistik keuangan dengan Victory Native v41 charts.
 * Tabs: Ringkasan (overview) | Kategori | Hutang & Piutang
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartesianChart, Bar } from 'victory-native';
import { PolarChart, Pie } from 'victory-native';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAppData } from '../../src/shared/context/AppDataContext';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { DynamicIcon } from '../../src/shared/components/DynamicIcon';
import { formatCurrency } from '../../src/shared/utils/format';
import { INCOME_TYPES, EXPENSE_TYPES } from '../../src/shared/constants/transactionTypes';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 32;

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
  if (period === 'week') return { start: now - 7 * 86400000, end: now };
  if (period === 'month') {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return { start: d.getTime(), end: now };
  }
  if (period === 'year') {
    const d = new Date();
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return { start: d.getTime(), end: now };
  }
  return { start: 0, end: now };
}

function last6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.toLocaleString('id-ID', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`,
    );
  }
  return months;
}

function getMonthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleString('id-ID', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`;
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

  // Category breakdown for pie chart
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of filtered) {
      if (EXPENSE_TYPES.includes(tx.type)) {
        map[tx.categoryId] = (map[tx.categoryId] ?? 0) + tx.amount;
      }
    }
    return Object.entries(map)
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          label: cat?.name ?? 'Lain-lain',
          value,
          color: cat?.color ?? '#E65100',
          icon: cat?.icon ?? 'circle',
          id: catId,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered, categories]);

  // Monthly bar chart data
  const monthlyChartData = useMemo(() => {
    const months = last6Months();
    const map: Record<string, { income: number; expense: number }> = {};
    for (const m of months) map[m] = { income: 0, expense: 0 };
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    for (const tx of transactions.filter((t) => t.date >= sixMonthsAgo.getTime())) {
      const key = getMonthKey(tx.date);
      if (!(key in map)) continue;
      const row = map[key]!;
      if (INCOME_TYPES.includes(tx.type)) row.income += tx.amount;
      else if (EXPENSE_TYPES.includes(tx.type)) row.expense += tx.amount;
    }
    return months.map((m) => ({
      month: m,
      income: Math.round((map[m]?.income ?? 0) / 1000),
      expense: Math.round((map[m]?.expense ?? 0) / 1000),
    }));
  }, [transactions]);

  // Debt data
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
      <Text style={[s.title, { color: c.textPrimary }]}>Statistik</Text>

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
            <Text style={[s.tabText, { color: activeTab === tab ? c.accentPrimary : c.textMuted }]}>
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

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Summary cards */}
            <View style={s.summaryRow}>
              <View style={[s.summaryCard, { backgroundColor: '#e8f5e9' }]}>
                <Text style={[s.summaryLabel, { color: '#2e7d32' }]}>Pemasukan</Text>
                <Text style={[s.summaryValue, { color: '#2e7d32' }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(totalIncome, 'IDR')}
                </Text>
              </View>
              <View style={[s.summaryCard, { backgroundColor: '#fce4ec' }]}>
                <Text style={[s.summaryLabel, { color: '#c62828' }]}>Pengeluaran</Text>
                <Text style={[s.summaryValue, { color: '#c62828' }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(totalExpense, 'IDR')}
                </Text>
              </View>
            </View>

            <View style={[s.netCard, { backgroundColor: c.bgCard }]}>
              <View style={s.netRow}>
                <Text style={[s.netLabel, { color: c.textMuted }]}>Arus Kas Bersih</Text>
                <Text
                  style={[
                    s.netValue,
                    { color: netCashflow >= 0 ? '#2e7d32' : '#c62828' },
                  ]}
                >
                  {formatCurrency(netCashflow, 'IDR')}
                </Text>
              </View>
              <View style={s.netRow}>
                <Text style={[s.netLabel, { color: c.textMuted }]}>Tingkat Tabungan</Text>
                <Text style={[s.netValue, { color: c.accentPrimary }]}>
                  {savingsRate}%
                </Text>
              </View>
            </View>

            {/* Monthly Bar Chart — 6 bulan terakhir */}
            {monthlyChartData.length > 0 && (
              <View style={[s.chartCard, { backgroundColor: c.bgCard }]}>
                <Text style={[s.chartTitle, { color: c.textPrimary }]}>6 Bulan Terakhir (ribu)</Text>
                <View style={{ height: 200, width: CHART_W - 32 }}>
                  <CartesianChart
                    data={monthlyChartData}
                    xKey="month"
                    yKeys={['income', 'expense']}
                    domainPadding={{ left: 20, right: 20 }}
                  >
                    {({ points, chartBounds }) => (
                      <>
                        <Bar
                          points={points.income}
                          chartBounds={chartBounds}
                          color="#4caf50"
                          roundedCorners={{ topLeft: 4, topRight: 4 }}
                          barWidth={10}
                        />
                        <Bar
                          points={points.expense}
                          chartBounds={chartBounds}
                          color="#ef5350"
                          roundedCorners={{ topLeft: 4, topRight: 4 }}
                          barWidth={10}
                        />
                      </>
                    )}
                  </CartesianChart>
                </View>
                <View style={s.legend}>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: '#4caf50' }]} />
                    <Text style={[s.legendText, { color: c.textMuted }]}>Pemasukan</Text>
                  </View>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: '#ef5350' }]} />
                    <Text style={[s.legendText, { color: c.textMuted }]}>Pengeluaran</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* ── CATEGORY TAB ── */}
        {activeTab === 'category' && (
          <>
            {expenseByCategory.length === 0 ? (
              <View style={[s.emptyBox, { backgroundColor: c.bgCard }]}>
                <Text style={[s.emptyText, { color: c.textMuted }]}>
                  Tidak ada data pengeluaran di periode ini
                </Text>
              </View>
            ) : (
              <>
                {/* Pie chart */}
                <View style={[s.chartCard, { backgroundColor: c.bgCard }]}>
                  <Text style={[s.chartTitle, { color: c.textPrimary }]}>
                    Pengeluaran per Kategori
                  </Text>
                  <View style={{ height: 220, width: CHART_W - 32 }}>
                    <PolarChart
                      data={expenseByCategory}
                      labelKey="label"
                      valueKey="value"
                      colorKey="color"
                    >
                      <Pie.Chart innerRadius="40%">
                        {({ slice }) => (
                          <Pie.Slice />
                        )}
                      </Pie.Chart>
                    </PolarChart>
                  </View>
                </View>

                {/* Category list */}
                <View style={[s.categoryList, { backgroundColor: c.bgCard }]}>
                  {expenseByCategory.map((item, i) => {
                    const pct =
                      totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
                    return (
                      <View key={item.id} style={s.categoryRow}>
                        <View style={[s.catIconBox, { backgroundColor: item.color + '22' }]}>
                          <DynamicIcon name={item.icon} size={16} color={item.color} />
                        </View>
                        <View style={s.catInfo}>
                          <Text style={[s.catName, { color: c.textPrimary }]}>{item.label}</Text>
                          <View style={[s.progressBar, { backgroundColor: c.bgPage }]}>
                            <View
                              style={[
                                s.progressFill,
                                { width: `${pct}%`, backgroundColor: item.color },
                              ]}
                            />
                          </View>
                        </View>
                        <View style={s.catAmounts}>
                          <Text style={[s.catAmount, { color: c.textPrimary }]} numberOfLines={1}>
                            {formatCurrency(item.value, 'IDR')}
                          </Text>
                          <Text style={[s.catPct, { color: c.textMuted }]}>{pct}%</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

        {/* ── DEBT TAB ── */}
        {activeTab === 'debt' && (
          <>
            {debtData.given.length === 0 && debtData.received.length === 0 ? (
              <View style={[s.emptyBox, { backgroundColor: c.bgCard }]}>
                <Text style={[s.emptyText, { color: c.textMuted }]}>
                  Belum ada data hutang atau piutang
                </Text>
              </View>
            ) : (
              <>
                {debtData.given.length > 0 && (
                  <View style={[s.debtSection, { backgroundColor: c.bgCard }]}>
                    <Text style={[s.debtSectionTitle, { color: '#e65100' }]}>Piutang (Uang Dipinjamkan)</Text>
                    {debtData.given.map((d) => (
                      <View key={d.name} style={[s.debtRow, { borderBottomColor: c.bgPage }]}>
                        <Text style={[s.debtName, { color: c.textPrimary }]}>{d.name}</Text>
                        <Text style={[s.debtAmount, { color: '#e65100' }]}>
                          {formatCurrency(d.total, 'IDR')}
                        </Text>
                      </View>
                    ))}
                    <View style={[s.debtTotal, { borderTopColor: c.bgPage }]}>
                      <Text style={[s.debtTotalLabel, { color: c.textMuted }]}>Total Piutang</Text>
                      <Text style={[s.debtTotalValue, { color: '#e65100' }]}>
                        {formatCurrency(debtData.given.reduce((s, d) => s + d.total, 0), 'IDR')}
                      </Text>
                    </View>
                  </View>
                )}

                {debtData.received.length > 0 && (
                  <View style={[s.debtSection, { backgroundColor: c.bgCard }]}>
                    <Text style={[s.debtSectionTitle, { color: '#1565c0' }]}>Hutang (Uang Dipinjam)</Text>
                    {debtData.received.map((d) => (
                      <View key={d.name} style={[s.debtRow, { borderBottomColor: c.bgPage }]}>
                        <Text style={[s.debtName, { color: c.textPrimary }]}>{d.name}</Text>
                        <Text style={[s.debtAmount, { color: '#1565c0' }]}>
                          {formatCurrency(d.total, 'IDR')}
                        </Text>
                      </View>
                    ))}
                    <View style={[s.debtTotal, { borderTopColor: c.bgPage }]}>
                      <Text style={[s.debtTotalLabel, { color: c.textMuted }]}>Total Hutang</Text>
                      <Text style={[s.debtTotalValue, { color: '#1565c0' }]}>
                        {formatCurrency(debtData.received.reduce((s, d) => s + d.total, 0), 'IDR')}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  title: {
    fontSize: 22,
    fontFamily: 'DM-Sans-Bold',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'DM-Sans-SemiBold',
  },
  periodBar: {
    borderBottomWidth: 1,
    maxHeight: 52,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  periodChipText: {
    fontSize: 12,
    fontFamily: 'DM-Sans-Medium',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'DM-Sans-Medium',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'DM-Sans-Bold',
  },
  netCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: {
    fontSize: 13,
    fontFamily: 'DM-Sans',
  },
  netValue: {
    fontSize: 15,
    fontFamily: 'DM-Sans-SemiBold',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: 'DM-Sans-SemiBold',
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'DM-Sans',
  },
  categoryList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catInfo: {
    flex: 1,
    gap: 6,
  },
  catName: {
    fontSize: 13,
    fontFamily: 'DM-Sans-Medium',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  catAmounts: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  catAmount: {
    fontSize: 13,
    fontFamily: 'DM-Sans-SemiBold',
  },
  catPct: {
    fontSize: 11,
    fontFamily: 'DM-Sans',
  },
  emptyBox: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'DM-Sans',
    textAlign: 'center',
  },
  debtSection: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingTop: 16,
  },
  debtSectionTitle: {
    fontSize: 14,
    fontFamily: 'DM-Sans-SemiBold',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  debtName: {
    fontSize: 14,
    fontFamily: 'DM-Sans',
  },
  debtAmount: {
    fontSize: 14,
    fontFamily: 'DM-Sans-SemiBold',
  },
  debtTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  debtTotalLabel: {
    fontSize: 13,
    fontFamily: 'DM-Sans-Medium',
  },
  debtTotalValue: {
    fontSize: 15,
    fontFamily: 'DM-Sans-Bold',
  },
});
