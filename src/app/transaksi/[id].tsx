import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import { formatCurrency, formatRelativeDate } from '@/shared/utils/formatters';
import { isIncomeType, isExpenseType, getTypeOption } from '@/shared/constants/transactionTypes';
import type { Transaction, TransactionType } from '@/shared/types';
import { Trash2, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react-native';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [walletName, setWalletName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, [id]);

  async function load() {
    if (!id) return;
    try {
      const record = await database.get<import('@/shared/db').TransactionModel>('transactions').find(id);
      setTx({
        id: record.id,
        type: record.type as TransactionType,
        walletId: record.walletId,
        ...(record.toWalletId ? { toWalletId: record.toWalletId } : {}),
        categoryId: record.categoryId,
        amount: record.amount,
        currency: record.currency,
        ...(record.note ? { note: record.note } : {}),
        ...(record.personName ? { personName: record.personName } : {}),
        date: record.date,
        createdAt: record.createdAt.getTime(),
      });

      const wallet = await database.get<import('@/shared/db').WalletModel>('wallets').find(record.walletId).catch(() => null);
      if (wallet) setWalletName(wallet.name);

      if (record.categoryId) {
        const cat = await database.get<import('@/shared/db').CategoryModel>('categories').find(record.categoryId).catch(() => null);
        if (cat) setCategoryName(cat.name);
      }
    } catch {
      showToast('Transaksi tidak ditemukan', 'error');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!tx) return;
    Alert.alert(
      'Hapus Transaksi?',
      'Tindakan ini tidak dapat dibatalkan. Saldo dompet akan dikembalikan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                // Kembalikan saldo dompet sebelum menghapus transaksi
                const wallet = await database.get<import('@/shared/db').WalletModel>('wallets').find(tx.walletId).catch(() => null);
                if (wallet) {
                  const reversedBal = isExpenseType(tx.type)
                    ? wallet.balance + tx.amount
                    : isIncomeType(tx.type)
                      ? wallet.balance - tx.amount
                      : wallet.balance;
                  await wallet.update((w: import('@/shared/db').WalletModel) => {
                    w.balance = reversedBal;
                  });
                }
                // Untuk transfer internal, kurangi saldo dompet tujuan
                if (tx.type === 'transfer_internal' && tx.toWalletId) {
                  const toWallet = await database.get<import('@/shared/db').WalletModel>('wallets').find(tx.toWalletId).catch(() => null);
                  if (toWallet) {
                    const toReversedBal = toWallet.balance - tx.amount;
                    await toWallet.update((w: import('@/shared/db').WalletModel) => {
                      w.balance = toReversedBal;
                    });
                  }
                }
                const record = await database.get('transactions').find(tx.id);
                await (record as { destroyPermanently: () => Promise<void> }).destroyPermanently();
              });
              showToast('Transaksi dihapus', 'info');
              router.back();
            } catch {
              showToast('Gagal menghapus', 'error');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Detail Transaksi" showBack />
        <View style={styles.pad}>
          <SkeletonCard height={120} />
          <SkeletonCard height={80} style={styles.gap} />
          <SkeletonCard height={80} style={styles.gap} />
        </View>
      </View>
    );
  }

  if (!tx) return null;

  const isIncome = isIncomeType(tx.type);
  const isExpense = isExpenseType(tx.type);
  const typeOpt = getTypeOption(tx.type);
  const amountColor = isIncome ? colors.success : isExpense ? colors.danger : colors.accentPrimary;
  const prefix = isIncome ? '+' : isExpense ? '-' : '';

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title="Detail Transaksi"
        showBack
        rightAction={
          <Pressable
            onPress={() => void handleDelete()}
            style={styles.deleteBtn}
            accessibilityLabel="Hapus transaksi"
          >
            <Trash2 size={20} color={colors.danger} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Card */}
        <View style={[styles.amountCard, { backgroundColor: `${amountColor}18` }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${amountColor}22` }]}>
            {isIncome
              ? <TrendingUp size={32} color={amountColor} />
              : isExpense
              ? <TrendingDown size={32} color={amountColor} />
              : <ArrowLeftRight size={32} color={amountColor} />
            }
          </View>
          <Text style={[styles.txTypeName, { color: amountColor, fontFamily: 'DMSans-SemiBold' }]}>
            {typeOpt?.label ?? tx.type}
          </Text>
          <Text style={[styles.txAmount, { color: amountColor, fontFamily: 'InstrumentSerif-Regular' }]}>
            {prefix}{formatCurrency(tx.amount, tx.currency)}
          </Text>
          <Text style={[styles.txDate, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            {formatRelativeDate(tx.date)}
          </Text>
        </View>

        {/* Detail Rows */}
        <View style={[styles.detailCard, { backgroundColor: colors.bgCard }]}>
          {[
            { label: 'Dompet', value: walletName || '-' },
            { label: 'Kategori', value: categoryName || '-' },
            ...(tx.personName ? [{ label: 'Nama', value: tx.personName }] : []),
            ...(tx.note ? [{ label: 'Catatan', value: tx.note }] : []),
            { label: 'Mata Uang', value: tx.currency },
          ].map((row, i) => (
            <View
              key={row.label}
              style={[
                styles.detailRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
              ]}
            >
              <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {row.label}
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pad: { padding: 16 },
  gap: { marginTop: 10 },
  content: { padding: 16, gap: 16 },
  amountCard: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  txTypeName: { fontSize: 16, lineHeight: 22 },
  txAmount: { fontSize: 36, lineHeight: 44 },
  txDate: { fontSize: 13, lineHeight: 18 },
  detailCard: { borderRadius: 14, padding: 16, gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  detailLabel: { fontSize: 13, lineHeight: 20 },
  detailValue: { fontSize: 14, lineHeight: 20, textAlign: 'right', flex: 1 },
  deleteBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
