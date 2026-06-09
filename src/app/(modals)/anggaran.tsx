import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useBudgets } from '@/features/budgets/useBudgets';
import { formatCurrency } from '@/shared/utils/formatters';
import { PlusCircle, PiggyBank, AlertTriangle } from 'lucide-react-native';
import { database } from '@/shared/db';
import { useToast } from '@/shared/components/Toast';

export default function AnggaranScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { budgets, loading, reload } = useBudgets();

  async function handleDelete(id: string) {
    try {
      await database.write(async () => {
        const record = await database.get('budgets').find(id);
        await (record as { destroyPermanently: () => Promise<void> }).destroyPermanently();
      });
      showToast('Anggaran dihapus', 'info');
      void reload();
    } catch {
      showToast('Gagal menghapus', 'error');
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Anggaran" showBack />
        <View style={styles.pad}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} height={90} style={styles.gap} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title="Anggaran"
        showBack
        rightAction={
          <Pressable
            onPress={() => router.push('/(modals)/form-anggaran')}
            style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}
            accessibilityLabel="Tambah anggaran baru"
          >
            <PlusCircle size={20} color={colors.white} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {budgets.length === 0 ? (
          <EmptyState
            title="Belum ada anggaran"
            subtitle="Tetapkan batas anggaran per kategori untuk mengontrol pengeluaran Anda."
            ctaLabel="Tambah Anggaran"
            onCta={() => router.push('/(modals)/form-anggaran')}
            icon={<PiggyBank size={48} color={colors.textMuted} />}
          />
        ) : (
          budgets.map(b => {
            const isWarning = b.progress >= b.notifyAt;
            const isDanger = b.progress >= 1;
            const barColor = isDanger ? colors.danger : isWarning ? colors.warning : colors.success;

            return (
              <View key={b.id} style={[styles.budgetCard, { backgroundColor: colors.bgCard }]}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetLeft}>
                    {isWarning && <AlertTriangle size={16} color={isDanger ? colors.danger : colors.warning} />}
                    <Text style={[styles.catName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                      {b.categoryName}
                    </Text>
                    <View style={[styles.periodBadge, { backgroundColor: colors.bgSurface }]}>
                      <Text style={[styles.periodLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                        {b.period}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => void handleDelete(b.id)}
                    style={styles.deleteBtn}
                    accessibilityLabel="Hapus anggaran"
                  >
                    <Text style={[styles.deleteLabel, { color: colors.danger, fontFamily: 'DMSans-Regular' }]}>
                      Hapus
                    </Text>
                  </Pressable>
                </View>

                <View style={[styles.bar, { backgroundColor: colors.bgSurface }]}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: barColor, width: `${Math.min(100, Math.round(b.progress * 100))}%` as `${number}%` },
                    ]}
                  />
                </View>

                <View style={styles.budgetFooter}>
                  <Text style={[styles.spentLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    Terpakai: <Text style={[styles.spentAmt, { color: barColor, fontFamily: 'JetBrainsMono-Regular' }]}>{formatCurrency(b.spent)}</Text>
                  </Text>
                  <Text style={[styles.limitLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    Batas: <Text style={{ color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }}>{formatCurrency(b.amount)}</Text>
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pad: { padding: 16 },
  gap: { marginBottom: 10 },
  content: { padding: 16, gap: 12 },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  budgetCard: { borderRadius: 14, padding: 14, gap: 10 },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  catName: { fontSize: 15, lineHeight: 22 },
  periodBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  periodLabel: { fontSize: 11, lineHeight: 16 },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  deleteLabel: { fontSize: 13, lineHeight: 18 },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  spentLabel: { fontSize: 13, lineHeight: 18 },
  spentAmt: { fontSize: 13, lineHeight: 18 },
  limitLabel: { fontSize: 13, lineHeight: 18 },
});
