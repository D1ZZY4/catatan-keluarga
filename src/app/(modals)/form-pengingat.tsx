import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import type { ReminderPeriod } from '@/shared/types';

const DUE_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const PERIOD_OPTIONS: { value: ReminderPeriod; label: string }[] = [
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'mingguan', label: 'Mingguan' },
];
const NOTIFY_OPTIONS = [
  { label: 'H-1', value: 1 },
  { label: 'H-3', value: 3 },
  { label: 'H-7', value: 7 },
];
const CATEGORY_OPTIONS = [
  'Listrik', 'Air', 'Internet', 'Telepon', 'Sewa', 'Asuransi', 'Kartu Kredit', 'Lainnya',
];

export default function FormPengingatScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(1);
  const [period, setPeriod] = useState<ReminderPeriod>('bulanan');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0] ?? 'Lainnya');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 0;

  async function handleSave() {
    if (!isValid) return;
    setLoading(true);
    try {
      await database.write(async () => {
        await database.get('reminders').create((record: import('@/shared/db').ReminderModel) => {
          record.name = name.trim();
          if (amount) record.amount = parseFloat(amount);
          record.currency = 'IDR';
          record.dueDay = dueDay;
          record.period = period;
          record.category = category;
          record.notifyDaysBefore = notifyDaysBefore;
          record.isActive = isActive;
          // @ts-expect-error WatermelonDB sets created_at
          record._raw.created_at = Date.now();
        });
      });
      showToast('Pengingat berhasil ditambahkan', 'success');
      router.back();
    } catch {
      showToast('Gagal menyimpan pengingat', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Tambah Pengingat" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nama Tagihan */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Tagihan</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth. Listrik PLN, Cicilan Motor..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={50}
            accessibilityLabel="Nama pengingat tagihan"
          />
        </View>

        {/* Nominal (opsional) */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nominal (opsional)</Text>
          <TextInput
            value={amount}
            onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'JetBrainsMono-Regular' }]}
            accessibilityLabel="Nominal tagihan"
          />
        </View>

        {/* Kategori */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Kategori</Text>
          <View style={styles.chipGrid}>
            {CATEGORY_OPTIONS.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.chip,
                  { backgroundColor: category === cat ? colors.accentPrimary : colors.bgSurface },
                ]}
                accessibilityLabel={cat}
              >
                <Text style={[styles.chipLabel, { color: category === cat ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tanggal Jatuh Tempo */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Tanggal Jatuh Tempo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dayRow}>
              {DUE_DAYS.map(d => (
                <Pressable
                  key={d}
                  onPress={() => setDueDay(d)}
                  style={[
                    styles.dayChip,
                    { backgroundColor: dueDay === d ? colors.accentPrimary : colors.bgSurface },
                  ]}
                  accessibilityLabel={`Tanggal ${d}`}
                >
                  <Text style={[styles.dayLabel, { color: dueDay === d ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
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
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Ingatkan sebelum</Text>
          <View style={styles.notifyRow}>
            {NOTIFY_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => setNotifyDaysBefore(opt.value)}
                style={[
                  styles.chip,
                  { backgroundColor: notifyDaysBefore === opt.value ? colors.warning + 'CC' : colors.bgSurface },
                ]}
                accessibilityLabel={opt.label}
              >
                <Text style={[styles.chipLabel, { color: notifyDaysBefore === opt.value ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Aktif */}
        <View style={[styles.activeRow, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.activeLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>Aktifkan pengingat</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.bgSurface, true: colors.accentPrimary }}
            thumbColor={colors.white}
          />
        </View>

        <Button
          label="Simpan Pengingat"
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
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, lineHeight: 22 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipLabel: { fontSize: 13, lineHeight: 18 },
  dayRow: { flexDirection: 'row', gap: 8 },
  dayChip: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayLabel: { fontSize: 12, lineHeight: 16 },
  periodRow: { flexDirection: 'row', gap: 8 },
  periodChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  notifyRow: { flexDirection: 'row', gap: 8 },
  activeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14 },
  activeLabel: { fontSize: 15, lineHeight: 22 },
});
