import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useReminders } from '@/features/reminders/useReminders';
import { formatCurrency } from '@/shared/utils/formatters';
import { PlusCircle, Bell, BellOff } from 'lucide-react-native';
import { database } from '@/shared/db';
import { useToast } from '@/shared/components/Toast';

export default function TagihanScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { reminders, loading, reload } = useReminders();

  async function handleToggle(id: string, isActive: boolean) {
    try {
      await database.write(async () => {
        const r = await database.get<import('@/shared/db').ReminderModel>('reminders').find(id);
        await r.update((rec: import('@/shared/db').ReminderModel) => { rec.isActive = !isActive; });
      });
      void reload();
    } catch {
      showToast('Gagal memperbarui', 'error');
    }
  }

  async function handleDelete(id: string) {
    try {
      await database.write(async () => {
        const r = await database.get('reminders').find(id);
        await (r as { destroyPermanently: () => Promise<void> }).destroyPermanently();
      });
      showToast('Pengingat dihapus', 'info');
      void reload();
    } catch {
      showToast('Gagal menghapus', 'error');
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Tagihan & Pengingat" showBack />
        <View style={styles.pad}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} height={80} style={styles.gap} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title="Tagihan & Pengingat"
        showBack
        rightAction={
          <Pressable
            onPress={() => router.push('/(modals)/form-pengingat')}
            style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}
            accessibilityLabel="Tambah pengingat baru"
          >
            <PlusCircle size={20} color={colors.white} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {reminders.length === 0 ? (
          <EmptyState
            title="Belum ada tagihan"
            subtitle="Tambahkan pengingat untuk tagihan rutin agar tidak terlewat."
            ctaLabel="Tambah Pengingat"
            onCta={() => router.push('/(modals)/form-pengingat')}
            icon={<Bell size={48} color={colors.textMuted} />}
          />
        ) : (
          reminders.map(r => (
            <View
              key={r.id}
              style={[
                styles.reminderCard,
                { backgroundColor: colors.bgCard, opacity: r.isActive ? 1 : 0.6 },
              ]}
            >
              <View style={styles.reminderLeft}>
                <View style={[styles.iconWrap, { backgroundColor: r.isActive ? `${colors.accentPrimary}22` : colors.bgSurface }]}>
                  {r.isActive
                    ? <Bell size={20} color={colors.accentPrimary} />
                    : <BellOff size={20} color={colors.textMuted} />
                  }
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={[styles.reminderName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                    {r.name}
                  </Text>
                  <Text style={[styles.reminderMeta, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    Tgl {r.dueDay} • {r.period} • H-{r.notifyDaysBefore}
                  </Text>
                  {r.amount ? (
                    <Text style={[styles.reminderAmt, { color: colors.accentPrimary, fontFamily: 'JetBrainsMono-Regular' }]}>
                      {formatCurrency(r.amount)}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.reminderActions}>
                <Switch
                  value={r.isActive}
                  onValueChange={() => void handleToggle(r.id, r.isActive)}
                  trackColor={{ false: colors.bgSurface, true: colors.accentPrimary }}
                  thumbColor={colors.white}
                />
                <Pressable
                  onPress={() => void handleDelete(r.id)}
                  style={styles.deleteBtn}
                  accessibilityLabel="Hapus pengingat"
                >
                  <Text style={[styles.deleteLabel, { color: colors.danger, fontFamily: 'DMSans-Regular' }]}>
                    Hapus
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
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
  reminderCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, gap: 12 },
  reminderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reminderInfo: { flex: 1, gap: 2 },
  reminderName: { fontSize: 15, lineHeight: 22 },
  reminderMeta: { fontSize: 12, lineHeight: 16 },
  reminderAmt: { fontSize: 13, lineHeight: 18 },
  reminderActions: { alignItems: 'flex-end', gap: 6 },
  deleteBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  deleteLabel: { fontSize: 12, lineHeight: 16 },
});
