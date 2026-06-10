import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Plus, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAppData, computeWalletBalance } from '../../src/shared/context/AppDataContext';
import { useAuth } from '../../src/shared/context/AuthContext';
import { NetWorthHero } from '../../src/features/home/NetWorthHero';
import { BudgetWidget } from '../../src/features/home/BudgetWidget';
import { ReminderWidget } from '../../src/features/home/ReminderWidget';
import { HealthScoreWidget } from '../../src/features/home/HealthScoreWidget';
import { GuidedHomeTour } from '../../src/features/home/GuidedHomeTour';
import { WalletCard } from '../../src/shared/components/WalletCard';
import { TransactionListItem } from '../../src/shared/components/TransactionListItem';
import { TransactionForm } from '../../src/features/transactions/TransactionForm';
import { WalletForm } from '../../src/features/wallets/WalletForm';
import { AppLabels } from '../../src/shared/config/labels';
import type { TransactionType } from '../../src/shared/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();
  const { wallets, transactions, categories, loading } = useAppData();
  const { userName } = useAuth();

  const [txFormOpen, setTxFormOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<TransactionType>('expense');
  const [walletFormOpen, setWalletFormOpen] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);

  const activeWallets = useMemo(() => wallets.filter((w) => !w.isArchived), [wallets]);

  const netWorth = useMemo(
    () => activeWallets.reduce((sum, w) => sum + computeWalletBalance(w, transactions), 0),
    [activeWallets, transactions],
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const monthlyIncome = useMemo(
    () =>
      transactions
        .filter((tx) => tx.date >= startOfMonth && ['income', 'debt_received', 'invest_sell'].includes(tx.type))
        .reduce((s, tx) => s + tx.amount, 0),
    [transactions, startOfMonth],
  );

  const monthlyExpense = useMemo(
    () =>
      transactions
        .filter((tx) => tx.date >= startOfMonth && ['expense', 'transfer_external', 'debt_given', 'invest_buy'].includes(tx.type))
        .reduce((s, tx) => s + tx.amount, 0),
    [transactions, startOfMonth],
  );

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  const openTxForm = (type: TransactionType = 'expense') => {
    setTxDefaultType(type);
    setTxFormOpen(true);
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: c.bgPage }]}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <NetWorthHero
          userName={userName ?? 'Pengguna'}
          netWorth={netWorth}
          monthlyIncome={monthlyIncome}
          monthlyExpense={monthlyExpense}
          onTourPress={() => setTourVisible(true)}
        />

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Aksi Cepat</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {[
              { label: 'Pengeluaran', type: 'expense', color: '#c62828' },
              { label: 'Pemasukan', type: 'income', color: '#2e7d32' },
              { label: 'Transfer', type: 'transfer_internal', color: '#1565c0' },
              { label: 'Hutang', type: 'debt_received', color: '#e65100' },
              { label: 'Piutang', type: 'debt_given', color: '#7b1fa2' },
            ].map((qa) => (
              <TouchableOpacity
                key={qa.type}
                onPress={() => openTxForm(qa.type as TransactionType)}
                style={[styles.qaBtn, { backgroundColor: `${qa.color}15`, borderColor: `${qa.color}25` }]}
              >
                <View style={[styles.qaIcon, { backgroundColor: `${qa.color}20` }]}>
                  <Plus size={16} color={qa.color} strokeWidth={2.5} />
                </View>
                <Text style={[styles.qaLabel, { color: qa.color }]}>{qa.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Wallets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Dompet Saya</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/wallets')}
              style={styles.seeAll}
            >
              <Text style={[styles.seeAllText, { color: c.textMuted }]}>Lihat semua</Text>
              <ChevronRight size={13} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              {[1, 2].map((i) => (
                <View key={i} style={[styles.walletSkeleton, { backgroundColor: c.bgCard }]} />
              ))}
            </View>
          ) : activeWallets.length === 0 ? (
            <TouchableOpacity
              onPress={() => setWalletFormOpen(true)}
              style={[styles.emptyCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
            >
              <View style={[styles.emptyIcon, { backgroundColor: c.bgSurface }]}>
                <Plus size={18} color={c.textMuted} />
              </View>
              <View>
                <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Tambah Dompet Pertama</Text>
                <Text style={[styles.emptyDesc, { color: c.textMuted }]}>Tunai, rekening, dompet digital</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
            >
              {activeWallets.slice(0, 6).map((w) => (
                <View key={w.id} style={{ width: 160 }}>
                  <WalletCard
                    wallet={w}
                    balance={computeWalletBalance(w, transactions)}
                    onClick={() => router.push(`/wallet/${w.id}` as any)}
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setWalletFormOpen(true)}
                style={[styles.addWalletCard, { borderColor: c.border }]}
              >
                <Plus size={16} color={c.textMuted} />
                <Text style={[styles.addWalletText, { color: c.textMuted }]}>Tambah</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Health Score */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Kesehatan Keuangan</Text>
          </View>
          <HealthScoreWidget />
        </View>

        {/* Budget widget */}
        <View style={styles.section}>
          <BudgetWidget />
        </View>

        {/* Reminder widget */}
        <View style={styles.section}>
          <ReminderWidget />
        </View>

        {/* Recent transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Transaksi Terbaru</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/transactions')}
              style={styles.seeAll}
            >
              <Text style={[styles.seeAllText, { color: c.textMuted }]}>Lihat semua</Text>
              <ChevronRight size={13} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={[styles.txList, { backgroundColor: c.bgCard }]}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.txSkeleton, { borderBottomColor: c.bgPage }]} />
              ))}
            </View>
          ) : recentTransactions.length === 0 ? (
            <TouchableOpacity
              onPress={() => openTxForm('expense')}
              style={[styles.emptyCard, { backgroundColor: c.bgCard, borderColor: c.border }]}
            >
              <View style={[styles.emptyIcon, { backgroundColor: c.bgSurface }]}>
                <TrendingDown size={18} color={c.textMuted} />
              </View>
              <View>
                <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Catat Transaksi Pertama</Text>
                <Text style={[styles.emptyDesc, { color: c.textMuted }]}>Tap untuk mulai mencatat pengeluaran</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.txList, { backgroundColor: c.bgCard }]}>
              {recentTransactions.map((tx) => {
                const cat = categories.find((cc) => cc.id === tx.categoryId);
                return (
                  <TransactionListItem
                    key={tx.id}
                    transaction={tx}
                    category={cat}
                    onClick={() => openTxForm(tx.type)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <TransactionForm
        isOpen={txFormOpen}
        onClose={() => setTxFormOpen(false)}
        defaultType={txDefaultType}
      />
      <WalletForm
        isOpen={walletFormOpen}
        onClose={() => setWalletFormOpen(false)}
      />
      <GuidedHomeTour
        visible={tourVisible}
        onClose={() => setTourVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontFamily: 'DM-Sans-SemiBold' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  loadingRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  walletSkeleton: { width: 160, height: 120, borderRadius: 20 },
  emptyCard: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 14, fontFamily: 'DM-Sans-SemiBold' },
  emptyDesc: { fontSize: 11, fontFamily: 'DM-Sans', marginTop: 2 },
  txList: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden' },
  txSkeleton: { height: 64, borderBottomWidth: 1 },
  addWalletCard: {
    width: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addWalletText: { fontSize: 10, fontFamily: 'DM-Sans-SemiBold' },
  qaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  qaIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
});
