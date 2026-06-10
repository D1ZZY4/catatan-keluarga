/**
 * Repo layer — semua operasi DB WatermelonDB.
 * Settings menggunakan key-value store via getSetting/setSetting dari database.ts
 */

import { database, getSetting, setSetting } from './database';
import { WalletModel } from './models/Wallet';
import { TransactionModel } from './models/Transaction';
import { CategoryModel } from './models/Category';
import type { Wallet, Transaction, Category, AppSettings } from '../types';

// ---- helpers ----

function walletFromModel(m: WalletModel): Wallet {
  return {
    id: m.id,
    name: m.nameEnc,
    icon: m.icon,
    color: m.color,
    currency: m.currency,
    balance: parseFloat(m.balanceEnc) || 0,
    initialBalance: parseFloat(m.initialBalanceEnc) || 0,
    type: m.type as Wallet['type'],
    isArchived: m.isArchived,
    showInDashboard: m.showInDashboard,
    includeInTotal: m.includeInTotal,
    sortOrder: m.sortOrder,
    createdAt: m.createdAt.getTime(),
  };
}

function txFromModel(m: TransactionModel): Transaction {
  return {
    id: m.id,
    type: m.type as Transaction['type'],
    walletId: m.walletId,
    toWalletId: m.toWalletId ?? undefined,
    categoryId: m.categoryId,
    amount: parseFloat(m.amountEnc) || 0,
    currency: m.currency,
    note: m.noteEnc ?? undefined,
    linkedPersonName: m.personNameEnc ?? undefined,
    linkedPersonPhone: m.personPhoneEnc ?? undefined,
    date: m.date,
    createdAt: m.createdAt.getTime(),
    updatedAt: m.updatedAt,
  };
}

function catFromModel(m: CategoryModel): Category {
  return {
    id: m.id,
    name: m.name,
    icon: m.icon,
    color: m.color,
    type: m.type as Category['type'],
    isDefault: m.isDefault,
    createdAt: m.createdAt.getTime(),
  };
}

// ---- Wallets ----

