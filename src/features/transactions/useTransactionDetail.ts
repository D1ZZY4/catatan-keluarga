import { useState, useEffect } from 'react';
import { database } from '@/shared/db';
import type { Transaction, TransactionType } from '@/shared/types';

export function useTransactionDetail(id: string | undefined) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    void load();
  }, [id]);

  async function load() {
    try {
      const record = await database.get<import('@/shared/db').TransactionModel>('transactions').find(id!);
      setTransaction({
        id: record.id,
        type: record.type as TransactionType,
        walletId: record.walletId,
        ...(record.toWalletId ? { toWalletId: record.toWalletId } : {}),
        categoryId: record.categoryId,
        amount: record.amount,
        currency: record.currency,
        ...(record.note ? { note: record.note } : {}),
        ...(record.personName ? { personName: record.personName } : {}),
        date: record.date,
        createdAt: record.createdAt.getTime(),
      });
    } catch {
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  }

  return { transaction, loading };
}
