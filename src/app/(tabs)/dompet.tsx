import React from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { Badge } from '@/shared/components/Badge';
import { formatCurrency } from '@/shared/utils/formatters';
import { Plus, Wallet, Archive } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWalletList } from '@/features/wallets/useWalletList';
import type { Wallet as WalletType } from '@/shared/types';

const WALLET_TYPE_LABEL: Record<WalletType['type'], string> = {
  cash: 'Tunai',
  bank: 'Bank',
  'e-wallet': 'E-Wallet',
  investment: 'Investasi',
  savings: 'Tabungan',
  credit: 'Kredit',
  crypto: 'Kripto',
  other: 'Lainnya',
};

function WalletListItem({ wallet }: { wallet: WalletType }) {
  const { colors, shadows } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/dompet/${wallet.id}`)}
      style={({ pressed }) => [
        styles.walletCard,
        {
          backgroundColor: colors.bgCard,
          borderLeftColor: wallet.color,
          ...shadows.sm,
          ...(pressed ? { opacity: 0.9 } : {}),
        },
      ]}
      accessibilityLabel={`Buka dompet ${wallet.name}`}
    >
      <View style={[styles.walletIconWrap, { backgroundColor: `${wallet.color}22` }]}>
        <Wallet size={22} color={wallet.color} />
      </View>
      <View style={styles.walletInfo}>
        <View style={styles.walletRow}>
          <Text style={[styles.walletName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            {wallet.name}
          </Text>
          <Badge label={WALLET_TYPE_LABEL[wallet.type]} variant="neutral" />
        </View>
        <Text style={[styles.walletBalance, { color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}>
          {formatCurrency(wallet.balance, wallet.currency)}
        </Text>
      </View>
      {wallet.isArchived && <Archive size={16} color={colors.textMuted} />}
    </Pressable>
  );
}

export default function DompetScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets, loading, refreshing, refresh } = useWalletList();

  const activeWallets = wallets.filter(w => !w.isArchived);
  const archivedWallets = wallets.filter(w => w.isArchived);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={styles.padding}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height={72} style={styles.gap} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
          Dompet Saya
        </Text>
        <Pressable
          onPress={() => router.push('/(modals)/form-dompet')}
          style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}
          accessibilityLabel="Tambah dompet baru"
        >
          <Plus size={20} color={colors.white} />
        </Pressable>
      </View>

      <FlatList
        data={[...activeWallets, ...archivedWallets]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <WalletListItem wallet={item} />}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada dompet"
            subtitle="Buat dompet pertama Anda untuk mulai mencatat keuangan."
            ctaLabel="Buat Dompet Baru"
            onCta={() => router.push('/(modals)/form-dompet')}
            icon={<Wallet size={48} color={colors.textMuted} />}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accentPrimary} />
        }
        showsVerticalScrollIndicator={false}
        windowSize={8}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 24, lineHeight: 32 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, gap: 10, paddingTop: 8 },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 12,
  },
  walletIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  walletInfo: { flex: 1, gap: 4 },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletName: { fontSize: 16, lineHeight: 22 },
  walletBalance: { fontSize: 16, lineHeight: 22 },
  padding: { padding: 16 },
  gap: { marginBottom: 10 },
});
