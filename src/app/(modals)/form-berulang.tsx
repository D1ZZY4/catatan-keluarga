import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { DatePicker } from '@/shared/components/DatePicker';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import { TYPE_OPTIONS, isExpenseType } from '@/shared/constants/transactionTypes';
import { useWalletList } from '@/features/wallets/useWalletList';
import { DynamicIcon } from '@/shared/components/DynamicIcon';
import type { TransactionType } from '@/shared/types';
import type { CategoryModel } from '@/shared/db';

type FreqOption = { value: 'harian' | 'mingguan' | 'bulanan'; label: string };

const FREQ_OPTIONS: FreqOption[] = [
  { value: 'harian', label: 'Harian' },
  { value: 'mingguan', label: 'Mingguan' },
  { value: 'bulanan', label: 'Bulanan' },
];

export default function FormBerulangScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { wallets } = useWalletList();

  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [amountNum, setAmountNum] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [startDate, setStartDate] = useState(new Date());
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: string; type: string; color: string }>>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { void loadCategories(); }, []);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0]?.id ?? '');
    }
  }, [wallets, walletId]);

  async function loadCategories() {
    try {
      const records = await database.get<CategoryModel>('categories').query().fetch();
      setCategories(records.map(c => ({ id: c.id, name: c.name, icon: c.icon, type: c.type, color: c.color })));
    } catch { setCategories([]); }
  }

  const filteredCategories = categories.filter(c => {
    if (isExpenseType(txType)) return c.type === 'expense' || c.type === 'both';
    return c.type === 'income' || c.type === 'both';
  });

  useEffect(() => {
    if (categoryId && filteredCategories.some(c => c.id === categoryId)) return;
    setCategoryId(filteredCategories[0]?.id ?? '');
  }, [txType, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!amountNum || !walletId) return;
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const templateData = JSON.stringify({
        type: txType,
        walletId,
        categoryId,
        amount: amountNum,
        currency: 'IDR',
        note: note.trim() || undefined,
        date: startDate.getTime(),
      });
      await database.write(async () => {
        await database.get<import('@/shared/db').RecurringTransactionModel>('recurring_transactions').create((r) => {
          r.type = txType;
          r.templateData = templateData;
          r.frequency = frequency;
          r.nextDueDate = startDate.getTime();
          r.isActive = true;
          // @ts-expect-error WatermelonDB _raw pattern
          r._raw.created_at = Date.now();
        });
      });
      showToast('Jadwal berulang berhasil dibuat', 'success');
      router.back();
    } catch {
      showToast('Gagal menyimpan jadwal', 'error');
    } finally {
      setLoading(false);
    }
  }

  const isValid = amountNum > 0 && walletId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Transaksi Berulang Baru" showBack />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Jenis Transaksi */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
            JENIS TRANSAKSI
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {TYPE_OPTIONS.map(opt => {
              const active = txType === opt.type;
              return (
                <Pressable
                  key={opt.type}
                  onPress={() => setTxType(opt.type)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? colors.accentPrimary : colors.bgCard, borderColor: active ? colors.accentPrimary : colors.border, borderWidth: 1 },
                  ]}
                  accessibilityLabel={opt.label}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Nominal */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
            NOMINAL
          </Text>
          <CurrencyInput
            value={amountStr}
            onChangeText={(raw, numeric) => { setAmountStr(raw); setAmountNum(numeric); }}
          />

          {/* Frekuensi */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
            FREKUENSI
          </Text>
          <View style={styles.freqRow}>
            {FREQ_OPTIONS.map(opt => {
              const active = frequency === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setFrequency(opt.value)}
                  style={[
                    styles.freqChip,
                    { backgroundColor: active ? colors.accentPrimary : colors.bgCard, borderColor: active ? colors.accentPrimary : colors.border, borderWidth: 1, flex: 1 },
                  ]}
                  accessibilityLabel={opt.label}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dompet */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
            DOMPET
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {wallets.filter(w => !w.isArchived).map(w => {
              const active = walletId === w.id;
              return (
                <Pressable
                  key={w.id}
                  onPress={() => setWalletId(w.id)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? colors.accentPrimary : colors.bgCard, borderColor: active ? colors.accentPrimary : colors.border, borderWidth: 1 },
                  ]}
                  accessibilityLabel={w.name}
                >
                  <DynamicIcon name={w.icon} size={14} color={active ? '#fff' : colors.textMuted} />
                  <Text style={[styles.chipText, { color: active ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
                    {w.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Kategori */}
          {filteredCategories.length > 0 && (
            <>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
                KATEGORI
              </Text>
              <View style={styles.categoryGrid}>
                {filteredCategories.map(c => {
                  const active = categoryId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      style={[
                        styles.catItem,
                        { backgroundColor: active ? `${c.color}20` : colors.bgCard, borderColor: active ? c.color : colors.border, borderWidth: 1 },
                      ]}
                      accessibilityLabel={c.name}
                    >
                      <DynamicIcon name={c.icon} size={20} color={active ? c.color : colors.textMuted} />
                      <Text style={[styles.catLabel, { color: active ? c.color : colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                        {c.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Catatan */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
            CATATAN (opsional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Misal: Gaji bulanan, listrik rumah..."
            placeholderTextColor={colors.textPlaceholder}
            style={[
              styles.noteInput,
              { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary, fontFamily: 'DMSans-Regular' },
            ]}
            multiline
            numberOfLines={2}
            maxLength={120}
            textAlignVertical="top"
            accessibilityLabel="Catatan transaksi berulang"
          />

          {/* Tanggal Mulai */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
            TANGGAL PERTAMA
          </Text>
          <DatePicker value={startDate} onChange={setStartDate} />

          <Button
            label="Simpan Jadwal"
            onPress={() => void handleSave()}
            loading={loading}
            disabled={!isValid || loading}
            fullWidth
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 10 },
  label: { fontSize: 11, letterSpacing: 0.8, marginTop: 6, marginBottom: 2 },
  chipRow: { flexGrow: 0, marginBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 13, lineHeight: 18 },
  freqRow: { flexDirection: 'row', gap: 8 },
  freqChip: { alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catItem: { width: '22%', alignItems: 'center', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4, gap: 4 },
  catLabel: { fontSize: 10, lineHeight: 14, textAlign: 'center' },
  noteInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14, lineHeight: 20, minHeight: 64 },
});
