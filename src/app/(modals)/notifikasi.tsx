import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { Bell, DollarSign, Calendar } from 'lucide-react-native';
import { useSettings } from '@/features/settings/useSettings';

export default function NotifikasiScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { values, loading, set } = useSettings(['budget_alert', 'bill_reminder', 'weekly_report']);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [billReminders, setBillReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setBudgetAlerts(values.budget_alert !== 'false');
      setBillReminders(values.bill_reminder !== 'false');
      setWeeklyReport(values.weekly_report === 'true');
    }
  }, [loading, values]);

  async function handleSave() {
    setSaving(true);
    try {
      await set('budget_alert', String(budgetAlerts));
      await set('bill_reminder', String(billReminders));
      await set('weekly_report', String(weeklyReport));
      showToast('Pengaturan notifikasi disimpan', 'success');
    } catch {
      showToast('Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Notifikasi" showBack />
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.accentPrimary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Notifikasi" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: `${colors.accentPrimary}14` }]}>
          <Bell size={16} color={colors.accentPrimary} />
          <Text style={[styles.infoBannerText, { color: colors.accentPrimary, fontFamily: 'DMSans-Regular' }]}>
            Notifikasi akan dikirim jika izin diberikan di pengaturan sistem.
          </Text>
        </View>

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
  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  infoBannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  section: { padding: 16, borderRadius: 14, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, lineHeight: 22 },
  rowSubtitle: { fontSize: 12, lineHeight: 16 },
});
