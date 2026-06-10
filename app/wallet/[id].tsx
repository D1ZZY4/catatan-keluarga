/**
 * WalletDetail — halaman detail dompet dengan daftar transaksi dan statistik ringkas.
 * Route: /wallet/[id]
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAppData, computeWalletBalance } from '../../src/shared/context/AppDataContext';
import { TransactionListItem } from '../../src/shared/components/TransactionListItem';
import { TransactionForm } from '../../src/features/transactions/TransactionForm';
import { WalletForm } from '../../src/features/wallets/WalletForm';
import { DynamicIcon } from '../../src/shared/components/DynamicIcon';
import { formatCurrency } from '../../src/shared/utils/format';
import { INCOME_TYPES, EXPENSE_TYPES } from '../../src/shared/constants/transactionTypes';

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();
  const { wallets, transactions, categories, removeWallet } = useAppData();

  const [editOpen, setEditOpen] = useState(false);
  const [txFormOpen, setTxFormOpen] = useState(false);

  const wallet = wallets.find((w) => w.id === id);
  const walletTxs = useMemo(
    () =>
      transactions
        .filter((t) => t.walletId === id || t.toWalletId === id)
        .sort((a, b) => b.date - a.date),
    [transactions, id],
  );

  const balance = useMemo(() => {
    if (!wallet) return 0;
    return computeWalletBalance(wallet, transactions);
  }, [wallet, transactions]);

  const monthIncome = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return walletTxs
      .filter((t) => t.date >= startOfMonth.getTime() && INCOME_TYPES.includes(t.type))
      .reduce((s, t) => s + t.amount, 0);
  }, [walletTxs]);

  const monthExpense = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return walletTxs
      .filter((t) => t.date >= startOfMonth.getTime() && EXPENSE_TYPES.includes(t.type))
      .reduce((s, t) => s + t.amount, 0);
  }, [walletTxs]);

  if (!wallet) {
    return (
      <View style={[s.screen, { backgroundColor: c.bgPage, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={c.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.emptyText, { color: c.textMuted }]}>Dompet tidak ditemukan</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Hapus Dompet',
      `Yakin hapus dompet "${wallet.name}"? Semua transaksi terkait akan tetap ada.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await removeWallet(wallet.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: c.bgPage }]}>
      {/* Header */}
      <View
        style={[
          s.header,
          { backgroundColor: wallet.color, paddingTop: insets.top + 8 },
        ]}
      >
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerActions}>
            <TouchableOpacity onPress={() => setEditOpen(true)} style={s.actionBtn}>
              <Edit2 size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={s.actionBtn}>
              <Trash2 size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet info */}
        <View style={s.walletInfo}>
          <View style={s.walletIconBox}>
            <DynamicIcon name={wallet.icon} size={28} color="#fff" />
          </View>
          <Text style={s.walletName}>{wallet.name}</Text>
          <Text style={s.walletBalance}>
            {formatCurrency(balance, wallet.currency)}
          </Text>
          <Text style={s.walletType}>{wallet.type.toUpperCase()}</Text>
        </View>

        {/* Month stats */}
        <View style={s.monthStats}>
          <View style={s.monthStat}>
            <TrendingUp size={14} color="rgba(255,255,255,0.8)" />
            <View>
              <Text style={s.monthStatLabel}>Pemasukan Bulan Ini</Text>
              <Text style={s.monthStatValue}>{formatCurrency(monthIncome, wallet.currency)}</Text>
            </View>
          </View>
          <View style={[s.monthStatDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={s.monthStat}>
            <TrendingDown size={14} color="rgba(255,255,255,0.8)" />
            <View>
              <Text style={s.monthStatLabel}>Pengeluaran Bulan Ini</Text>
              <Text style={s.monthStatValue}>{formatCurrency(monthExpense, wallet.currency)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Transaction list */}
      <FlatList
        data={walletTxs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        ListHeaderComponent={
          <Text style={[s.listHeader, { color: c.textMuted }]}>
            {walletTxs.length} Transaksi
          </Text>
        }
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={[s.emptyText, { color: c.textMuted }]}>
              Belum ada transaksi untuk dompet ini
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <TransactionListItem
              transaction={item}
              category={categories.find((c) => c.id === item.categoryId)}
              onClick={() => {}}
            />
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setTxFormOpen(true)}
        style={[s.fab, { backgroundColor: wallet.color }]}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* Forms */}
      <TransactionForm
        isOpen={txFormOpen}
        onClose={() => setTxFormOpen(false)}
        prefill={{ date: Date.now() }}
      />
      <WalletForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editWallet={wallet}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  walletInfo: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  walletIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'DM-Sans-Bold',
  },
  walletBalance: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'Instrument-Serif',
    letterSpacing: -1,
  },
  walletType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: 1.2,
  },
  monthStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  monthStat: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  monthStatDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  monthStatLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontFamily: 'DM-Sans',
  },
  monthStatValue: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'DM-Sans-SemiBold',
  },
  listHeader: {
    fontSize: 12,
    fontFamily: 'DM-Sans-SemiBold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'DM-Sans',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'DM-Sans-Bold',
    lineHeight: 32,
  },
});
