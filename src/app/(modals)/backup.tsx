import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { database, WalletModel, TransactionModel, CategoryModel } from '@/shared/db';
import { Download, Upload, Info, FileText } from 'lucide-react-native';
import { formatDate } from '@/shared/utils/formatters';

type RawModelRecord = Record<string, unknown>;

async function buildBackupJson(): Promise<string> {
  const [wallets, transactions, categories, budgets, reminders, settings] = await Promise.all([
    database.get<WalletModel>('wallets').query().fetch(),
    database.get<TransactionModel>('transactions').query().fetch(),
    database.get<CategoryModel>('categories').query().fetch(),
    database.get('budgets').query().fetch(),
    database.get('reminders').query().fetch(),
    database.get('settings').query().fetch(),
  ]);
  const toRaw = (m: { _raw: RawModelRecord }) => m._raw;
  const backup = {
    version: '1.0.0',
    createdAt: Date.now(),
    wallets: (wallets as Array<{ _raw: RawModelRecord }>).map(toRaw),
    transactions: (transactions as Array<{ _raw: RawModelRecord }>).map(toRaw),
    categories: (categories as Array<{ _raw: RawModelRecord }>).map(toRaw),
    budgets: (budgets as Array<{ _raw: RawModelRecord }>).map(toRaw),
    reminders: (reminders as Array<{ _raw: RawModelRecord }>).map(toRaw),
    settings: (settings as Array<{ _raw: RawModelRecord }>).map(toRaw),
  };
  return JSON.stringify(backup, null, 2);
}

async function buildCsvString(): Promise<string> {
  const [transactions, wallets, categories] = await Promise.all([
    database.get<TransactionModel>('transactions').query().fetch(),
    database.get<WalletModel>('wallets').query().fetch(),
    database.get<CategoryModel>('categories').query().fetch(),
  ]);

  const walletMap = new Map<string, string>(wallets.map(w => [w.id, w.name]));
  const categoryMap = new Map<string, string>(categories.map(c => [c.id, c.name]));

  const header = 'Tanggal,Tipe,Dompet,Kategori,Nominal,Mata Uang,Catatan\n';
  const rows = transactions.map(t => {
    const date = formatDate(t.date);
    const wallet = walletMap.get(t.walletId) ?? '';
    const category = categoryMap.get(t.categoryId) ?? '';
    const note = (t.note ?? '').replace(/,/g, ';');
    return `"${date}","${t.type}","${wallet}","${category}",${t.amount},"${t.currency}","${note}"`;
  });
  return header + rows.join('\n');
}

export default function BackupScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await buildBackupJson();
      const { Paths, File: EFile } = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const filename = `catkeu-backup-${new Date().toISOString().split('T')[0]}.catkeu`;
      const file = new EFile(Paths.document, filename);
      file.write(json);
      const canShare = await Sharing.default.isAvailableAsync();
      if (canShare) {
        await Sharing.default.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan file backup',
        });
      }
      showToast('Backup berhasil dibuat', 'success');
    } catch {
      showToast('Gagal mengekspor data', 'error');
    } finally {
      setExporting(false);
    }
  }

  async function handleExportCsv() {
    setExportingCsv(true);
    try {
      const csv = await buildCsvString();
      const { Paths, File: EFile } = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const filename = `catkeu-transaksi-${new Date().toISOString().split('T')[0]}.csv`;
      const file = new EFile(Paths.document, filename);
      file.write(csv);
      const canShare = await Sharing.default.isAvailableAsync();
      if (canShare) {
        await Sharing.default.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Simpan file CSV',
        });
      }
      showToast('CSV berhasil diekspor', 'success');
    } catch {
      showToast('Gagal mengekspor CSV', 'error');
    } finally {
      setExportingCsv(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    try {
      const DocumentPicker = await import('expo-document-picker');
      const { File: EFile } = await import('expo-file-system');
      const result = await DocumentPicker.default.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        setImporting(false);
        return;
      }
      const uri = result.assets[0].uri;
      const text = await new EFile(uri).text();

      type RawRecord = Record<string, unknown> & { id: string };
      type BackupFile = {
        version?: string;
        wallets?: RawRecord[];
        transactions?: RawRecord[];
        categories?: RawRecord[];
        budgets?: RawRecord[];
        reminders?: RawRecord[];
        settings?: RawRecord[];
      };

      const data = JSON.parse(text) as BackupFile;
      if (!data.version || !data.wallets) {
        showToast('Format file tidak valid', 'error');
        return;
      }

      const tables: Array<{ name: string; rows: RawRecord[] }> = [
        { name: 'wallets', rows: data.wallets ?? [] },
        { name: 'transactions', rows: data.transactions ?? [] },
        { name: 'categories', rows: data.categories ?? [] },
        { name: 'budgets', rows: data.budgets ?? [] },
        { name: 'reminders', rows: data.reminders ?? [] },
        { name: 'settings', rows: data.settings ?? [] },
      ];

      await database.write(async () => {
        for (const table of tables) {
          const collection = database.get(table.name);
          const existing = await collection.query().fetch();
          const deleteOps = existing.map(r => r.prepareDestroyPermanently());
          const createOps = table.rows.map(raw =>
            collection.prepareCreate((record) => {
              (record as { _raw: RawRecord })._raw = { ...raw };
            })
          );
          await database.batch(...deleteOps, ...createOps);
        }
      });

      showToast('Data berhasil dipulihkan', 'success');
    } catch {
      showToast('File tidak dapat dibaca atau rusak', 'error');
    } finally {
      setImporting(false);
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

        {/* Export Full Backup */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <Download size={20} color={colors.success} />
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Ekspor Data (.catkeu)
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Simpan semua data ke file backup lengkap
              </Text>
            </View>
          </View>
          <Button
            label={exporting ? 'Mengekspor...' : 'Ekspor Backup'}
            onPress={() => void handleExport()}
            loading={exporting}
            disabled={exporting}
            fullWidth
          />
        </View>

        {/* Export CSV */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={colors.accentPrimary} />
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Ekspor Transaksi (.csv)
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Buka di Excel, Google Sheets, dsb.
              </Text>
            </View>
          </View>
          <Button
            label={exportingCsv ? 'Mengekspor...' : 'Ekspor CSV'}
            onPress={() => void handleExportCsv()}
            loading={exportingCsv}
            disabled={exportingCsv}
            variant="secondary"
            fullWidth
          />
        </View>

        {/* Import */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <Upload size={20} color={colors.warning} />
            <View style={styles.sectionInfo}>
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
  sectionInfo: { flex: 1 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  subtitle: { fontSize: 12, lineHeight: 18 },
});
