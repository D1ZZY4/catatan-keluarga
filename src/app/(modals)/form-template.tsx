import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { useToast } from '@/shared/components/Toast';
import { useWalletList } from '@/features/wallets/useWalletList';
import { database } from '@/shared/db';
import { TYPE_OPTIONS } from '@/shared/constants/transactionTypes';
import type { TransactionType } from '@/shared/types';

const TYPE_CHIP_OPTIONS = TYPE_OPTIONS.slice(0, 3).map(o => ({ value: o.type, label: o.label }));

export default function FormTemplateScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const [label, setLabel] = useState('');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [amountNum, setAmountNum] = useState(0);
  const [categoryId] = useState('');
  const [walletId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const { wallets } = useWalletList();

  async function handleSave() {
    if (!label.trim()) { showToast('Nama template tidak boleh kosong', 'error'); return; }
    setLoading(true);
    try {
      const templateData = JSON.stringify({ amount: amountNum, currency: wallets.find(w => w.id === walletId)?.currency ?? 'IDR', note, walletId, categoryId });
      await database.write(async () => {
        await database.get<import('@/shared/db').TransactionTemplateModel>('transaction_templates').create((r) => {
          r.label = label.trim();
          r.type = txType;
          r.categoryId = categoryId;
          r.templateData = templateData;
        });
      });
      showToast('Template berhasil disimpan', 'success');
      router.back();
    } catch { showToast('Gagal menyimpan template', 'error'); }
    finally { setLoading(false); }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Buat Template" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Template</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="cth. Beli makan siang, Bayar kos..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={50}
            autoFocus
            accessibilityLabel="Nama template"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Tipe Transaksi</Text>
          <ChipGroup options={TYPE_CHIP_OPTIONS} value={txType} onChange={v => setTxType(v as TransactionType)} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nominal Default (opsional)</Text>
          <CurrencyInput
            value={amountStr}
            onChangeText={(raw, num) => { setAmountStr(raw); setAmountNum(num); }}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Catatan (opsional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Tambahkan catatan..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={100}
            accessibilityLabel="Catatan template"
          />
        </View>

        <Button
          label="Simpan Template"
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!label.trim() || loading}
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
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, lineHeight: 24 },
});
