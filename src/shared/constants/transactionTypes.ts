/**
 * Konfigurasi tipe transaksi — ikon, warna, pengelompokan.
 */

import {
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Send,
  UserPlus,
  UserMinus,
  CheckCircle,
  PiggyBank,
  Wallet,
  BarChart2,
  DollarSign,
  type LucideIcon,
} from 'lucide-react-native';
import type { TransactionType } from '../types';

export interface TransactionTypeOption {
  type: TransactionType;
  label: string;
  Icon: LucideIcon;
  color: string;
}

export const TYPE_OPTIONS: TransactionTypeOption[] = [
  { type: 'expense',          label: 'Pengeluaran',     Icon: TrendingDown,    color: '#c62828' },
  { type: 'income',           label: 'Pemasukan',       Icon: TrendingUp,      color: '#2e7d32' },
  { type: 'transfer_internal',label: 'Transfer',        Icon: ArrowLeftRight,  color: '#1565c0' },
  { type: 'transfer_external',label: 'Kirim Uang',      Icon: Send,            color: '#0288d1' },
  { type: 'debt_given',       label: 'Piutang',         Icon: UserPlus,        color: '#7b1fa2' },
  { type: 'debt_received',    label: 'Hutang',          Icon: UserMinus,       color: '#e65100' },
  { type: 'debt_repay',       label: 'Pelunasan',       Icon: CheckCircle,     color: '#558b2f' },
  { type: 'savings_deposit',  label: 'Tabungan',        Icon: PiggyBank,       color: '#00838f' },
  { type: 'savings_withdraw', label: 'Ambil Tabungan',  Icon: Wallet,          color: '#2e7d32' },
  { type: 'invest_buy',       label: 'Beli Investasi',  Icon: BarChart2,       color: '#1565c0' },
  { type: 'invest_sell',      label: 'Jual Investasi',  Icon: DollarSign,      color: '#2e7d32' },
];

export const INCOME_TYPES: TransactionType[] = [
  'income', 'debt_received', 'savings_withdraw', 'invest_sell',
];

export const EXPENSE_TYPES: TransactionType[] = [
  'expense', 'transfer_external', 'debt_given', 'savings_deposit', 'invest_buy', 'debt_repay',
];

export const TRANSFER_TYPES: TransactionType[] = ['transfer_internal'];

export const DEBT_TYPES: TransactionType[] = ['debt_given', 'debt_received', 'debt_repay'];

export function isIncomeType(type: TransactionType): boolean {
  return INCOME_TYPES.includes(type);
}
export function isExpenseType(type: TransactionType): boolean {
  return EXPENSE_TYPES.includes(type);
}
export function isTransferType(type: TransactionType): boolean {
  return TRANSFER_TYPES.includes(type);
}
export function isDebtType(type: TransactionType): boolean {
  return DEBT_TYPES.includes(type);
}
export function requiresPersonFields(type: TransactionType): boolean {
  return ['debt_given', 'debt_received', 'debt_repay'].includes(type);
}
export function requiresToWallet(type: TransactionType): boolean {
  return type === 'transfer_internal';
}
