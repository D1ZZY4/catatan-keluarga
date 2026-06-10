import { useState, useEffect } from 'react';
import { database } from '@/shared/db';
import type { RecurringTransactionModel } from '@/shared/db';
import type { TransactionType, TransactionInput } from '@/shared/types';

export interface RecurringItem {
  id: string;
  type: TransactionType;
  frequency: 'harian' | 'mingguan' | 'bulanan';
  nextDueDate: number;
  isActive: boolean;
  amount: number;
  currency: string;
  note?: string;
}

function mapRecord(r: RecurringTransactionModel): RecurringItem {
  let parsed: Partial<TransactionInput> = {};
  try { parsed = JSON.parse(r.templateData) as Partial<TransactionInput>; } catch { /* empty */ }
  return {
    id: r.id,
    type: r.type as TransactionType,
    frequency: r.frequency as RecurringItem['frequency'],
    nextDueDate: r.nextDueDate,
    isActive: r.isActive,
    amount: parsed.amount ?? 0,
    currency: parsed.currency ?? 'IDR',
    ...(parsed.note ? { note: parsed.note } : {}),
  };
}

export function useRecurringList() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = database
      .get<RecurringTransactionModel>('recurring_transactions')
      .query()
      .observe()
      .subscribe({
        next: (records) => {
          setItems(records.map(mapRecord).sort((a, b) => a.nextDueDate - b.nextDueDate));
          setLoading(false);
        },
        error: () => { setLoading(false); },
      });

    return () => subscription.unsubscribe();
  }, []);

  return { items, loading };
}
