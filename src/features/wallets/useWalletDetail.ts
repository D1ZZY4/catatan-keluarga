import { useState, useEffect } from 'react';
import { database } from '@/shared/db';
import type { Wallet } from '@/shared/types';

export function useWalletDetail(id: string | undefined) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    void load();
  }, [id]);

  async function load() {
    try {
      const r = await database.get<import('@/shared/db').WalletModel>('wallets').find(id!);
      setWallet({
        id: r.id, name: r.name, icon: r.icon, color: r.color,
        currency: r.currency, balance: r.balance, initialBalance: r.initialBalance,
        isArchived: r.isArchived, showInDashboard: r.showInDashboard,
        includeInTotal: r.includeInTotal, type: r.type as Wallet['type'],
        sortOrder: r.sortOrder, createdAt: r.createdAt.getTime(),
      });
    } catch { setWallet(null); }
    finally { setLoading(false); }
  }

  return { wallet, loading };
}
