import React, { useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { Card } from '@/shared/components/Card';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useRouter } from 'expo-router';
import { useHomeData } from '@/features/wallets/useHomeData';
import { formatCompact, formatCurrency } from '@/shared/utils/formatters';
import {
  TrendingUp, TrendingDown, Wallet, Plus, ScanLine,
  ArrowLeftRight, Heart, PiggyBank,
} from 'lucide-react-native';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color: string;
}

interface HealthFactor {
  label: string;
  score: number;
  hint: string;
}

function calcHealthScore(
  totalBalance: number,
  monthlyIncome: number,
  monthlyExpense: number
): { score: number; factors: HealthFactor[]; label: string; color: string } {
  const factors: HealthFactor[] = [];
  let total = 0;

  // Factor 1: Savings rate (0–40 pts)
  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpense) / monthlyIncome : 0;
  const savingsScore = Math.min(40, Math.max(0, savingsRate * 200));
  factors.push({
    label: 'Rasio Tabungan',
    score: savingsScore / 40,
    hint: `${(savingsRate * 100).toFixed(0)}% — target ≥ 20%`,
  });
  total += savingsScore;

  // Factor 2: Balance buffer (0–30 pts) — does user have ≥3 months expenses?
  const monthsBuffer = monthlyExpense > 0 ? totalBalance / monthlyExpense : 0;
  const bufferScore = Math.min(30, monthsBuffer * 10);
  factors.push({
    label: 'Dana Darurat',
    score: bufferScore / 30,
    hint: `${monthsBuffer.toFixed(1)}x pengeluaran — target ≥ 3x`,
  });
  total += bufferScore;

  // Factor 3: Cash flow positive (0–30 pts)
  const cfScore = monthlyIncome >= monthlyExpense ? 30 : Math.max(0, 30 * (monthlyIncome / Math.max(monthlyExpense, 1)));
  factors.push({
    label: 'Arus Kas',
    score: cfScore / 30,
    hint: monthlyIncome >= monthlyExpense ? 'Positif' : 'Negatif — pengeluaran melebihi pemasukan',
  });
  total += cfScore;

  const score = Math.round(total);
  const label = score >= 80 ? 'Sangat Baik' : score >= 60 ? 'Baik' : score >= 40 ? 'Cukup' : 'Perlu Perhatian';
  const color = score >= 80 ? '#4CAF50' : score >= 60 ? '#8BC34A' : score >= 40 ? '#FF9800' : '#F44336';

  return { score, factors, label, color };
}

