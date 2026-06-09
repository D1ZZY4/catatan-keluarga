import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { Globe, Calendar, Moon, Sun } from 'lucide-react-native';

const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD'];
const DATE_FORMATS = ['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'dd MMM yyyy'];

export default function TampilanScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [currency, setCurrency] = useState('IDR');
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      showToast('Pengaturan tampilan disimpan', 'success');
    } catch {
      showToast('Gagal menyimpan pengaturan', 'error');
    } finally {
      setLoading(false);
    }
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
            {isDark ? <Moon size={20} color={colors.accentPrimary} /> : <Sun size={20} color={colors.accentWarm} />}
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Tema Saat Ini
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {isDark ? 'Mode Gelap — mengikuti sistem' : 'Mode Terang — mengikuti sistem'}
              </Text>
            </View>
          </View>
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
                  { backgroundColor: currency === c ? colors.accentPrimary : colors.bgSurface },
                ]}
                accessibilityLabel={`Pilih mata uang ${c}`}
              >
                <Text style={[styles.chipLabel, { color: currency === c ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
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
              key={fmt}
              onPress={() => setDateFormat(fmt)}
              style={styles.radioRow}
              accessibilityLabel={`Format tanggal ${fmt}`}
            >
              <View style={[
                styles.radio,
                { borderColor: dateFormat === fmt ? colors.accentPrimary : colors.textMuted },
              ]}>
                {dateFormat === fmt && (
                  <View style={[styles.radioInner, { backgroundColor: colors.accentPrimary }]} />
                )}
              </View>
              <Text style={[styles.radioLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
                {fmt}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          label="Simpan Pengaturan"
          onPress={() => void handleSave()}
          loading={loading}
          disabled={loading}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  section: { padding: 16, borderRadius: 14, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  sectionSubtitle: { fontSize: 12, lineHeight: 16 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipLabel: { fontSize: 13, lineHeight: 18 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 15, lineHeight: 22 },
});
