import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, Pressable, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Trash2, Tag } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { useToast } from '@/shared/components/Toast';
import { useTags } from '@/features/tags/useTags';
import { database } from '@/shared/db';
import type { Tag as TagType } from '@/shared/types';

export default function TagsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { tags, loading, reload } = useTags();
  const [newTag, setNewTag] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    const name = newTag.trim();
    if (!name) return;
    setCreating(true);
    try {
      await database.write(async () => {
        await database.get<import('@/shared/db').TagModel>('tags').create((r) => {
          r.name = name;
        });
      });
      setNewTag('');
      showToast('Tag berhasil dibuat', 'success');
      void reload();
    } catch { showToast('Gagal membuat tag', 'error'); }
    finally { setCreating(false); }
  }

  async function handleDelete(tag: TagType) {
    Alert.alert('Hapus Tag', `Hapus tag "${tag.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await database.write(async () => {
              const r = await database.get('tags').find(tag.id);
              await (r as { destroyPermanently: () => Promise<void> }).destroyPermanently();
            });
            showToast('Tag dihapus', 'info');
            void reload();
          } catch { showToast('Gagal menghapus tag', 'error'); }
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Kelola Tag" showBack />

      <View style={[styles.createRow, { backgroundColor: colors.bgCard }]}>
        <Tag size={18} color={colors.accentPrimary} />
        <TextInput
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Nama tag baru..."
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.createInput, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}
          maxLength={30}
          onSubmitEditing={() => void handleCreate()}
          returnKeyType="done"
          accessibilityLabel="Nama tag baru"
        />
        <Pressable
          onPress={() => void handleCreate()}
          disabled={!newTag.trim() || creating}
          style={[styles.createBtn, { backgroundColor: colors.accentPrimary, opacity: !newTag.trim() ? 0.5 : 1 }]}
          accessibilityLabel="Tambah tag"
        >
          <Plus size={16} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={tags}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.tagRow, { backgroundColor: colors.bgCard }]}>
            <View style={[styles.tagPill, { backgroundColor: `${colors.accentPrimary}18` }]}>
              <Tag size={12} color={colors.accentPrimary} />
              <Text style={[styles.tagName, { color: colors.accentPrimary, fontFamily: 'DMSans-Medium' }]}>
                {item.name}
              </Text>
            </View>
            <Pressable
              onPress={() => void handleDelete(item)}
              style={[styles.deleteBtn, { backgroundColor: `${colors.danger}18` }]}
              accessibilityLabel={`Hapus tag ${item.name}`}
            >
              <Trash2 size={14} color={colors.danger} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              title="Belum ada tag"
              subtitle="Buat tag untuk mengelompokkan transaksi dengan mudah."
            />
          )
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        windowSize={8}
        maxToRenderPerBatch={15}
        initialNumToRender={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  createRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, padding: 12, borderRadius: 12,
  },
  createInput: { flex: 1, fontSize: 15, lineHeight: 22, paddingVertical: 4 },
  createBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  separator: { height: 6 },
  tagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12 },
  tagPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  tagName: { fontSize: 14, lineHeight: 20 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
