import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { Budget } from '@/shared/types';
import { startOfMonth, endOfMonth } from '@/shared/utils/helpers';
import { isExpenseType } from '@/shared/constants/transactionTypes';
import type { TransactionType } from '@/shared/types';

export interface BudgetWithUsage extends Budget {
  spent: number;
  remaining: number;
  progress: number;
  categoryName: string;
  categoryColor: string;
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetWithUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const now = Date.now();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const budgetRecords = await database.get<import('@/shared/db').BudgetModel>('budgets').query().fetch();
      const txRecords = await database.get<import('@/shared/db').TransactionModel>('transactions').query().fetch();
      const catRecords = await database.get<import('@/shared/db').CategoryModel>('categories').query().fetch();

      const catMap = Object.fromEntries(catRecords.map(c => [c.id, c]));
      const monthTx = txRecords.filter(tx => tx.date >= monthStart && tx.date <= monthEnd && isExpenseType(tx.type as TransactionType));

      const result: BudgetWithUsage[] = budgetRecords.map(b => {
        const spent = monthTx
          .filter(tx => tx.categoryId === b.categoryId)
          .reduce((sum, tx) => sum + tx.amount, 0);
        const remaining = Math.max(0, b.amount - spent);
        const progress = b.amount > 0 ? Math.min(1, spent / b.amount) : 0;
        const cat = catMap[b.categoryId];
        return {
          id: b.id,
          categoryId: b.categoryId,
          amount: b.amount,
          currency: b.currency,
          period: b.period as Budget['period'],
          ...(b.month !== null ? { month: b.month } : {}),
          ...(b.year !== null ? { year: b.year } : {}),
          notifyAt: b.notifyAt,
          createdAt: b.createdAt.getTime(),
          spent,
          remaining,
          progress,
          categoryName: cat?.name ?? 'Tidak Diketahui',
          categoryColor: cat?.color ?? '#999',
        };
      });

      setBudgets(result);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { budgets, loading, reload: load };
}
