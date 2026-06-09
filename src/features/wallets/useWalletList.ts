import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { Wallet } from '@/shared/types';

export function useWalletList() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const records = await database.get<import('@/shared/db').WalletModel>('wallets').query().fetch();
      const mapped: Wallet[] = records
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
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const refresh = useCallback(() => void load(true), [load]);

  return { wallets, loading, refreshing, refresh };
}
