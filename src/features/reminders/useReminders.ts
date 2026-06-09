import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { Reminder } from '@/shared/types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const records = await database.get<import('@/shared/db').ReminderModel>('reminders').query().fetch();
      setReminders(records.map(r => ({
        id: r.id,
        name: r.name,
        ...(r.amount !== null ? { amount: r.amount } : {}),
        currency: r.currency,
        dueDay: r.dueDay,
        period: r.period as Reminder['period'],
        category: r.category,
        notifyDaysBefore: r.notifyDaysBefore,
        isActive: r.isActive,
        createdAt: r.createdAt.getTime(),
      })));
    } catch {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { reminders, loading, reload: load };
}
