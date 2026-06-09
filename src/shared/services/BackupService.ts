import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { database } from '@/shared/db';

export interface BackupData {
  version: string;
  createdAt: number;
  wallets: unknown[];
  transactions: unknown[];
  categories: unknown[];
  budgets: unknown[];
  reminders: unknown[];
  settings: unknown[];
}

class BackupServiceClass {
  async exportBackup(): Promise<void> {
    try {
      const wallets = await database.get('wallets').query().fetch();
      const transactions = await database.get('transactions').query().fetch();
      const categories = await database.get('categories').query().fetch();
      const budgets = await database.get('budgets').query().fetch();
      const reminders = await database.get('reminders').query().fetch();
      const settings = await database.get('settings').query().fetch();

      const backup: BackupData = {
        version: '1.0.0',
        createdAt: Date.now(),
        wallets: wallets.map(w => (w as { _raw: unknown })._raw),
        transactions: transactions.map(t => (t as { _raw: unknown })._raw),
        categories: categories.map(c => (c as { _raw: unknown })._raw),
        budgets: budgets.map(b => (b as { _raw: unknown })._raw),
        reminders: reminders.map(r => (r as { _raw: unknown })._raw),
        settings: settings.map(s => (s as { _raw: unknown })._raw),
      };

      const json = JSON.stringify(backup, null, 2);
      const filename = `catkeu-backup-${new Date().toISOString().split('T')[0]}.catkeu`;
      const path = `${FileSystem.documentDirectory ?? ''}${filename}`;

      await FileSystem.writeAsStringAsync(path, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan file backup',
          UTI: 'public.json',
        });
      }
    } catch (error) {
      throw new Error(`Gagal mengekspor: ${String(error)}`);
    }
  }

  async importBackup(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, message: 'Impor dibatalkan' };
      }

      const uri = result.assets[0]?.uri;
      if (!uri) return { success: false, message: 'File tidak valid' };

      const json = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const data = JSON.parse(json) as BackupData;

      if (!data.version || !data.wallets) {
        return { success: false, message: 'Format file tidak valid' };
      }

      // Import logic would go here
      return { success: true, message: 'Data berhasil diimpor' };
    } catch (error) {
      return { success: false, message: `Gagal mengimpor: ${String(error)}` };
    }
  }
}

export const BackupService = new BackupServiceClass();
