import { Platform } from 'react-native';
import { schema } from './schema';
import { WalletModel } from './models/Wallet';
import { TransactionModel } from './models/Transaction';
import { CategoryModel } from './models/Category';
import { SettingsModel } from './models/Settings';

// ─── Web Mock Database ─────────────────────────────────────────────────────────
// WatermelonDB hanya berjalan di native (SQLite). Pada web (Replit preview),
// gunakan in-memory mock agar app tidak crash saat bundling untuk preview.
const webSettings: Record<string, string> = {};

const webMockDatabase = {
  collections: {
    get: (_tableName: string) => ({
      query: () => ({ fetch: async () => [] }),
      create: async () => ({}),
    }),
  },
  write: async (fn: () => Promise<unknown>) => {
    try { await fn(); } catch {}
  },
  action: async (fn: () => Promise<unknown>) => {
    try { return await fn(); } catch { return undefined; }
  },
};

// ─── Native Database (WatermelonDB) ────────────────────────────────────────────
let _database: import('@nozbe/watermelondb').Database | typeof webMockDatabase;

if (Platform.OS !== 'web') {
  // Lazy require agar process.cwd tidak dipanggil saat import di web
  const { Database } = require('@nozbe/watermelondb') as typeof import('@nozbe/watermelondb');
  const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default as
    typeof import('@nozbe/watermelondb/adapters/sqlite').default;

  const adapter = new SQLiteAdapter({
    schema,
    dbName: 'catat_artha',
    jsi: true,
    onSetUpError: (error: Error) => {
      console.error('WatermelonDB setup error:', error);
    },
  });

  _database = new Database({
    adapter,
    modelClasses: [
      WalletModel,
      TransactionModel,
      CategoryModel,
      SettingsModel,
    ],
  });
} else {
  _database = webMockDatabase as unknown as import('@nozbe/watermelondb').Database;
}

export const database = _database as import('@nozbe/watermelondb').Database;

/** Helper: get or set setting value */
export async function getSetting(key: string): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    return webSettings[key];
  }
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
  if (Platform.OS === 'web') {
    webSettings[key] = value;
    return;
  }
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
