import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { WalletCard } from '@/shared/components/WalletCard';
import { formatCurrency } from '@/shared/utils/formatters';
import { Plus, ChevronRight, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWalletList } from '@/features/wallets/useWalletList';

export default function DompetScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets, loading, refreshing, refresh } = useWalletList();
  const [showArchived, setShowArchived] = useState(false);

  const activeWallets = useMemo(() => wallets.filter(w => !w.isArchived), [wallets]);
  const archivedWallets = useMemo(() => wallets.filter(w => w.isArchived), [wallets]);
  const netWorth = useMemo(() => activeWallets.reduce((sum, w) => sum + w.balance, 0), [activeWallets]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={{ padding: 16, gap: 12 }}>
          <SkeletonCard height={56} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><SkeletonCard height={140} /></View>
            <View style={{ flex: 1 }}><SkeletonCard height={140} /></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><SkeletonCard height={140} /></View>
            <View style={{ flex: 1 }}><SkeletonCard height={140} /></View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accentPrimary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Net Worth Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.bgCard }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.netWorthLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>SALDO BERSIH</Text>
            <Text style={[styles.netWorth, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
              {formatCurrency(netWorth, 'IDR')}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(modals)/form-dompet')}
            style={[styles.addBtn, { backgroundColor: colors.accentPrimary }, shadows.sm]}
            accessibilityLabel="Tambah dompet baru"
          >
            <Plus size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
        {/* ── Active Wallets Grid ── */}
        {activeWallets.length === 0 ? (
          <EmptyState
            title="Belum ada dompet"
            subtitle="Tambahkan dompet pertamamu untuk mulai mencatat keuangan."
            ctaLabel="+ Tambah Dompet"
            onCta={() => router.push('/(modals)/form-dompet')}
          />
        ) : (
          <View style={styles.grid}>
            {activeWallets.map(wallet => (
              <View key={wallet.id} style={styles.gridItem}>
                <WalletCard
                  wallet={wallet}
                  onPress={() => router.push(`/dompet/${wallet.id}`)}
                />
              </View>
            ))}
          </View>
        )}

        {/* ── Archived Section ── */}
        {archivedWallets.length > 0 && (
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => setShowArchived(v => !v)}
              style={styles.archivedToggle}
            >
              {showArchived
                ? <ChevronDown size={14} color={colors.textMuted} />
                : <ChevronRight size={14} color={colors.textMuted} />
              }
              <Text style={[styles.archivedLabel, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
                Dompet Diarsipkan ({archivedWallets.length})
              </Text>
            </Pressable>

            {showArchived && (
              <View style={styles.grid}>
                {archivedWallets.map(wallet => (
                  <View key={wallet.id} style={[styles.gridItem, { opacity: 0.6 }]}>
                    <WalletCard
                      wallet={wallet}
                      onPress={() => router.push(`/dompet/${wallet.id}`)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netWorthLabel: { fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  netWorth: { fontSize: 30, lineHeight: 38 },
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%' },
  archivedToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  archivedLabel: { fontSize: 14 },
});
