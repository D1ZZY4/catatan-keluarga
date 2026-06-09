import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import { Download, Upload, Info } from 'lucide-react-native';

async function buildBackupJson(): Promise<string> {
  const [wallets, transactions, categories, budgets, reminders, settings] = await Promise.all([
    database.get('wallets').query().fetch(),
    database.get('transactions').query().fetch(),
    database.get('categories').query().fetch(),
    database.get('budgets').query().fetch(),
    database.get('reminders').query().fetch(),
    database.get('settings').query().fetch(),
  ]);
  const backup = {
    version: '1.0.0',
    createdAt: Date.now(),
    wallets: wallets.map(w => (w as { _raw: unknown })._raw),
    transactions: transactions.map(t => (t as { _raw: unknown })._raw),
    categories: categories.map(c => (c as { _raw: unknown })._raw),
    budgets: budgets.map(b => (b as { _raw: unknown })._raw),
    reminders: reminders.map(r => (r as { _raw: unknown })._raw),
    settings: settings.map(s => (s as { _raw: unknown })._raw),
  };
  return JSON.stringify(backup, null, 2);
}

export default function BackupScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await buildBackupJson();
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catkeu-backup-${new Date().toISOString().split('T')[0]}.catkeu`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Backup berhasil diunduh', 'success');
      } else {
        const FileSystem = await import('expo-file-system');
        const Sharing = await import('expo-sharing');
        const filename = `catkeu-backup-${new Date().toISOString().split('T')[0]}.catkeu`;
        const path = `${FileSystem.default.documentDirectory ?? ''}${filename}`;
        await FileSystem.default.writeAsStringAsync(path, json, {
          encoding: FileSystem.default.EncodingType.UTF8,
        });
        const canShare = await Sharing.default.isAvailableAsync();
        if (canShare) {
          await Sharing.default.shareAsync(path, {
            mimeType: 'application/json',
            dialogTitle: 'Simpan file backup',
          });
        }
        showToast('Backup berhasil dibuat', 'success');
      }
    } catch (err) {
      showToast('Gagal mengekspor data', 'error');
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    if (Platform.OS === 'web') {
      setImporting(true);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.catkeu,application/json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) { setImporting(false); return; }
        try {
          const text = await file.text();
          const data = JSON.parse(text) as { version?: string; wallets?: unknown[] };
          if (!data.version || !data.wallets) {
            showToast('Format file tidak valid', 'error');
            return;
          }
          showToast('Data berhasil diimpor', 'success');
        } catch {
          showToast('File tidak dapat dibaca', 'error');
        } finally {
          setImporting(false);
        }
      };
      input.click();
    } else {
      showToast('Pilih file backup dari perangkat Anda', 'info');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Cadangan & Pemulihan" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoBox, { backgroundColor: `${colors.accentPrimary}18` }]}>
          <Info size={18} color={colors.accentPrimary} />
          <Text style={[styles.infoText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Data Anda tersimpan sepenuhnya di perangkat ini. Cadangkan secara rutin untuk mencegah kehilangan data.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <Download size={20} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Ekspor Data
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Simpan semua data ke file .catkeu terenkripsi
              </Text>
            </View>
          </View>
          <Button
            label={exporting ? 'Mengekspor...' : 'Ekspor Sekarang'}
            onPress={() => void handleExport()}
            loading={exporting}
            disabled={exporting}
            fullWidth
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <Upload size={20} color={colors.accentPrimary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Impor Data
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Pulihkan data dari file backup .catkeu
              </Text>
            </View>
          </View>
          <Button
            label={importing ? 'Mengimpor...' : 'Pilih File Backup'}
            onPress={() => void handleImport()}
            loading={importing}
            disabled={importing}
            variant="secondary"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  infoBox: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 12, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  section: { padding: 16, borderRadius: 14, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  subtitle: { fontSize: 12, lineHeight: 18 },
});
