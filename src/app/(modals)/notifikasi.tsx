import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { Bell, DollarSign, Calendar } from 'lucide-react-native';

export default function NotifikasiScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [billReminders, setBillReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      showToast('Pengaturan notifikasi disimpan', 'success');
    } catch {
      showToast('Gagal menyimpan', 'error');
    } finally {
      setLoading(false);
    }
  }

  const rows = [
    {
      icon: <DollarSign size={20} color={colors.warning} />,
      label: 'Peringatan Anggaran',
      subtitle: 'Notifikasi ketika mendekati batas anggaran',
      value: budgetAlerts,
      onChange: setBudgetAlerts,
    },
    {
      icon: <Calendar size={20} color={colors.accentPrimary} />,
      label: 'Pengingat Tagihan',
      subtitle: 'Ingatkan tagihan berulang yang jatuh tempo',
      value: billReminders,
      onChange: setBillReminders,
    },
    {
      icon: <Bell size={20} color={colors.success} />,
      label: 'Laporan Mingguan',
      subtitle: 'Ringkasan pengeluaran setiap Minggu',
      value: weeklyReport,
      onChange: setWeeklyReport,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Notifikasi" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          {rows.map((row, i) => (
            <View key={row.label} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]}>
              <View style={[styles.iconWrap, { backgroundColor: colors.bgSurface }]}>{row.icon}</View>
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                  {row.label}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {row.subtitle}
                </Text>
              </View>
              <Switch
                value={row.value}
                onValueChange={row.onChange}
                trackColor={{ false: colors.bgSurface, true: colors.accentPrimary }}
                thumbColor={colors.white}
              />
            </View>
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
  section: { padding: 16, borderRadius: 14, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, lineHeight: 22 },
  rowSubtitle: { fontSize: 12, lineHeight: 16 },
});
