import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatCurrency, formatRelativeDate } from '@/shared/utils/formatters';
import { database } from '@/shared/db';
import type { Wallet, Transaction, TransactionType } from '@/shared/types';
import { isIncomeType, isExpenseType } from '@/shared/constants/transactionTypes';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { void load(); }, [id]);

  async function load(isRefresh = false) {
    if (!id) return;
    try {
      if (isRefresh) setRefreshing(true);
      const walletRecord = await database.get<import('@/shared/db').WalletModel>('wallets').find(id);
      setWallet({
        id: walletRecord.id,
        name: walletRecord.name,
        icon: walletRecord.icon,
        color: walletRecord.color,
        currency: walletRecord.currency,
        balance: walletRecord.balance,
        initialBalance: walletRecord.initialBalance,
        isArchived: walletRecord.isArchived,
        showInDashboard: walletRecord.showInDashboard,
        includeInTotal: walletRecord.includeInTotal,
        type: walletRecord.type as Wallet['type'],
        sortOrder: walletRecord.sortOrder,
        createdAt: walletRecord.createdAt.getTime(),
      });

      const txRecords = await database.get<import('@/shared/db').TransactionModel>('transactions').query().fetch();
      const filtered = txRecords
        .filter(tx => tx.walletId === id || tx.toWalletId === id)
        .sort((a, b) => b.date - a.date);

      setTransactions(filtered.map(tx => ({
        id: tx.id,
        type: tx.type as TransactionType,
        walletId: tx.walletId,
        ...(tx.toWalletId ? { toWalletId: tx.toWalletId } : {}),
        categoryId: tx.categoryId,
        amount: tx.amount,
        currency: tx.currency,
        ...(tx.note ? { note: tx.note } : {}),
        date: tx.date,
        createdAt: tx.createdAt.getTime(),
      })));
    } catch {
      setWallet(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Detail Dompet" showBack />
        <View style={styles.padding}>
          <SkeletonCard height={100} />
          <SkeletonCard height={64} style={styles.gap} />
          <SkeletonCard height={64} style={styles.gap} />
        </View>
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Detail Dompet" showBack />
        <EmptyState title="Dompet tidak ditemukan" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title={wallet.name} showBack />

      <View style={[styles.balanceCard, { backgroundColor: wallet.color, ...shadows.md }]}>
        <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.8)', fontFamily: 'DMSans-Regular' }]}>
          Saldo Saat Ini
        </Text>
        <Text style={[styles.balanceAmount, { color: colors.white, fontFamily: 'InstrumentSerif-Regular' }]}>
          {formatCurrency(wallet.balance, wallet.currency)}
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isIncome = isIncomeType(item.type);
          const amountColor = isIncome ? colors.success : colors.danger;
          return (
            <View style={[styles.txRow, { backgroundColor: colors.bgCard }]}>
              <View style={[styles.txIcon, { backgroundColor: `${amountColor}18` }]}>
                {isIncome
                  ? <TrendingUp size={18} color={amountColor} />
                  : <TrendingDown size={18} color={amountColor} />
                }
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txDate, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {formatRelativeDate(item.date)}
                </Text>
                {item.note ? (
                  <Text style={[styles.txNote, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]} numberOfLines={1}>
                    {item.note}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.txAmount, { color: amountColor, fontFamily: 'JetBrainsMono-Regular' }]}>
                {isIncome ? '+' : '-'}{formatCurrency(item.amount, item.currency)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState title="Belum ada transaksi" subtitle="Transaksi untuk dompet ini akan muncul di sini." />}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: insets.bottom + 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accentPrimary} />}
        showsVerticalScrollIndicator={false}
        windowSize={8}
        maxToRenderPerBatch={15}
        initialNumToRender={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: 16 },
  gap: { marginTop: 10 },
  balanceCard: { margin: 16, padding: 20, borderRadius: 16, gap: 6 },
  balanceLabel: { fontSize: 13, lineHeight: 18 },
  balanceAmount: { fontSize: 36, lineHeight: 44 },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDate: { fontSize: 11, lineHeight: 16 },
  txNote: { fontSize: 14, lineHeight: 20 },
  txAmount: { fontSize: 14, lineHeight: 20 },
});
