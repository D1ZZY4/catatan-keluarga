import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { AppText } from '../../shared/components/AppText';
import { AppCard } from '../../shared/components/AppCard';
import { AppBar } from '../../shared/components/AppBar';
import { ChipGroup } from '../../shared/components/ChipGroup';
import { EmptyState } from '../../shared/components/EmptyState';
import { useTheme } from '../../shared/theme/ThemeContext';
import { AppLabels } from '../../shared/config/labels';
import { AppConfig } from '../../shared/config/periods';
import type { PeriodKey } from '../../shared/config/periods';
import { useTransactions } from '../../shared/hooks/useTransactions';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatMonthKey,
} from '../../shared/utils/formatters';
import type { Transaction } from '../../shared/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 64;

type StatsTab = 'overview' | 'debt' | 'tags';

function isIncomeType(type: string): boolean {
  return ['income', 'debt_received', 'savings_withdraw', 'invest_sell'].includes(type);
}
function isExpenseType(type: string): boolean {
  return ['expense', 'transfer_external', 'debt_given', 'savings_deposit', 'invest_buy'].includes(type);
}

interface StatCardProps {
  label: string;
  value: string;
  valueColor: string;
}

function StatCard({ label, value, valueColor }: StatCardProps): React.ReactElement {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.bgCard }]}>
      <AppText variant="labelSmall" color={colors.textMuted} style={styles.statLabel}>
        {label}
      </AppText>
      <AppText variant="headingSmall" color={valueColor} style={styles.statValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

// ─── Simple Pie Chart via react-native-svg ───────────────────────────────────
interface PieSlice { name: string; value: number; color: string }

function SimplePieChart({ data, size = 200 }: { data: PieSlice[]; size?: number }): React.ReactElement {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <View style={{ height: size }} />;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const inner = size * 0.22;

  let startAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const slice = { ...d, startAngle, endAngle };
    startAngle = endAngle;
    return slice;
  });

  function describeArc(sa: number, ea: number, outerR: number, innerR: number): string {
    const gap = 0.02;
    const s = sa + gap;
    const e = ea - gap;
    const x1 = cx + outerR * Math.cos(s);
    const y1 = cy + outerR * Math.sin(s);
    const x2 = cx + outerR * Math.cos(e);
    const y2 = cy + outerR * Math.sin(e);
    const x3 = cx + innerR * Math.cos(e);
    const y3 = cy + innerR * Math.sin(e);
    const x4 = cx + innerR * Math.cos(s);
    const y4 = cy + innerR * Math.sin(s);
    const large = ea - sa > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
  }

  return (
    <Svg width={size} height={size}>
      {slices.map((s) => (
        <Path
          key={s.name}
          d={describeArc(s.startAngle, s.endAngle, r, inner)}
          fill={s.color}
        />
      ))}
    </Svg>
  );
}

// ─── Simple Bar Chart via react-native-svg ────────────────────────────────────
interface BarGroup { label: string; income: number; expense: number }

function SimpleBarChart({ data, width, height, incomeColor, expenseColor }: {
  data: BarGroup[];
  width: number;
  height: number;
  incomeColor: string;
  expenseColor: string;
}): React.ReactElement {
  if (data.length === 0) return <View style={{ height }} />;
  const PAD_L = 44;
  const PAD_B = 28;
  const PAD_T = 8;
  const PAD_R = 8;
  const chartW = width - PAD_L - PAD_R;
  const chartH = height - PAD_T - PAD_B;
  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const groupW = chartW / data.length;
  const barW = Math.max(4, groupW * 0.3);

  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const x = PAD_L + i * groupW + groupW / 2;
        const incH = (d.income / maxVal) * chartH;
        const expH = (d.expense / maxVal) * chartH;
        return (
          <G key={d.label}>
            <Rect
              x={x - barW - 2}
              y={PAD_T + chartH - incH}
              width={barW}
              height={incH}
              fill={incomeColor}
              rx={2}
            />
            <Rect
              x={x + 2}
              y={PAD_T + chartH - expH}
              width={barW}
              height={expH}
              fill={expenseColor}
              rx={2}
            />
            <SvgText
              x={x}
              y={PAD_T + chartH + 14}
              fontSize={8}
              fill="#999"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          </G>
        );
      })}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD_T + chartH - frac * chartH;
        const val = frac * maxVal;
        return (
          <G key={frac}>
            <Path
              d={`M ${PAD_L} ${y} L ${width - PAD_R} ${y}`}
              stroke="#ccc"
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
            <SvgText x={PAD_L - 4} y={y + 4} fontSize={8} fill="#999" textAnchor="end">
              {val >= 1_000_000 ? `${(val / 1_000_000).toFixed(0)}jt` : `${(val / 1_000).toFixed(0)}rb`}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Simple Area Chart via react-native-svg ──────────────────────────────────
function SimpleAreaChart({ data, width, height, color }: {
  data: Array<{ label: string; value: number }>;
  width: number;
  height: number;
  color: string;
}): React.ReactElement {
  if (data.length < 2) return <View style={{ height }} />;
  const PAD_L = 44;
  const PAD_B = 28;
  const PAD_T = 8;
  const PAD_R = 8;
  const chartW = width - PAD_L - PAD_R;
  const chartH = height - PAD_T - PAD_B;
  const maxVal = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const midY = PAD_T + chartH / 2;

  const pts = data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * chartW,
    y: midY - (d.value / maxVal) * (chartH / 2),
    label: d.label,
  }));

  const linePts = pts.map((p) => `${p.x},${p.y}`).join(' L ');
  const areaPath = `M ${pts[0]!.x} ${midY} L ${linePts.replace('M ', '')} L ${pts[pts.length - 1]!.x} ${midY} Z`;
  const linePath = `M ${linePts}`;

  return (
    <Svg width={width} height={height}>
      <Path d={areaPath} fill={`${color}30`} />
      <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />
      {pts.map((p) => (
        <SvgText key={p.label} x={p.x} y={PAD_T + chartH + 14} fontSize={8} fill="#999" textAnchor="middle">
          {p.label}
        </SvgText>
      ))}
    </Svg>
  );
}

