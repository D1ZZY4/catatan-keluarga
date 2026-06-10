/**
 * BackupService — export/import data sebagai file .artha terenkripsi.
 * Format: JSON → AES-GCM encrypt (device key) → base64 → .artha file
 * Checksum SHA-256 diverifikasi saat import.
 */

import { File as EASFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { database } from '../../shared/db/database';
import { WalletModel } from '../../shared/db/models/Wallet';
import { TransactionModel } from '../../shared/db/models/Transaction';
import { CategoryModel } from '../../shared/db/models/Category';
import { BudgetModel } from '../../shared/db/models/Budget';
import { ReminderModel } from '../../shared/db/models/Reminder';
import { e2e } from '../../shared/crypto/e2e';

const BACKUP_VERSION = 1;
const MIME = 'application/octet-stream';

interface BackupPayload {
  version: number;
  exportedAt: number;
  checksum: string;
  data: {
    wallets: unknown[];
    transactions: unknown[];
    categories: unknown[];
    budgets: unknown[];
    reminders: unknown[];
  };
}

async function sha256Base64(data: string): Promise<string> {
  const buf = new TextEncoder().encode(data);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

async function collectAllData() {
  const [wallets, transactions, categories, budgets, reminders] = await Promise.all([
    database.collections.get<WalletModel>('wallets').query().fetch(),
    database.collections.get<TransactionModel>('transactions').query().fetch(),
    database.collections.get<CategoryModel>('categories').query().fetch(),
    database.collections.get<BudgetModel>('budgets').query().fetch(),
    database.collections.get<ReminderModel>('reminders').query().fetch(),
  ]);
  return {
    wallets: wallets.map((m) => ({ ...m._raw })),
    transactions: transactions.map((m) => ({ ...m._raw })),
    categories: categories.map((m) => ({ ...m._raw })),
    budgets: budgets.map((m) => ({ ...m._raw })),
    reminders: reminders.map((m) => ({ ...m._raw })),
  };
}

export const BackupService = {
  /**
   * Export semua data ke file .artha terenkripsi dan buka share sheet.
   */
  async exportBackup(): Promise<void> {
    const data = await collectAllData();
    const dataJson = JSON.stringify(data);
    const checksum = await sha256Base64(dataJson);

    const payload: BackupPayload = {
      version: BACKUP_VERSION,
      exportedAt: Date.now(),
      checksum,
      data,
    };

    const payloadJson = JSON.stringify(payload);
    const encrypted = await e2e.encrypt(payloadJson);

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `catat-artha-${dateStr}.artha`;
    const file = new EASFile(Paths.cache, filename);
    file.write(encrypted);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: MIME,
        dialogTitle: 'Simpan Backup Catat Artha',
        UTI: 'public.data',
      });
    }
  },

  /**
   * Import backup dari file .artha.
   * Return { success, message, counts }.
   */
  async importBackup(): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, message: 'Import dibatalkan' };
      }

      const file = result.assets[0];
      if (!file) return { success: false, message: 'File tidak valid' };

      const easFile = new EASFile(file.uri);
      const encrypted = await easFile.text();

      let payloadJson: string;
      try {
        payloadJson = await e2e.decrypt<string>(encrypted);
      } catch {
        return { success: false, message: 'File tidak bisa didekripsi. Pastikan ini file .artha yang valid.' };
      }

      const payload = JSON.parse(payloadJson) as BackupPayload;

      if (!payload.version || !payload.data) {
        return { success: false, message: 'Format backup tidak valid.' };
      }

      // Verifikasi checksum
      const dataJson = JSON.stringify(payload.data);
      const checksum = await sha256Base64(dataJson);
      if (checksum !== payload.checksum) {
        return { success: false, message: 'Checksum tidak cocok. File mungkin rusak.' };
      }

      // Restore data
      await restoreData(payload.data);

      return {
        success: true,
        message: 'Backup berhasil dipulihkan!',
        counts: {
          wallets: payload.data.wallets.length,
          transactions: payload.data.transactions.length,
          categories: payload.data.categories.length,
          budgets: payload.data.budgets.length,
          reminders: payload.data.reminders.length,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      return { success: false, message };
    }
  },

  /** Hapus semua data lokal (untuk reset aplikasi). */
  async clearAllData(): Promise<void> {
    await database.write(async () => {
      const [wallets, txs, cats, budgets, reminders] = await Promise.all([
        database.collections.get<WalletModel>('wallets').query().fetch(),
        database.collections.get<TransactionModel>('transactions').query().fetch(),
        database.collections.get<CategoryModel>('categories').query().fetch(),
        database.collections.get<BudgetModel>('budgets').query().fetch(),
        database.collections.get<ReminderModel>('reminders').query().fetch(),
      ]);
      const allRecords = [...wallets, ...txs, ...cats, ...budgets, ...reminders];
      await Promise.all(allRecords.map((r) => r.destroyPermanently()));
    });
    await e2e.deleteAll();
  },
};

async function restoreData(data: BackupPayload['data']): Promise<void> {
  await database.write(async () => {
    // Clear existing
    const existing = await Promise.all([
      database.collections.get<WalletModel>('wallets').query().fetch(),
      database.collections.get<TransactionModel>('transactions').query().fetch(),
      database.collections.get<CategoryModel>('categories').query().fetch(),
      database.collections.get<BudgetModel>('budgets').query().fetch(),
      database.collections.get<ReminderModel>('reminders').query().fetch(),
    ]);
    await Promise.all(existing.flat().map((r) => r.destroyPermanently()));

    // Restore wallets
    for (const raw of data.wallets) {
      await database.collections.get<WalletModel>('wallets').create((m) => {
        (m as unknown as { _raw: unknown })._raw = raw;
      });
    }
    // Restore categories
    for (const raw of data.categories) {
      await database.collections.get<CategoryModel>('categories').create((m) => {
        (m as unknown as { _raw: unknown })._raw = raw;
      });
    }
    // Restore transactions
    for (const raw of data.transactions) {
      await database.collections.get<TransactionModel>('transactions').create((m) => {
        (m as unknown as { _raw: unknown })._raw = raw;
      });
    }
    // Restore budgets
    for (const raw of data.budgets) {
      await database.collections.get<BudgetModel>('budgets').create((m) => {
        (m as unknown as { _raw: unknown })._raw = raw;
      });
    }
    // Restore reminders
    for (const raw of data.reminders) {
      await database.collections.get<ReminderModel>('reminders').create((m) => {
        (m as unknown as { _raw: unknown })._raw = raw;
      });
    }
  });
}
