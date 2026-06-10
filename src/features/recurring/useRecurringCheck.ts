import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { database } from '@/shared/db';
import type { RecurringTransactionModel, TransactionModel, WalletModel } from '@/shared/db';
import { isExpenseType } from '@/shared/constants/transactionTypes';
import type { TransactionType, TransactionInput } from '@/shared/types';

async function processRecurringTransactions(): Promise<void> {
  try {
    const now = Date.now();
    const records = await database
      .get<RecurringTransactionModel>('recurring_transactions')
      .query()
      .fetch();

    const due = records.filter(r => r.isActive && r.nextDueDate <= now);
    if (due.length === 0) return;

    await database.write(async () => {
      for (const r of due) {
        let parsed: Partial<TransactionInput> = {};
        try { parsed = JSON.parse(r.templateData) as Partial<TransactionInput>; } catch { continue; }

        const walletId = parsed.walletId;
        const amount = parsed.amount;
        if (!walletId || !amount) continue;

        const txType = r.type as TransactionType;
        await database.get<TransactionModel>('transactions').create((tx) => {
          tx.type = txType;
          tx.walletId = walletId;
          tx.categoryId = parsed.categoryId ?? '';
          tx.amount = amount;
          tx.currency = parsed.currency ?? 'IDR';
          tx.note = parsed.note ?? '';
          tx.date = now;
          // @ts-expect-error WatermelonDB _raw pattern
          tx._raw.created_at = now;
        });

        const walletRecord = await database.get<WalletModel>('wallets').find(walletId);
        const deduct = isExpenseType(txType);
        await walletRecord.update((w: WalletModel) => {
          w.balance = deduct
            ? walletRecord.balance - amount
            : walletRecord.balance + amount;
        });

        const nextDate = new Date(r.nextDueDate);
        if (r.frequency === 'harian') nextDate.setDate(nextDate.getDate() + 1);
        else if (r.frequency === 'mingguan') nextDate.setDate(nextDate.getDate() + 7);
        else nextDate.setMonth(nextDate.getMonth() + 1);

        await r.update((rec: RecurringTransactionModel) => {
          rec.nextDueDate = nextDate.getTime();
        });
      }
    });
  } catch {
    // silent — tidak boleh crash app
  }
}

export function useRecurringCheck(): void {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    void processRecurringTransactions();

    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        void processRecurringTransactions();
      }
      appState.current = nextState;
    });

    return () => { sub.remove(); };
  }, []);
}
