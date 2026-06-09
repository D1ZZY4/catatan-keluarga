import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { evaluate } from 'mathjs';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import {
  TYPE_OPTIONS, requiresPersonFields,
  type TransactionTypeOption,
} from '@/shared/constants/transactionTypes';
import { useWalletList } from '@/features/wallets/useWalletList';
import type { TransactionType } from '@/shared/types';

export default function FormTransaksiScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ type?: string }>();

  const [txType, setTxType] = useState<TransactionType>(
    (params.type as TransactionType) ?? 'expense'
  );
  const [amountStr, setAmountStr] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [personName, setPersonName] = useState('');
  const [date] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; type: string; color: string }>>([]);
  const amountRef = useRef<TextInput>(null);
  const { wallets } = useWalletList();

  useEffect(() => {
    void loadCategories();
    setTimeout(() => amountRef.current?.focus(), 400);
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0]?.id ?? '');
    }
  }, [wallets, walletId]);

  async function loadCategories() {
    try {
      const records = await database.get<import('@/shared/db').CategoryModel>('categories').query().fetch();
      setCategories(records.map(c => ({ id: c.id, name: c.name, type: c.type, color: c.color })));
    } catch {
      setCategories([]);
    }
  }

  function parseAmount(): number {
    try {
      const result = evaluate(amountStr.replace(/[Rp\s.]/g, '').replace(',', '.'));
      if (typeof result === 'number' && isFinite(result) && result > 0) return result;
      return 0;
    } catch {
      return parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    }
  }

  const filteredCategories = categories.filter(c => {
    if (['expense', 'transfer_external', 'debt_given', 'savings_deposit', 'invest_buy', 'debt_repay'].includes(txType)) {
      return c.type === 'expense';
    }
    return c.type === 'income';
  });

  const isValid = parseAmount() > 0 && walletId;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const amount = parseAmount();
      await database.write(async () => {
        await database.get('transactions').create((record: import('@/shared/db').TransactionModel) => {
          record.type = txType;
          record.walletId = walletId;
          if (toWalletId && txType === 'transfer_internal') record.toWalletId = toWalletId;
          record.categoryId = categoryId || (filteredCategories[0]?.id ?? '');
          record.amount = amount;
          record.currency = wallets.find(w => w.id === walletId)?.currency ?? 'IDR';
          if (note) record.note = note;
          if (personName) record.personName = personName;
          record.date = date;
          // @ts-expect-error WatermelonDB handles this
          record._raw.created_at = Date.now();
        });

        // Update wallet balance
        const walletRecord = await database.get('wallets').find(walletId) as import('@/shared/db').WalletModel;
        await walletRecord.update(() => {
          const isDeduction = ['expense', 'transfer_external', 'debt_given', 'savings_deposit', 'invest_buy', 'debt_repay'].includes(txType);
          walletRecord.balance = isDeduction ? walletRecord.balance - amount : walletRecord.balance + amount;
        });
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Transaksi berhasil disimpan', 'success');
      router.back();
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('Gagal menyimpan transaksi. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppBar title="Transaksi Baru" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tipe Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map(opt => (
              <Pressable
                key={opt.type}
                onPress={() => setTxType(opt.type)}
                style={[
                  styles.typeChip,
                  { backgroundColor: txType === opt.type ? colors.accentPrimary : colors.bgSurface },
                ]}
                accessibilityLabel={opt.label}
              >
                <Text style={[styles.typeLabel, { color: txType === opt.type ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Nominal */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nominal</Text>
          <TextInput
            ref={amountRef}
            value={amountStr}
            onChangeText={setAmountStr}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.amountInput, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'InstrumentSerif-Regular' }]}
            accessibilityLabel="Nominal transaksi"
          />
        </View>

        {/* Dompet */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
            {txType === 'transfer_internal' ? 'Dari Dompet' : 'Dompet'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {wallets.filter(w => !w.isArchived).map(w => (
                <Pressable
                  key={w.id}
                  onPress={() => setWalletId(w.id)}
                  style={[
                    styles.walletChip,
                    { backgroundColor: walletId === w.id ? w.color : colors.bgSurface, borderColor: w.color, borderWidth: 1 },
                  ]}
                  accessibilityLabel={`Pilih dompet ${w.name}`}
                >
                  <Text style={[styles.chipLabel, { color: walletId === w.id ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    {w.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Dompet Tujuan (untuk transfer) */}
        {txType === 'transfer_internal' && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Ke Dompet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {wallets.filter(w => !w.isArchived && w.id !== walletId).map(w => (
                  <Pressable
                    key={w.id}
                    onPress={() => setToWalletId(w.id)}
                    style={[
                      styles.walletChip,
                      { backgroundColor: toWalletId === w.id ? w.color : colors.bgSurface, borderColor: w.color, borderWidth: 1 },
                    ]}
                    accessibilityLabel={`Pilih dompet tujuan ${w.name}`}
                  >
                    <Text style={[styles.chipLabel, { color: toWalletId === w.id ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                      {w.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Kategori */}
        {filteredCategories.length > 0 && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Kategori</Text>
            <View style={styles.catGrid}>
              {filteredCategories.map(cat => (
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
                  <Text style={[styles.catLabel, { color: categoryId === cat.id ? cat.color : colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Nama Orang (untuk hutang/piutang) */}
        {requiresPersonFields(txType) && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Orang</Text>
            <TextInput
              value={personName}
              onChangeText={setPersonName}
              placeholder="Nama..."
              placeholderTextColor={colors.textPlaceholder}
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
              maxLength={50}
              accessibilityLabel="Nama orang terkait"
            />
          </View>
        )}

        {/* Catatan */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Catatan (opsional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Tambahkan catatan..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={200}
            multiline
            numberOfLines={2}
            accessibilityLabel="Catatan transaksi"
          />
        </View>

        <Button
          label="Simpan Transaksi"
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!isValid || loading}
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  typeScroll: { marginHorizontal: -16 },
  typeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  typeLabel: { fontSize: 13, lineHeight: 18 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  amountInput: {
    height: 64,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'right',
  },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, lineHeight: 22 },
  chipRow: { flexDirection: 'row', gap: 8 },
  walletChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipLabel: { fontSize: 13, lineHeight: 18 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, maxWidth: '48%' },
  catLabel: { fontSize: 12, lineHeight: 18 },
  saveBtn: { marginTop: 8 },
});