const PIE_COLORS = [
  '#8CC0EB', '#F4A261', '#2A9D8F', '#E76F51', '#E9C46A',
  '#AB47BC', '#00ACC1', '#6D4C41',
];

export default function StatsScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('thisMonth');
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');

  const { data: transactions } = useTransactions('all');

  const periodRange = useMemo(() => {
    const def = AppConfig.periods.find((p) => p.key === activePeriod);
    return def?.getRange?.() ?? null;
  }, [activePeriod]);

  const filtered = useMemo(() => {
    if (!periodRange) return transactions;
    return transactions.filter(
      (tx) => tx.date >= periodRange.from.getTime() && tx.date <= periodRange.to.getTime(),
    );
  }, [transactions, periodRange]);

  const totalIncome = useMemo(
    () => filtered.filter((tx) => isIncomeType(tx.type)).reduce((s: number, tx: Transaction) => s + tx.amount, 0),
    [filtered],
  );
  const totalExpense = useMemo(
    () => filtered.filter((tx) => isExpenseType(tx.type)).reduce((s: number, tx: Transaction) => s + tx.amount, 0),
    [filtered],
  );
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    for (const tx of filtered.filter((t: Transaction) => isExpenseType(t.type))) {
      const key = tx.categoryId ?? 'Lain-lain';
      const ex = map.get(key);
      if (ex !== undefined) ex.value += tx.amount;
      else map.set(key, { name: key, value: tx.amount });
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filtered]);

  const last6MonthsData = useMemo(() => {
    const months: BarGroup[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const inc = transactions
        .filter((tx: Transaction) => tx.date >= start && tx.date <= end && isIncomeType(tx.type))
        .reduce((s: number, tx: Transaction) => s + tx.amount, 0);
      const exp = transactions
        .filter((tx: Transaction) => tx.date >= start && tx.date <= end && isExpenseType(tx.type))
        .reduce((s: number, tx: Transaction) => s + tx.amount, 0);
      months.push({ label: formatMonthKey(d), income: inc, expense: exp });
    }
    return months;
  }, [transactions]);

  const areaData = useMemo(
    () => last6MonthsData.map((d) => ({ label: d.label, value: d.income - d.expense })),
    [last6MonthsData],
  );

  const openDebts = useMemo(
    () => transactions.filter((tx: Transaction) => tx.type === 'debt_given' || tx.type === 'debt_received'),
    [transactions],
  );

  const pieData: PieSlice[] = expenseByCategory.map((d, i) => ({
    name: d.name,
    value: d.value,
    color: PIE_COLORS[i % PIE_COLORS.length]!,
  }));

  const periodItems = AppConfig.periods
    .filter((p) => p.key !== 'custom')
    .map((p) => ({ key: p.key, label: p.label }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <AppBar
        title={AppLabels.tabs.stats}
        hideCalculator
        transparent
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Row */}
        <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
          {(['overview', 'debt', 'tags'] as StatsTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn,
                { borderBottomColor: activeTab === tab ? colors.accentPrimary : 'transparent' },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
            >
              <AppText
                variant="labelMedium"
                color={activeTab === tab ? colors.accentPrimary : colors.textMuted}
                style={{ fontFamily: activeTab === tab ? 'DMSans-SemiBold' : 'DMSans-Regular' }}
              >
                {tab === 'overview' ? 'Ringkasan' : tab === 'debt' ? 'Hutang & Piutang' : 'Per Tag'}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <>
            <ChipGroup
              items={periodItems}
              selected={[activePeriod]}
              onToggle={(key) => setActivePeriod(key as PeriodKey)}
              multiSelect={false}
              style={styles.periodChips}
            />

            {transactions.length === 0 ? (
              <EmptyState
                icon="bar-chart"
                title={AppLabels.emptyState.stats.title}
                body={AppLabels.emptyState.stats.body}
                style={styles.empty}
              />
            ) : (
              <>
                <View style={styles.statGrid}>
                  <StatCard label="Pemasukan" value={formatCurrencyCompact(totalIncome)} valueColor={colors.success} />
                  <StatCard label="Pengeluaran" value={formatCurrencyCompact(totalExpense)} valueColor={colors.danger} />
                  <StatCard label="Selisih" value={formatCurrencyCompact(netBalance)} valueColor={netBalance >= 0 ? colors.success : colors.danger} />
                  <StatCard
                    label="Tingkat Tabungan"
                    value={`${savingsRate}%`}
                    valueColor={savingsRate >= 20 ? colors.success : savingsRate >= 0 ? colors.warning : colors.danger}
                  />
                </View>

                {expenseByCategory.length > 0 && (
                  <AppCard style={styles.chartCard}>
                    <AppText variant="headingSmall" color={colors.textPrimary} style={styles.chartTitle}>
                      Pengeluaran per Kategori
                    </AppText>
                    <View style={{ alignItems: 'center' }}>
                      <SimplePieChart data={pieData} size={CHART_W > 300 ? 240 : 200} />
                    </View>
                    <View style={styles.legend}>
                      {pieData.slice(0, 6).map((d) => (
                        <View key={d.name} style={styles.legendItem}>
                          <View style={[styles.dot, { backgroundColor: d.color }]} />
                          <AppText variant="labelSmall" color={colors.textMuted} style={{ flex: 1 }} numberOfLines={1}>
                            {d.name}
                          </AppText>
                          <AppText variant="labelSmall" color={colors.textPrimary} style={styles.monoText}>
                            {formatCurrencyCompact(d.value)}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </AppCard>
                )}

                <AppCard style={styles.chartCard}>
                  <AppText variant="headingSmall" color={colors.textPrimary} style={styles.chartTitle}>
                    Pemasukan vs Pengeluaran (6 Bulan)
                  </AppText>
                  <SimpleBarChart
                    data={last6MonthsData}
                    width={CHART_W}
                    height={200}
                    incomeColor={colors.success}
                    expenseColor={colors.danger}
                  />
                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: colors.success }]} />
                      <AppText variant="labelSmall" color={colors.textMuted}>Pemasukan</AppText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                      <AppText variant="labelSmall" color={colors.textMuted}>Pengeluaran</AppText>
                    </View>
                  </View>
                </AppCard>

                <AppCard style={styles.chartCard}>
                  <AppText variant="headingSmall" color={colors.textPrimary} style={styles.chartTitle}>
                    Tren Total Kas
                  </AppText>
                  <SimpleAreaChart
                    data={areaData}
                    width={CHART_W}
                    height={160}
                    color={colors.success}
                  />
                </AppCard>
              </>
            )}
          </>
        )}

        {activeTab === 'debt' && (
          <View style={styles.debtList}>
            {openDebts.length === 0 ? (
              <EmptyState
                icon="users"
                title={AppLabels.emptyState.debts.title}
                body={AppLabels.emptyState.debts.body}
                style={styles.empty}
              />
            ) : (
              openDebts.map((tx: Transaction) => (
                <AppCard key={tx.id} style={styles.debtCard}>
                  <View style={styles.debtRow}>
                    <AppText variant="bodyMedium" color={colors.textPrimary}>
                      {tx.linkedPersonName ?? '—'}
                    </AppText>
                    <AppText
                      variant="bodyMedium"
                      color={tx.type === 'debt_given' ? colors.danger : colors.success}
                      style={styles.monoText}
                    >
                      {tx.type === 'debt_given' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                    </AppText>
                  </View>
                  <AppText variant="labelSmall" color={colors.textMuted}>
                    {tx.type === 'debt_given' ? 'Piutang' : 'Hutang'}
                  </AppText>
                </AppCard>
              ))
            )}
          </View>
        )}

        {activeTab === 'tags' && (
          <EmptyState
            icon="tag"
            title="Belum ada statistik per tag"
            body="Tambahkan tag ke transaksimu untuk melihat statistiknya di sini."
            style={styles.empty}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  periodChips: {
    marginHorizontal: -16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 14,
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  chartCard: {
    padding: 14,
  },
  chartTitle: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: '45%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  monoText: {
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  empty: {
    marginTop: 40,
  },
  debtList: {
    gap: 10,
    paddingTop: 8,
  },
  debtCard: {
    gap: 4,
  },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
