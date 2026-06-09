import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { Card } from '@/shared/components/Card';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { useRouter } from 'expo-router';
import { useHomeData } from '@/features/wallets/useHomeData';
import { formatCompact, formatCurrency } from '@/shared/utils/formatters';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';

export default function BerandaScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets, totalBalance, monthlyIncome, monthlyExpense, loading, refresh, refreshing } = useHomeData();

  const handleAddWallet = useCallback(() => {
    router.push('/(modals)/form-dompet');
  }, [router]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <SkeletonCard height={32} width="60%" />
          <SkeletonCard height={20} width="40%" />
        </View>
        <SkeletonCard height={120} style={styles.sectionGap} />
        <SkeletonCard height={80} style={styles.sectionGap} />
        <SkeletonCard height={80} style={styles.sectionGap} />
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.accentPrimary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Catatan Keuangan
        </Text>
        <Text style={[styles.netWorth, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
          {formatCompact(totalBalance)}
        </Text>
        <Text style={[styles.netWorthLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Total Saldo Bersih
        </Text>
      </View>

      {/* Monthly Summary */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow2}>
            <TrendingUp size={18} color={colors.success} />
            <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Pemasukan
            </Text>
          </View>
          <Text style={[styles.summaryAmount, { color: colors.success, fontFamily: 'JetBrainsMono-Regular' }]}>
            {formatCompact(monthlyIncome)}
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow2}>
            <TrendingDown size={18} color={colors.danger} />
            <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Pengeluaran
            </Text>
          </View>
          <Text style={[styles.summaryAmount, { color: colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
            {formatCompact(monthlyExpense)}
          </Text>
        </Card>
      </View>

      {/* Wallets */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
          Dompet Saya
        </Text>
      </View>

      {wallets.length === 0 ? (
        <EmptyState
          title="Belum ada dompet"
          subtitle="Buat dompet pertama untuk mulai mencatat keuangan."
          ctaLabel="Buat Dompet Dulu"
          onCta={handleAddWallet}
          icon={<Wallet size={48} color={colors.textMuted} />}
        />
      ) : (
        <View style={styles.walletList}>
          {wallets.map(wallet => (
            <Card
              key={wallet.id}
              style={[styles.walletCard, { borderLeftColor: wallet.color, borderLeftWidth: 4 }]}
              onPress={() => router.push(`/dompet/${wallet.id}`)}
            >
              <View style={styles.walletRow}>
                <View style={[styles.walletIcon, { backgroundColor: `${wallet.color}22` }]}>
                  <Wallet size={20} color={wallet.color} />
                </View>
                <View style={styles.walletInfo}>
                  <Text style={[styles.walletName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                    {wallet.name}
                  </Text>
                  <Text style={[styles.walletType, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    {wallet.currency}
                  </Text>
                </View>
                <Text style={[styles.walletBalance, { color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}>
                  {formatCurrency(wallet.balance, wallet.currency)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  header: { gap: 4, paddingBottom: 8 },
  greeting: { fontSize: 14, lineHeight: 20 },
  netWorth: { fontSize: 40, lineHeight: 48 },
  netWorthLabel: { fontSize: 13, lineHeight: 18 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, gap: 8 },
  summaryRow2: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { fontSize: 12, lineHeight: 16 },
  summaryAmount: { fontSize: 16, lineHeight: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionTitle: { fontSize: 18, lineHeight: 26 },
  walletList: { gap: 10 },
  walletCard: { padding: 14 },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  walletInfo: { flex: 1 },
  walletName: { fontSize: 15, lineHeight: 22 },
  walletType: { fontSize: 12, lineHeight: 16 },
  walletBalance: { fontSize: 15, lineHeight: 22 },
  sectionGap: { marginTop: 12 },
});
