import React from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Repeat2, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { Badge } from '@/shared/components/Badge';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import type { RecurringTransactionModel } from '@/shared/db';
import { formatCurrency } from '@/shared/utils/formatters';
import { getTypeOption } from '@/shared/constants/transactionTypes';
import { useRecurringList } from '@/features/recurring/useRecurringList';

type FreqLabel = 'harian' | 'mingguan' | 'bulanan';

const FREQ_LABEL: Record<FreqLabel, string> = {
  harian: 'Harian',
  mingguan: 'Mingguan',
  bulanan: 'Bulanan',
};

export default function BerulangScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { items, loading } = useRecurringList();

  async function handleToggle(id: string, current: boolean) {
    try {
      await database.write(async () => {
        const record = await database.get<RecurringTransactionModel>('recurring_transactions').find(id);
        await record.update((r: RecurringTransactionModel) => {
          r.isActive = !current;
        });
      });
    } catch {
      showToast('Gagal memperbarui status', 'error');
    }
  }

  async function handleDelete(id: string) {
    Alert.alert('Hapus Transaksi Berulang?', 'Jadwal otomatis ini akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await database.write(async () => {
              const record = await database.get<RecurringTransactionModel>('recurring_transactions').find(id);
              await (record as { destroyPermanently: () => Promise<void> }).destroyPermanently();
            });
            showToast('Jadwal berhasil dihapus', 'success');
          } catch {
            showToast('Gagal menghapus', 'error');
          }
        },
      },
    ]);
  }

  function formatDueDate(ts: number): string {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(ts));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title="Transaksi Berulang"
        showBack
        rightAction={
          <Pressable
            onPress={() => router.push('/(modals)/form-berulang')}
            style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}
            accessibilityLabel="Tambah transaksi berulang"
          >
            <Plus size={18} color="#fff" />
          </Pressable>
        }
      />
      {loading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3].map(k => <SkeletonCard key={k} height={120} />)}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi berulang"
          subtitle="Buat jadwal otomatis untuk transaksi yang sering terjadi"
          ctaLabel="Tambah Jadwal"
          onCta={() => router.push('/(modals)/form-berulang')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={({ item }) => {
            const typeOpt = getTypeOption(item.type);
            const freqLabel = FREQ_LABEL[item.frequency] ?? item.frequency;
            return (
              <View style={[styles.card, { backgroundColor: colors.bgCard }, shadows.sm]}>
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <Badge label={typeOpt?.label ?? item.type} variant="neutral" />
                    <Badge label={freqLabel} variant="neutral" />
                    {!item.isActive && <Badge label="Nonaktif" variant="warning" />}
                  </View>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => void handleToggle(item.id, item.isActive)}
                    trackColor={{ false: colors.border, true: `${colors.accentPrimary}60` }}
                    thumbColor={item.isActive ? colors.accentPrimary : colors.textPlaceholder}
                    accessibilityLabel={item.isActive ? 'Nonaktifkan jadwal' : 'Aktifkan jadwal'}
                  />
                </View>
                <Text style={[styles.amount, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
                  {formatCurrency(item.amount, item.currency)}
                </Text>
                {item.note ? (
                  <Text style={[styles.note, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                    {item.note}
                  </Text>
                ) : null}
                <View style={styles.cardBottom}>
                  <View style={styles.dueRow}>
                    <Repeat2 size={13} color={colors.textMuted} />
                    <Text style={[styles.dueText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                      Berikutnya: {formatDueDate(item.nextDueDate)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => void handleDelete(item.id)}
                    accessibilityLabel="Hapus transaksi berulang"
                    hitSlop={12}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            );
          }}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletons: { padding: 16, gap: 12 },
  list: { padding: 16 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  card: { borderRadius: 14, padding: 14, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 },
  amount: { fontSize: 22, lineHeight: 28 },
  note: { fontSize: 13, lineHeight: 18 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dueText: { fontSize: 12, lineHeight: 16 },
});
