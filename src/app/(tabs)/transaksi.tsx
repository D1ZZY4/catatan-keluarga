import React, { useState } from 'react';
import {
  View, Text, SectionList, StyleSheet, Pressable, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { SearchBar } from '@/shared/components/SearchBar';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { formatCurrency, formatRelativeDate } from '@/shared/utils/formatters';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react-native';
import { useTransactionList } from '@/features/transactions/useTransactionList';
import type { Transaction } from '@/shared/types';
import { isIncomeType, isExpenseType, getTypeOption } from '@/shared/constants/transactionTypes';
import { useRouter } from 'expo-router';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';
type TypeFilter = 'all' | 'income' | 'expense' | 'transfer';

const PERIOD_OPTIONS = [
  { value: 'today' as PeriodFilter, label: 'Hari ini' },
  { value: 'week' as PeriodFilter, label: '7 Hari' },
  { value: 'month' as PeriodFilter, label: 'Bulan ini' },
  { value: 'all' as PeriodFilter, label: 'Semua' },
];

const TYPE_FILTER_OPTIONS = [
  { value: 'all' as TypeFilter, label: 'Semua' },
  { value: 'income' as TypeFilter, label: 'Pemasukan' },
  { value: 'expense' as TypeFilter, label: 'Pengeluaran' },
  { value: 'transfer' as TypeFilter, label: 'Transfer' },
];

function TransactionItem({ item }: { item: Transaction }) {
  const { colors } = useTheme();
  const router = useRouter();
  const isIncome = isIncomeType(item.type);
  const isExpense = isExpenseType(item.type);
  const typeOpt = getTypeOption(item.type);

  const amountColor = isIncome ? colors.success : isExpense ? colors.danger : colors.accentPrimary;
  const prefix = isIncome ? '+' : isExpense ? '-' : '';

  return (
    <Pressable
      onPress={() => router.push(`/transaksi/${item.id}`)}
      style={({ pressed }) => [styles.txItem, { backgroundColor: colors.bgCard, opacity: pressed ? 0.85 : 1 }]}
      accessibilityLabel={`Detail transaksi ${typeOpt?.label ?? item.type}`}
    >
      <View style={[styles.txIcon, { backgroundColor: `${amountColor}18` }]}>
        {isIncome
          ? <TrendingUp size={18} color={amountColor} />
          : isExpense
          ? <TrendingDown size={18} color={amountColor} />
          : <ArrowLeftRight size={18} color={amountColor} />
        }
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txType, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
          {typeOpt?.label ?? item.type}
        </Text>
        {item.note ? (
          <Text style={[styles.txNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
            {item.note}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.txAmount, { color: amountColor, fontFamily: 'JetBrainsMono-Regular' }]}>
        {prefix}{formatCurrency(item.amount, item.currency)}
      </Text>
    </Pressable>
  );
}

export default function TransaksiScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const { sections, loading, refreshing, refresh } = useTransactionList({
    period, typeFilter, search,
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={styles.loadingHeader}>
          <SkeletonCard height={44} />
          <SkeletonCard height={36} />
          <SkeletonCard height={36} />
        </View>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} height={64} style={styles.txSkeleton} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 12 }]}>
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Cari transaksi..." />
        </View>
        <ChipGroup options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        <ChipGroup options={TYPE_FILTER_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.bgPage }]}>
            <Text style={[styles.sectionHeaderText, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
              {formatRelativeDate(section.date)}
            </Text>
            <Text style={[styles.sectionTotal, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
              {formatCurrency(section.total)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada transaksi"
            subtitle="Tap tombol menu di bawah untuk mencatat transaksi baru."
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accentPrimary} />
        }
        stickySectionHeadersEnabled
        windowSize={10}
        maxToRenderPerBatch={15}
        initialNumToRender={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingHeader: { padding: 16, gap: 12 },
  txSkeleton: { marginHorizontal: 16, marginBottom: 8 },
  headerArea: { gap: 8, paddingBottom: 8 },
  searchWrap: { paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: { fontSize: 13, lineHeight: 18 },
  sectionTotal: { fontSize: 12, lineHeight: 18 },
  listContent: { paddingHorizontal: 16, gap: 8 },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txType: { fontSize: 14, lineHeight: 20 },
  txNote: { fontSize: 12, lineHeight: 16 },
  txAmount: { fontSize: 15, lineHeight: 22 },
});
