import type { CategoryType } from '@/shared/types';

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: 'Makanan & Minuman', icon: 'Utensils',       color: '#F4A35A', type: 'expense', isDefault: true },
  { name: 'Transportasi',      icon: 'Car',             color: '#8CC0EB', type: 'expense', isDefault: true },
  { name: 'Belanja',           icon: 'ShoppingBag',     color: '#CE93D8', type: 'expense', isDefault: true },
  { name: 'Tagihan & Utilitas',icon: 'Zap',             color: '#FFD54F', type: 'expense', isDefault: true },
  { name: 'Kesehatan',         icon: 'Heart',           color: '#EF9A9A', type: 'expense', isDefault: true },
  { name: 'Hiburan',           icon: 'Film',            color: '#80DEEA', type: 'expense', isDefault: true },
  { name: 'Pendidikan',        icon: 'BookOpen',        color: '#A5D6A7', type: 'expense', isDefault: true },
  { name: 'Perawatan Rumah',   icon: 'Home',            color: '#BCAAA4', type: 'expense', isDefault: true },
  { name: 'Pakaian',           icon: 'Shirt',           color: '#F48FB1', type: 'expense', isDefault: true },
  { name: 'Kecantikan',        icon: 'Sparkles',        color: '#FFF176', type: 'expense', isDefault: true },
  { name: 'Hadiah & Donasi',   icon: 'Gift',            color: '#FFCC80', type: 'expense', isDefault: true },
  { name: 'Lainnya',           icon: 'MoreHorizontal',  color: '#B0BEC5', type: 'expense', isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: 'Gaji',              icon: 'Briefcase',       color: '#2E7D32', type: 'income', isDefault: true },
  { name: 'Freelance',         icon: 'Laptop',          color: '#1565C0', type: 'income', isDefault: true },
  { name: 'Bisnis',            icon: 'Store',           color: '#4A148C', type: 'income', isDefault: true },
  { name: 'Investasi',         icon: 'TrendingUp',      color: '#00695C', type: 'income', isDefault: true },
  { name: 'Hadiah Uang',       icon: 'Gift',            color: '#F4A35A', type: 'income', isDefault: true },
  { name: 'Bonus',             icon: 'Star',            color: '#F57F17', type: 'income', isDefault: true },
  { name: 'Pengembalian Dana', icon: 'RotateCcw',       color: '#0277BD', type: 'income', isDefault: true },
  { name: 'Lainnya',           icon: 'MoreHorizontal',  color: '#546E7A', type: 'income', isDefault: true },
];

export const ALL_DEFAULT_CATEGORIES: DefaultCategory[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];
