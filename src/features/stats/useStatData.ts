import { useState, useEffect } from 'react';
import { database } from '@/shared/db';
import type { TransactionType } from '@/shared/types';
import { startOfMonth, endOfMonth, safeDiv } from '@/shared/utils/helpers';
import { isIncomeType, isExpenseType } from '@/shared/constants/transactionTypes';

type PeriodFilter = 'week' | 'month' | '3month' | '6month' | 'year';

interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
  percent: number;
}

interface StatData {
  totalIncome: number;
  totalExpense: number;
  categoryExpenses: CategoryExpense[];
  loading: boolean;
}

function getStartTs(period: PeriodFilter): number {
  const now = Date.now();
  switch (period) {
    case 'week':   return now - 7 * 86_400_000;
    case 'month':  return startOfMonth(now);
    case '3month': return now - 90 * 86_400_000;
    case '6month': return now - 180 * 86_400_000;
    case 'year':   return new Date(new Date().getFullYear(), 0, 1).getTime();
  }
}

export function useStatData(period: PeriodFilter): StatData {
  const [data, setData] = useState<StatData>({ totalIncome: 0, totalExpense: 0, categoryExpenses: [], loading: true });

  useEffect(() => {
    void load();
  }, [period]);

  async function load() {
    try {
      const startTs = getStartTs(period);
      const txRecords = await database.get<import('@/shared/db').TransactionModel>('transactions').query().fetch();
      const filtered = txRecords.filter(tx => tx.date >= startTs);

      const totalIncome = filtered
        .filter(tx => isIncomeType(tx.type as TransactionType))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalExpense = filtered
        .filter(tx => isExpenseType(tx.type as TransactionType))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const catMap = new Map<string, number>();
      for (const tx of filtered) {
        if (isExpenseType(tx.type as TransactionType)) {
          catMap.set(tx.categoryId, (catMap.get(tx.categoryId) ?? 0) + tx.amount);
        }
      }

      const catRecords = await database.get<import('@/shared/db').CategoryModel>('categories').query().fetch();
      const catById = Object.fromEntries(catRecords.map(c => [c.id, c.name]));

      const categoryExpenses: CategoryExpense[] = Array.from(catMap.entries())
        .map(([catId, amount]) => ({
          categoryId: catId,
          categoryName: catById[catId] ?? 'Lainnya',
          amount,
          percent: safeDiv(amount, totalExpense),
        }))
        .sort((a, b) => b.amount - a.amount);

      setData({ totalIncome, totalExpense, categoryExpenses, loading: false });
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  }

  return data;
}
