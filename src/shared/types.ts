/**
 * Domain types shared across features.
 * Decrypted record shapes — what lives in app memory after decryption.
 */

export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer_internal'
  | 'transfer_external'
  | 'debt_given'
  | 'debt_received'
  | 'debt_repay'
  | 'savings_deposit'
  | 'savings_withdraw'
  | 'invest_buy'
  | 'invest_sell';

export type WalletType =
  | 'cash'
  | 'bank'
  | 'e-wallet'
  | 'investment'
  | 'savings'
  | 'credit'
  | 'crypto'
  | 'other';

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
  initialBalance: number;
  isArchived: boolean;
  showInDashboard: boolean;
  includeInTotal: boolean;
  type: WalletType;
  sortOrder: number;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  date: number;
  note?: string;
  attachmentBase64?: string;
  linkedPersonName?: string;
  linkedPersonPhone?: string;
  isSplitOf?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  isDefault: boolean;
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  period: 'bulanan' | 'mingguan';
  month?: number;
  year?: number;
  notifyAt: number;
  createdAt: number;
}

export interface Reminder {
  id: string;
  name: string;
  amount?: number;
  currency: string;
  dueDay: number;
  period: 'bulanan' | 'mingguan';
  category: string;
  notifyDaysBefore: number;
  isActive: boolean;
  createdAt: number;
}

export interface TransactionTemplate {
  id: string;
  type: TransactionType;
  categoryId: string;
  label: string;
  walletId: string;
  amount?: number;
  note?: string;
  createdAt: number;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  templateData: string;
  frequency: 'harian' | 'mingguan' | 'bulanan';
  nextDueDate: number;
  isActive: boolean;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: number;
}

export interface AppSettings {
  userName: string;
  baseCurrency: string;
  autoLockSeconds: number;
  onboardingCompleted: boolean;
  tourCompleted: boolean;
  theme: 'light' | 'dark' | 'system';
}
