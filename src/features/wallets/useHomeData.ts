import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { Wallet } from '@/shared/types';
import { startOfMonth, endOfMonth } from '@/shared/utils/helpers';

interface HomeData {
  wallets: Wallet[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
}

export function useHomeData(): HomeData {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const walletsCollection = database.get<import('@/shared/db').WalletModel>('wallets');
      const walletRecords = await walletsCollection
        .query()
        .fetch();

      const mapped: Wallet[] = walletRecords
        .filter(w => !w.isArchived)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(w => ({
          id: w.id,
          name: w.name,
          icon: w.icon,
          color: w.color,
          currency: w.currency,
          balance: w.balance,
          initialBalance: w.initialBalance,
          isArchived: w.isArchived,
          showInDashboard: w.showInDashboard,
          includeInTotal: w.includeInTotal,
          type: w.type as Wallet['type'],
          sortOrder: w.sortOrder,
          createdAt: w.createdAt.getTime(),
        }));

      setWallets(mapped);

      const txCollection = database.get<import('@/shared/db').TransactionModel>('transactions');
      const now = Date.now();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const txRecords = await txCollection.query().fetch();
      const monthTx = txRecords.filter(tx => tx.date >= monthStart && tx.date <= monthEnd);

      const { INCOME_TYPES, EXPENSE_TYPES } = await import('@/shared/constants/transactionTypes');
      const income = monthTx
        .filter(tx => INCOME_TYPES.includes(tx.type as import('@/shared/types').TransactionType))
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expense = monthTx
        .filter(tx => EXPENSE_TYPES.includes(tx.type as import('@/shared/types').TransactionType))
        .reduce((sum, tx) => sum + tx.amount, 0);

      setMonthlyIncome(income);
      setMonthlyExpense(expense);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  const totalBalance = wallets
    .filter(w => w.includeInTotal && !w.isArchived)
    .reduce((sum, w) => sum + w.balance, 0);

  return { wallets, totalBalance, monthlyIncome, monthlyExpense, loading, refreshing, refresh };
}
