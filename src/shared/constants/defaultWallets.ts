import type { WalletType } from '@/shared/types';

export interface DefaultWalletTemplate {
  name: string;
  icon: string;
  color: string;
  currency: string;
  type: WalletType;
  sortOrder: number;
}

export const DEFAULT_WALLETS: DefaultWalletTemplate[] = [
  {
    name: 'Tunai',
    icon: 'Banknote',
    color: '#4CAF50',
    currency: 'IDR',
    type: 'cash',
    sortOrder: 0,
  },
  {
    name: 'Bank',
    icon: 'Building2',
    color: '#8CC0EB',
    currency: 'IDR',
    type: 'bank',
    sortOrder: 1,
  },
  {
    name: 'Tabungan',
    icon: 'PiggyBank',
    color: '#F4A35A',
    currency: 'IDR',
    type: 'savings',
    sortOrder: 2,
  },
];
