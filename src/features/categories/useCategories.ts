import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { Category } from '@/shared/types';

export function useCategories(type?: 'expense' | 'income') {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const records = await database.get<import('@/shared/db').CategoryModel>('categories').query().fetch();
      let mapped: Category[] = records.map(c => ({
        id: c.id, name: c.name, icon: c.icon, color: c.color,
        type: c.type as Category['type'], isDefault: c.isDefault,
      }));
      if (type) mapped = mapped.filter(c => c.type === type);
      setCategories(mapped);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  }, [type]);

  useEffect(() => { void load(); }, [load]);

  return { categories, loading, reload: load };
}