export default function BerandaScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets, totalBalance, monthlyIncome, monthlyExpense, loading, refresh, refreshing } = useHomeData();

  const health = useMemo(
    () => calcHealthScore(totalBalance, monthlyIncome, monthlyExpense),
    [totalBalance, monthlyIncome, monthlyExpense]
  );

  const quickActions: QuickAction[] = [
    { icon: <Plus size={20} color="#fff" />, label: 'Catat', onPress: () => router.push('/(modals)/form-transaksi'), color: colors.accentPrimary },
    { icon: <ArrowLeftRight size={20} color="#fff" />, label: 'Transfer', onPress: () => router.push({ pathname: '/(modals)/form-transaksi', params: { type: 'transfer_internal' } }), color: colors.accentSecondary },
    { icon: <ScanLine size={20} color="#fff" />, label: 'Scan', onPress: () => router.push('/(modals)/scanner'), color: colors.success },
    { icon: <PiggyBank size={20} color="#fff" />, label: 'Dompet', onPress: () => router.push('/(modals)/form-dompet'), color: colors.accentWarm },
  ];

  const handleAddWallet = useCallback(() => {
    router.push('/(modals)/form-dompet');
  }, [router]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={styles.padding}>
          <SkeletonCard height={32} width="60%" />
          <SkeletonCard height={20} width="40%" style={styles.gap4} />
          <SkeletonCard height={120} style={styles.gap12} />
          <SkeletonCard height={80} style={styles.gap12} />
          <SkeletonCard height={80} style={styles.gap12} />
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

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map(qa => (
          <Pressable
            key={qa.label}
            onPress={qa.onPress}
            style={({ pressed }) => [styles.qaBtn, { backgroundColor: qa.color, opacity: pressed ? 0.85 : 1 }]}
            accessibilityLabel={qa.label}
          >
            {qa.icon}
            <Text style={[styles.qaLabel, { fontFamily: 'DMSans-Regular' }]}>{qa.label}</Text>
          </Pressable>
        ))}
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

      {/* Financial Health Score */}
      {(monthlyIncome > 0 || totalBalance > 0) && (
        <View style={[styles.healthCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.healthHeader}>
            <View style={styles.healthTitle}>
              <Heart size={18} color={health.color} fill={health.color} />
              <Text style={[styles.healthTitleText, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Skor Kesehatan Keuangan
              </Text>
            </View>
            <View style={[styles.healthScore, { backgroundColor: `${health.color}22` }]}>
              <Text style={[styles.healthScoreText, { color: health.color, fontFamily: 'JetBrainsMono-Regular' }]}>
                {health.score}
              </Text>
              <Text style={[styles.healthLabel, { color: health.color, fontFamily: 'DMSans-Medium' }]}>
                {health.label}
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={health.score / 100}
            showPercent={false}
            height={8}
            color={health.color}
          />
          {health.factors.map(f => (
            <View key={f.label} style={styles.factorRow}>
              <Text style={[styles.factorLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {f.label}
              </Text>
              <View style={styles.factorRight}>
                <ProgressBar
                  progress={f.score}
                  showPercent={false}
                  height={4}
                  color={f.score >= 0.7 ? colors.success : f.score >= 0.4 ? colors.warning : colors.danger}
                />
                <Text style={[styles.factorHint, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {f.hint}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Wallets */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
          Dompet Saya
        </Text>
        <Pressable
          onPress={handleAddWallet}
          style={[styles.addWalletBtn, { backgroundColor: colors.accentPrimary }]}
          accessibilityLabel="Tambah dompet baru"
        >
          <Plus size={14} color="#fff" />
        </Pressable>
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
                    {wallet.currency} · {wallet.type}
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
  content: { paddingHorizontal: 16, gap: 14 },
  padding: { padding: 16 },
  gap4: { marginTop: 4 },
  gap12: { marginTop: 12 },
  header: { gap: 4, paddingBottom: 4 },
  greeting: { fontSize: 14, lineHeight: 20 },
  netWorth: { fontSize: 40, lineHeight: 48 },
  netWorthLabel: { fontSize: 13, lineHeight: 18 },
  quickActions: { flexDirection: 'row', gap: 10 },
  qaBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  qaLabel: { fontSize: 12, lineHeight: 16, color: '#fff' },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, gap: 8 },
  summaryRow2: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { fontSize: 12, lineHeight: 16 },
  summaryAmount: { fontSize: 16, lineHeight: 22 },
  healthCard: { padding: 16, borderRadius: 16, gap: 12 },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  healthTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  healthTitleText: { fontSize: 15, lineHeight: 22 },
  healthScore: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 2 },
  healthScoreText: { fontSize: 24, lineHeight: 30 },
  healthLabel: { fontSize: 11, lineHeight: 14 },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  factorLabel: { width: 100, fontSize: 12, lineHeight: 18 },
  factorRight: { flex: 1, gap: 2 },
  factorHint: { fontSize: 10, lineHeight: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 18, lineHeight: 26 },
  addWalletBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  walletList: { gap: 10 },
  walletCard: { padding: 14 },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  walletInfo: { flex: 1 },
  walletName: { fontSize: 15, lineHeight: 22 },
  walletType: { fontSize: 12, lineHeight: 16 },
  walletBalance: { fontSize: 15, lineHeight: 22 },
});
