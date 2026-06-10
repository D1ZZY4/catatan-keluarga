import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import { dbSchema } from './schema';
import { WalletModel } from './models/WalletModel';
import { TransactionModel } from './models/TransactionModel';
import { CategoryModel } from './models/CategoryModel';
import { BudgetModel } from './models/BudgetModel';
import { ReminderModel } from './models/ReminderModel';
import { SettingModel } from './models/SettingModel';
import { PriceCacheModel } from './models/PriceCacheModel';
import { TagModel } from './models/TagModel';
import { TransactionTemplateModel } from './models/TransactionTemplateModel';

const modelClasses = [
  WalletModel,
  TransactionModel,
  CategoryModel,
  BudgetModel,
  ReminderModel,
  SettingModel,
  PriceCacheModel,
  TagModel,
  TransactionTemplateModel,
];

function createDatabase(): Database {
  if (Platform.OS === 'web') {
    const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs').default;
    const adapter = new LokiJSAdapter({
      schema: dbSchema,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
      dbName: 'catkeu',
      // Saat hot-reload di web, koneksi IDB lama bisa memblokir delete/upgrade.
      // onVersionChange dipanggil ketika tab/koneksi lain meminta perubahan versi —
      // menutup koneksi ini agar tidak memblokir proses reset schema.
      extraIncrementalIDBOptions: {
        onVersionChange: (db: { close(): void }) => {
          db.close();
        },
      },
      onSetUpError: (_error: unknown) => {
        // silent — DB akan retry otomatis setelah koneksi lama menutup
      },
    });
    return new Database({ adapter, modelClasses });
  }

  const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
  const adapter = new SQLiteAdapter({
    schema: dbSchema,
    dbName: 'catkeu',
    jsi: true,
    onSetUpError: (_error: unknown) => {
      // silent
    },
  });
  return new Database({ adapter, modelClasses });
}

export const database = createDatabase();

export { WalletModel } from './models/WalletModel';
export { TransactionModel } from './models/TransactionModel';
export { CategoryModel } from './models/CategoryModel';
export { BudgetModel } from './models/BudgetModel';
export { ReminderModel } from './models/ReminderModel';
export { SettingModel } from './models/SettingModel';
export { PriceCacheModel } from './models/PriceCacheModel';
export { TagModel } from './models/TagModel';
export { TransactionTemplateModel } from './models/TransactionTemplateModel';
