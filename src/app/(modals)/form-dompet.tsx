import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useRouter } from 'expo-router';
import { database } from '@/shared/db';
import { generateId } from '@/shared/utils/helpers';
import { useToast } from '@/shared/components/Toast';
import type { WalletType } from '@/shared/types';

const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'bank', label: 'Bank' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'savings', label: 'Tabungan' },
  { value: 'investment', label: 'Investasi' },
  { value: 'credit', label: 'Kredit' },
  { value: 'crypto', label: 'Kripto' },
  { value: 'other', label: 'Lainnya' },
];

const COLORS = ['#4CAF50', '#8CC0EB', '#F4A35A', '#EF5350', '#CE93D8', '#80DEEA', '#FFD54F', '#BCAAA4'];

export default function FormDompetScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [currency, setCurrency] = useState('IDR');
  const [color, setColor] = useState(COLORS[0] ?? '#4CAF50');
  const [initialBalance, setInitialBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await database.write(async () => {
        await database.get('wallets').create((record: import('@/shared/db').WalletModel) => {
          record.name = name.trim();
          record.icon = 'Wallet';
          record.color = color;
          record.currency = currency;
          record.balance = parseFloat(initialBalance) || 0;
          record.initialBalance = parseFloat(initialBalance) || 0;
          record.type = type;
          record.isArchived = false;
          record.showInDashboard = true;
          record.includeInTotal = true;
          record.sortOrder = Date.now();
          // @ts-expect-error WatermelonDB sets created_at automatically
          record._raw.created_at = Date.now();
        });
      });
      showToast('Dompet berhasil dibuat', 'success');
      router.back();
    } catch (err) {
      showToast('Gagal membuat dompet. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Buat Dompet Baru" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Nama */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Dompet</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth. Dompet Utama, BCA, GoPay..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={50}
            accessibilityLabel="Nama dompet"
          />
        </View>

        {/* Jenis */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Jenis Dompet</Text>
          <View style={styles.chipWrap}>
            {WALLET_TYPES.map(wt => (
              <Pressable
                key={wt.value}
                onPress={() => setType(wt.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: type === wt.value ? colors.accentPrimary : colors.bgSurface,
                    borderColor: type === wt.value ? colors.accentPrimary : colors.border,
                  },
                ]}
                accessibilityLabel={wt.label}
              >
                <Text style={[styles.chipLabel, { color: type === wt.value ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {wt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Mata Uang */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Mata Uang</Text>
          <TextInput
            value={currency}
            onChangeText={v => setCurrency(v.toUpperCase().slice(0, 3))}
            placeholder="IDR"
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'JetBrainsMono-Regular' }]}
            maxLength={3}
            autoCapitalize="characters"
            accessibilityLabel="Mata uang"
          />
        </View>

        {/* Saldo Awal */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Saldo Awal</Text>
          <TextInput
            value={initialBalance}
            onChangeText={setInitialBalance}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'JetBrainsMono-Regular' }]}
            accessibilityLabel="Saldo awal dompet"
          />
        </View>

        {/* Warna */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Warna</Text>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.textPrimary },
                ]}
                accessibilityLabel={`Pilih warna ${c}`}
              />
            ))}
          </View>
        </View>

        <Button
          label="Simpan Dompet"
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!isValid || loading}
          fullWidth
          style={styles.saveBtn}
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
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    lineHeight: 24,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 13, lineHeight: 18 },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  saveBtn: { marginTop: 8 },
});