export async function listWallets(): Promise<Wallet[]> {
  const col = database.collections.get<WalletModel>('wallets');
  const rows = await col.query().fetch();
  return rows.map(walletFromModel).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function putWallet(wallet: Wallet): Promise<void> {
  const col = database.collections.get<WalletModel>('wallets');
  await database.write(async () => {
    try {
      const existing = await col.find(wallet.id);
      await existing.update((m) => {
        m.nameEnc = wallet.name;
        m.icon = wallet.icon;
        m.color = wallet.color;
        m.currency = wallet.currency;
        m.balanceEnc = String(wallet.balance);
        m.initialBalanceEnc = String(wallet.initialBalance);
        m.type = wallet.type;
        m.isArchived = wallet.isArchived;
        m.showInDashboard = wallet.showInDashboard;
        m.includeInTotal = wallet.includeInTotal;
        m.sortOrder = wallet.sortOrder;
      });
    } catch {
      await col.create((m) => {
        (m as any)._raw.id = wallet.id;
        m.nameEnc = wallet.name;
        m.icon = wallet.icon;
        m.color = wallet.color;
        m.currency = wallet.currency;
        m.balanceEnc = String(wallet.balance);
        m.initialBalanceEnc = String(wallet.initialBalance);
        m.type = wallet.type;
        m.isArchived = wallet.isArchived;
        m.showInDashboard = wallet.showInDashboard;
        m.includeInTotal = wallet.includeInTotal;
        m.sortOrder = wallet.sortOrder;
      });
    }
  });
}

export async function deleteWallet(id: string): Promise<void> {
  const col = database.collections.get<WalletModel>('wallets');
  await database.write(async () => {
    try {
      const record = await col.find(id);
      await record.destroyPermanently();
    } catch {
      // already deleted
    }
  });
}

// ---- Transactions ----

export async function listTransactions(): Promise<Transaction[]> {
  const col = database.collections.get<TransactionModel>('transactions');
  const rows = await col.query().fetch();
  return rows.map(txFromModel).sort((a, b) => b.date - a.date);
}

export async function putTransaction(tx: Transaction): Promise<void> {
  const col = database.collections.get<TransactionModel>('transactions');
  await database.write(async () => {
    try {
      const existing = await col.find(tx.id);
      await existing.update((m) => {
        m.type = tx.type;
        m.walletId = tx.walletId;
        m.toWalletId = tx.toWalletId ?? null;
        m.categoryId = tx.categoryId;
        m.amountEnc = String(tx.amount);
        m.currency = tx.currency;
        m.noteEnc = tx.note ?? null;
        m.personNameEnc = tx.linkedPersonName ?? null;
        m.personPhoneEnc = tx.linkedPersonPhone ?? null;
        m.date = tx.date;
        m.updatedAt = tx.updatedAt;
      });
    } catch {
      await col.create((m) => {
        (m as any)._raw.id = tx.id;
        m.type = tx.type;
        m.walletId = tx.walletId;
        m.toWalletId = tx.toWalletId ?? null;
        m.categoryId = tx.categoryId;
        m.amountEnc = String(tx.amount);
        m.currency = tx.currency;
        m.noteEnc = tx.note ?? null;
        m.personNameEnc = tx.linkedPersonName ?? null;
        m.personPhoneEnc = tx.linkedPersonPhone ?? null;
        m.date = tx.date;
        m.updatedAt = tx.updatedAt;
      });
    }
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const col = database.collections.get<TransactionModel>('transactions');
  await database.write(async () => {
    try {
      const record = await col.find(id);
      await record.destroyPermanently();
    } catch {}
  });
}

// ---- Categories ----

export async function listCategories(): Promise<Category[]> {
  const col = database.collections.get<CategoryModel>('categories');
  const rows = await col.query().fetch();
  return rows.map(catFromModel);
}

export async function putCategory(cat: Category): Promise<void> {
  const col = database.collections.get<CategoryModel>('categories');
  await database.write(async () => {
    try {
      const existing = await col.find(cat.id);
      await existing.update((m) => {
        m.name = cat.name;
        m.icon = cat.icon;
        m.color = cat.color;
        m.type = cat.type;
        m.isDefault = cat.isDefault;
      });
    } catch {
      await col.create((m) => {
        (m as any)._raw.id = cat.id;
        m.name = cat.name;
        m.icon = cat.icon;
        m.color = cat.color;
        m.type = cat.type;
        m.isDefault = cat.isDefault;
      });
    }
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const col = database.collections.get<CategoryModel>('categories');
  await database.write(async () => {
    try {
      const record = await col.find(id);
      await record.destroyPermanently();
    } catch {}
  });
}

// ---- Settings (key-value store) ----

export async function getAppSettings(): Promise<Partial<AppSettings>> {
  const [
    userName,
    baseCurrency,
    theme,
    onboardingCompleted,
  ] = await Promise.all([
    getSetting('userName'),
    getSetting('baseCurrency'),
    getSetting('theme'),
    getSetting('onboardingCompleted'),
  ]);
  return {
    userName: userName ?? 'Pengguna',
    baseCurrency: baseCurrency ?? 'IDR',
    theme: (theme as AppSettings['theme']) ?? 'system',
    onboardingCompleted: onboardingCompleted === 'true',
    autoLockSeconds: 60,
    tourCompleted: false,
  };
}

export async function saveAppSettings(s: Partial<AppSettings>): Promise<void> {
  const ops: Promise<void>[] = [];
  if (s.userName !== undefined) ops.push(setSetting('userName', s.userName));
  if (s.baseCurrency !== undefined) ops.push(setSetting('baseCurrency', s.baseCurrency));
  if (s.theme !== undefined) ops.push(setSetting('theme', s.theme));
  if (s.onboardingCompleted !== undefined) ops.push(setSetting('onboardingCompleted', String(s.onboardingCompleted)));
  await Promise.all(ops);
}

/** Count transactions by wallet (for delete guard) */
export async function countTransactionsByWallet(walletId: string): Promise<number> {
  const col = database.collections.get<TransactionModel>('transactions');
  const rows = await col.query().fetch();
  return rows.filter((r) => r.walletId === walletId || r.toWalletId === walletId).length;
}
