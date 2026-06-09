import type { TransactionType } from '@/shared/types';

export interface TransactionTypeOption {
  type: TransactionType;
  label: string;
  icon: string;
  colorKey: 'danger' | 'success' | 'accentPrimary' | 'accentSecondary' | 'warning' | 'textMuted';
}

export const TYPE_OPTIONS: TransactionTypeOption[] = [
  { type: 'expense',           label: 'Pengeluaran',    icon: 'TrendingDown',    colorKey: 'danger'          },
  { type: 'income',            label: 'Pemasukan',      icon: 'TrendingUp',      colorKey: 'success'         },
  { type: 'transfer_internal', label: 'Transfer',       icon: 'ArrowLeftRight',  colorKey: 'accentPrimary'   },
  { type: 'transfer_external', label: 'Kirim Uang',     icon: 'Send',            colorKey: 'accentSecondary' },
  { type: 'debt_given',        label: 'Piutang',        icon: 'UserPlus',        colorKey: 'warning'         },
  { type: 'debt_received',     label: 'Hutang',         icon: 'UserMinus',       colorKey: 'warning'         },
  { type: 'debt_repay',        label: 'Pelunasan',      icon: 'CheckCircle',     colorKey: 'textMuted'       },
  { type: 'savings_deposit',   label: 'Tabungan',       icon: 'PiggyBank',       colorKey: 'accentSecondary' },
  { type: 'savings_withdraw',  label: 'Tarik Tabungan', icon: 'Wallet',          colorKey: 'success'         },
  { type: 'invest_buy',        label: 'Beli Investasi', icon: 'BarChart2',       colorKey: 'accentPrimary'   },
  { type: 'invest_sell',       label: 'Jual Investasi', icon: 'DollarSign',      colorKey: 'success'         },
];

export const INCOME_TYPES: TransactionType[] = [
  'income', 'debt_received', 'savings_withdraw', 'invest_sell',
];

export const EXPENSE_TYPES: TransactionType[] = [
  'expense', 'transfer_external', 'debt_given', 'savings_deposit', 'invest_buy', 'debt_repay',
];

export const TRANSFER_TYPES: TransactionType[] = ['transfer_internal'];

export const DEBT_TYPES: TransactionType[] = ['debt_given', 'debt_received', 'debt_repay'];

export const PERSON_FIELD_TYPES: TransactionType[] = ['debt_given', 'debt_received', 'debt_repay'];

export function getTypeOption(type: TransactionType): TransactionTypeOption | undefined {
  return TYPE_OPTIONS.find(o => o.type === type);
}

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
  return PERSON_FIELD_TYPES.includes(type);
}
