import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Play, Trash2, FileText } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { Badge } from '@/shared/components/Badge';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import { formatCurrency } from '@/shared/utils/formatters';
import { getTypeOption } from '@/shared/constants/transactionTypes';

interface Template {
  id: string;
  label: string;
  type: string;
  categoryId: string;
  templateData: string;
}

interface ParsedTemplate {
  amount?: number;
  currency?: string;
  note?: string;
  walletId?: string;
}

export default function TemplatesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);

  async function load() {
    try {
      const records = await database.get<import('@/shared/db').TransactionTemplateModel>('transaction_templates').query().fetch();
      setTemplates(records.map(r => ({
        id: r.id, label: r.label, type: r.type, categoryId: r.categoryId, templateData: r.templateData,
      })));
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    Alert.alert('Hapus Template', 'Hapus template ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await database.write(async () => {
              const r = await database.get('transaction_templates').find(id);
              await (r as { destroyPermanently: () => Promise<void> }).destroyPermanently();
            });
            showToast('Template dihapus', 'info');
            void load();
          } catch { showToast('Gagal menghapus template', 'error'); }
        },
      },
    ]);
  }

  function handleUse(tmpl: Template) {
    let parsed: ParsedTemplate = {};
    try { parsed = JSON.parse(tmpl.templateData) as ParsedTemplate; } catch { /* empty */ }
    router.push({
      pathname: '/(modals)/form-transaksi',
      params: { type: tmpl.type, amount: String(parsed.amount ?? ''), note: parsed.note ?? '' },
    });
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Template Transaksi" showBack />
        <View style={styles.loadingArea}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} height={72} style={styles.gap} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title="Template Transaksi"
        showBack
        rightAction={
          <Pressable
            onPress={() => router.push('/(modals)/form-template')}
            style={[styles.addBtn, { backgroundColor: colors.accentPrimary }]}
            accessibilityLabel="Tambah template baru"
          >
            <Plus size={18} color={colors.white} />
          </Pressable>
        }
      />

      <FlatList
        data={templates}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          let parsed: ParsedTemplate = {};
          try { parsed = JSON.parse(item.templateData) as ParsedTemplate; } catch { /* empty */ }
          const typeOpt = getTypeOption(item.type as import('@/shared/types').TransactionType);
          return (
            <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
              <FileText size={20} color={colors.accentPrimary} />
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                  {item.label}
                </Text>
                <View style={styles.cardMeta}>
                  <Badge label={typeOpt?.label ?? item.type} variant="neutral" />
                  {parsed.amount ? (
                    <Text style={[styles.cardAmt, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
                      {formatCurrency(parsed.amount, parsed.currency ?? 'IDR')}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Pressable
                onPress={() => handleUse(item)}
                style={[styles.actionBtn, { backgroundColor: `${colors.success}18` }]}
                accessibilityLabel={`Gunakan template ${item.label}`}
              >
                <Play size={14} color={colors.success} />
              </Pressable>
              <Pressable
                onPress={() => void handleDelete(item.id)}
                style={[styles.actionBtn, { backgroundColor: `${colors.danger}18` }]}
                accessibilityLabel={`Hapus template ${item.label}`}
              >
                <Trash2 size={14} color={colors.danger} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada template"
            subtitle="Simpan transaksi yang sering digunakan sebagai template."
            ctaLabel="Buat Template"
            onCta={() => router.push('/(modals)/form-template')}
          />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        windowSize={8}
        maxToRenderPerBatch={12}
        initialNumToRender={15}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingArea: { padding: 16 },
  gap: { marginBottom: 8 },
  addBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  separator: { height: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  cardInfo: { flex: 1, gap: 6 },
  cardLabel: { fontSize: 15, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardAmt: { fontSize: 13, lineHeight: 18 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
