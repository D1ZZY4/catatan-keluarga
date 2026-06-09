import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { useCategories } from '@/features/categories/useCategories';
import { database } from '@/shared/db';
import type { BudgetPeriod } from '@/shared/types';

const PERIOD_OPTIONS: { value: BudgetPeriod; label: string }[] = [
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'mingguan', label: 'Mingguan' },
];

export default function FormAnggaranScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { categories } = useCategories('expense');

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('bulanan');
  const [notifyAt, setNotifyAt] = useState(0.8);
  const [loading, setLoading] = useState(false);

  const isValid = categoryId && parseFloat(amount) > 0;

  const NOTIFY_OPTIONS = [
    { label: '70%', value: 0.7 },
    { label: '80%', value: 0.8 },
    { label: '90%', value: 0.9 },
    { label: '100%', value: 1.0 },
  ];

  async function handleSave() {
    if (!isValid) return;
    setLoading(true);
    try {
      await database.write(async () => {
        await database.get<import('@/shared/db').BudgetModel>('budgets').create((record) => {
          record.categoryId = categoryId;
          record.amount = parseFloat(amount);
          record.currency = 'IDR';
          record.period = period;
          record.notifyAt = notifyAt;
          // @ts-expect-error WatermelonDB sets created_at
          record._raw.created_at = Date.now();
        });
      });
      showToast('Anggaran berhasil ditambahkan', 'success');
      router.back();
    } catch {
      showToast('Gagal menyimpan anggaran', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Tambah Anggaran" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kategori */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Kategori</Text>
          <View style={styles.chipGrid}>
            {categories.map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: categoryId === cat.id ? `${cat.color}33` : colors.bgSurface,
                    borderColor: categoryId === cat.id ? cat.color : colors.border,
                    borderWidth: 1,
                  },
                ]}
                accessibilityLabel={`Pilih kategori ${cat.name}`}
              >
                <Text style={[styles.chipLabel, { color: categoryId === cat.id ? cat.color : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Batas Anggaran */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Batas Anggaran (IDR)</Text>
          <TextInput
            value={amount}
            onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.amountInput, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'InstrumentSerif-Regular' }]}
            accessibilityLabel="Batas anggaran"
          />
        </View>

        {/* Periode */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Periode</Text>
          <View style={styles.periodRow}>
            {PERIOD_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => setPeriod(opt.value)}
                style={[
                  styles.periodChip,
                  { backgroundColor: period === opt.value ? colors.accentPrimary : colors.bgSurface },
                ]}
                accessibilityLabel={opt.label}
              >
                <Text style={[styles.chipLabel, { color: period === opt.value ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notifikasi */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Beri tahu saat mencapai</Text>
          <View style={styles.notifyRow}>
            {NOTIFY_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => setNotifyAt(opt.value)}
                style={[
                  styles.notifyChip,
                  { backgroundColor: notifyAt === opt.value ? colors.warning + 'CC' : colors.bgSurface },
                ]}
                accessibilityLabel={`Notifikasi di ${opt.label}`}
              >
                <Text style={[styles.chipLabel, { color: notifyAt === opt.value ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          label="Simpan Anggaran"
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!isValid || loading}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  amountInput: { height: 64, borderRadius: 12, paddingHorizontal: 16, fontSize: 32, lineHeight: 40, textAlign: 'right' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipLabel: { fontSize: 13, lineHeight: 18 },
  periodRow: { flexDirection: 'row', gap: 8 },
  periodChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  notifyRow: { flexDirection: 'row', gap: 8 },
  notifyChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
});
