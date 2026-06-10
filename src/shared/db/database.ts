import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { WalletModel } from './models/Wallet';
import { TransactionModel } from './models/Transaction';
import { CategoryModel } from './models/Category';
import { SettingsModel } from './models/Settings';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'catat_artha',
  jsi: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    WalletModel,
    TransactionModel,
    CategoryModel,
    SettingsModel,
  ],
});

/** Helper: get or set setting value */
export async function getSetting(key: string): Promise<string | undefined> {
  try {
    const collection = database.collections.get<SettingsModel>('settings');
    const results = await collection.query().fetch();
    const row = results.find((r) => r.key === key);
    return row?.value;
  } catch {
    return undefined;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const collection = database.collections.get<SettingsModel>('settings');
  await database.write(async () => {
    const results = await collection.query().fetch();
    const existing = results.find((r) => r.key === key);
    if (existing) {
      await existing.update((row) => {
        row.value = value;
      });
    } else {
      await collection.create((row) => {
        row.key = key;
        row.value = value;
      });
    }
  });
}
