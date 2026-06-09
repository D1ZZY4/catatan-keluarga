import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { Globe, Calendar, Moon, Sun, Check } from 'lucide-react-native';
import { useSettings } from '@/features/settings/useSettings';

const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD', 'SAR', 'CNY'];
const DATE_FORMATS = [
  { label: 'dd/MM/yyyy', example: '09/06/2026' },
  { label: 'MM/dd/yyyy', example: '06/09/2026' },
  { label: 'yyyy-MM-dd', example: '2026-06-09' },
  { label: 'dd MMM yyyy', example: '09 Jun 2026' },
];

export default function TampilanScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { values, loading, set } = useSettings(['primary_currency', 'date_format']);
  const [currency, setCurrency] = useState('IDR');
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setCurrency(values.primary_currency ?? 'IDR');
      setDateFormat(values.date_format ?? 'dd/MM/yyyy');
    }
  }, [loading, values]);

  async function handleSave() {
    setSaving(true);
    try {
      await set('primary_currency', currency);
      await set('date_format', dateFormat);
      showToast('Pengaturan tampilan disimpan', 'success');
    } catch {
      showToast('Gagal menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Tampilan" showBack />
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.accentPrimary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Tampilan" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Info */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            {isDark
              ? <Moon size={20} color={colors.accentPrimary} />
              : <Sun size={20} color={colors.accentWarm} />}
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Tema Saat Ini
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {isDark ? 'Mode Gelap — mengikuti sistem' : 'Mode Terang — mengikuti sistem'}
              </Text>
            </View>
            <View style={[styles.themeBadge, { backgroundColor: isDark ? colors.bgSurface : `${colors.accentWarm}22` }]}>
              <Text style={[styles.themeBadgeText, { color: isDark ? colors.textMuted : colors.accentWarm, fontFamily: 'DMSans-Medium' }]}>
                {isDark ? '🌙 Gelap' : '☀️ Terang'}
              </Text>
            </View>
          </View>
          <Text style={[styles.themeNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Tema mengikuti pengaturan sistem perangkat Anda secara otomatis.
          </Text>
        </View>

        {/* Currency */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={colors.accentPrimary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Mata Uang Utama
            </Text>
          </View>
          <View style={styles.chipGrid}>
            {CURRENCIES.map(c => (
              <Pressable
                key={c}
                onPress={() => setCurrency(c)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: currency === c ? colors.accentPrimary : colors.bgSurface,
                    borderWidth: currency === c ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}
                accessibilityLabel={`Pilih mata uang ${c}`}
              >
                {currency === c && <Check size={11} color={colors.white} strokeWidth={3} />}
                <Text style={[
                  styles.chipLabel,
                  { color: currency === c ? colors.white : colors.textMuted, fontFamily: 'DMSans-Medium' },
                ]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Date Format */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={colors.accentPrimary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Format Tanggal
            </Text>
          </View>
          {DATE_FORMATS.map(fmt => (
            <Pressable
              key={fmt.label}
              onPress={() => setDateFormat(fmt.label)}
              style={[styles.radioRow, { borderColor: colors.border }]}
              accessibilityLabel={`Format tanggal ${fmt.label}`}
            >
              <View style={[
                styles.radio,
                { borderColor: dateFormat === fmt.label ? colors.accentPrimary : colors.border },
              ]}>
                {dateFormat === fmt.label && (
                  <View style={[styles.radioInner, { backgroundColor: colors.accentPrimary }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.radioLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
                  {fmt.label}
                </Text>
                <Text style={[styles.radioExample, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
                  {fmt.example}
                </Text>
              </View>
              {dateFormat === fmt.label && (
                <Check size={16} color={colors.accentPrimary} strokeWidth={2.5} />
              )}
            </Pressable>
          ))}
        </View>

        <Button
          label="Simpan Pengaturan"
          onPress={() => void handleSave()}
          loading={saving}
          disabled={saving}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16 },
  section: { padding: 16, borderRadius: 14, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  sectionSubtitle: { fontSize: 12, lineHeight: 16 },
  themeNote: { fontSize: 13, lineHeight: 18 },
  themeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  themeBadgeText: { fontSize: 12, lineHeight: 16 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  chipLabel: { fontSize: 13, lineHeight: 18 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 15, lineHeight: 22 },
  radioExample: { fontSize: 11, lineHeight: 16 },
});
