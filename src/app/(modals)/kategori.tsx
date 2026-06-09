import React, { useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Pencil, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useToast } from '@/shared/components/Toast';
import { useCategories } from '@/features/categories/useCategories';
import { database } from '@/shared/db';
import type { Category } from '@/shared/types';

type TabType = 'expense' | 'income';

const TAB_OPTIONS = [
  { value: 'expense' as TabType, label: 'Pengeluaran' },
  { value: 'income' as TabType, label: 'Pemasukan' },
];

function CategoryItem({ cat, onEdit, onDelete }: { cat: Category; onEdit: () => void; onDelete: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.catRow, { backgroundColor: colors.bgCard }]}>
      <View style={[styles.catIcon, { backgroundColor: `${cat.color}22` }]}>
        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
      </View>
      <Text style={[styles.catName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]} numberOfLines={1}>
        {cat.name}
      </Text>
      {cat.isDefault && (
        <Text style={[styles.defaultBadge, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>bawaan</Text>
      )}
      <View style={styles.catActions}>
        <Pressable onPress={onEdit} style={[styles.actionBtn, { backgroundColor: colors.bgSurface }]} accessibilityLabel={`Edit kategori ${cat.name}`}>
          <Pencil size={14} color={colors.accentPrimary} />
        </Pressable>
        {!cat.isDefault && (
          <Pressable onPress={onDelete} style={[styles.actionBtn, { backgroundColor: colors.bgSurface }]} accessibilityLabel={`Hapus kategori ${cat.name}`}>
            <Trash2 size={14} color={colors.danger} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function KategoriScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabType>('expense');
  const { categories, loading, reload } = useCategories(tab);

  async function handleDelete(cat: Category) {
    Alert.alert(
      'Hapus Kategori',
      `Hapus kategori "${cat.name}"? Transaksi yang sudah ada akan tetap tersimpan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const record = await database.get('categories').find(cat.id);
                await (record as { destroyPermanently: () => Promise<void> }).destroyPermanently();
              });
              showToast('Kategori dihapus', 'info');
              void reload();
            } catch {
              showToast('Gagal menghapus kategori', 'error');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title="Kelola Kategori"
        showBack
        rightAction={
          <Pressable
            onPress={() => router.push({ pathname: '/(modals)/form-kategori', params: { type: tab } })}
            style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}
            accessibilityLabel="Tambah kategori baru"
          >
            <Plus size={18} color={colors.white} />
          </Pressable>
        }
      />

      <View style={styles.tabRow}>
        <ChipGroup options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} height={56} style={styles.gap} />)}
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CategoryItem
              cat={item}
              onEdit={() => router.push({ pathname: '/(modals)/form-kategori', params: { id: item.id, type: tab } })}
              onDelete={() => void handleDelete(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState title="Belum ada kategori" subtitle="Tambah kategori pengeluaran atau pemasukan." />
          }
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          windowSize={8}
          maxToRenderPerBatch={12}
          initialNumToRender={15}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { paddingHorizontal: 16, paddingVertical: 8 },
  loading: { padding: 16 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  separator: { height: 4 },
  gap: { marginBottom: 4 },
  addBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  catIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  catDot: { width: 12, height: 12, borderRadius: 6 },
  catName: { flex: 1, fontSize: 15, lineHeight: 22 },
  defaultBadge: { fontSize: 11, lineHeight: 16 },
  catActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
