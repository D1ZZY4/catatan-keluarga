/**
 * Seed data default — dipanggil sekali saat onboarding selesai.
 * Membuat 3 dompet default + semua kategori default.
 */

import { database } from './database';
import { WalletModel } from './models/Wallet';
import { CategoryModel } from './models/Category';
import { e2e } from '../crypto/e2e';
import { AppLabels } from '../config/labels';
import { AppColorsLight } from '../config/colors';

export async function seedDefaultWallets(): Promise<void> {
  const walletsCollection = database.collections.get<WalletModel>('wallets');
  const existing = await walletsCollection.query().fetch();
  if (existing.length > 0) return;

  await database.write(async () => {
    const now = Date.now();

    // Dompet 1: Tunai
    await walletsCollection.create((w) => {
      w.nameEnc = AppLabels.walletDefaults.cash; // akan dienkripsi oleh caller
      w.icon = 'Banknote';
      w.color = AppColorsLight.accentPrimary;
      w.currency = 'IDR';
      w.balanceEnc = '0';
      w.initialBalanceEnc = '0';
      w.type = 'cash';
      w.isArchived = false;
      w.showInDashboard = true;
      w.includeInTotal = true;
      w.sortOrder = 0;
    });

    // Dompet 2: Bank
    await walletsCollection.create((w) => {
      w.nameEnc = AppLabels.walletDefaults.bank;
      w.icon = 'Building2';
      w.color = '#2e7d32';
      w.currency = 'IDR';
      w.balanceEnc = '0';
      w.initialBalanceEnc = '0';
      w.type = 'bank';
      w.isArchived = false;
      w.showInDashboard = true;
      w.includeInTotal = true;
      w.sortOrder = 1;
    });

    // Dompet 3: Tabungan
    await walletsCollection.create((w) => {
      w.nameEnc = AppLabels.walletDefaults.savings;
      w.icon = 'PiggyBank';
      w.color = AppColorsLight.accentWarm;
      w.currency = 'IDR';
      w.balanceEnc = '0';
      w.initialBalanceEnc = '0';
      w.type = 'savings';
      w.isArchived = false;
      w.showInDashboard = true;
      w.includeInTotal = true;
      w.sortOrder = 2;
    });
  });
}

export async function seedDefaultCategories(): Promise<void> {
  const catCollection = database.collections.get<CategoryModel>('categories');
  const existing = await catCollection.query().fetch();
  if (existing.length > 0) return;

  const expenseCategories = [
    { key: 'food', icon: 'UtensilsCrossed', color: '#ef6c00' },
    { key: 'transport', icon: 'Car', color: '#1565c0' },
    { key: 'shopping', icon: 'ShoppingBag', color: '#7b1fa2' },
    { key: 'bills', icon: 'Receipt', color: '#00695c' },
    { key: 'health', icon: 'Heart', color: '#c62828' },
    { key: 'entertainment', icon: 'Gamepad2', color: '#6d4c41' },
    { key: 'education', icon: 'BookOpen', color: '#1565c0' },
    { key: 'household', icon: 'Home', color: '#558b2f' },
    { key: 'clothing', icon: 'Shirt', color: '#e91e63' },
    { key: 'beauty', icon: 'Sparkles', color: '#9c27b0' },
    { key: 'charity', icon: 'Gift', color: '#e65100' },
    { key: 'other', icon: 'MoreHorizontal', color: '#607d8b' },
  ] as const;

  const incomeCategories = [
    { key: 'salary', icon: 'Briefcase', color: '#2e7d32' },
    { key: 'freelance', icon: 'Laptop', color: '#1565c0' },
    { key: 'business', icon: 'Store', color: '#e65100' },
    { key: 'investment', icon: 'TrendingUp', color: '#7b1fa2' },
    { key: 'gift', icon: 'Gift', color: '#e91e63' },
    { key: 'bonus', icon: 'Star', color: '#ef6c00' },
    { key: 'refund', icon: 'RotateCcw', color: '#00695c' },
    { key: 'other', icon: 'MoreHorizontal', color: '#607d8b' },
  ] as const;

  await database.write(async () => {
    const now = Date.now();

    for (const cat of expenseCategories) {
      await catCollection.create((c) => {
        c.name = AppLabels.categories.expense[cat.key];
        c.icon = cat.icon;
        c.color = cat.color;
        c.type = 'expense';
        c.isDefault = true;
      });
    }

    for (const cat of incomeCategories) {
      await catCollection.create((c) => {
        c.name = AppLabels.categories.income[cat.key];
        c.icon = cat.icon;
        c.color = cat.color;
        c.type = 'income';
        c.isDefault = true;
      });
    }
  });
}
