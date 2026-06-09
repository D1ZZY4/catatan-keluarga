import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { Tag } from '@/shared/types';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const records = await database.get<import('@/shared/db').TagModel>('tags').query().fetch();
      setTags(records.map(r => ({ id: r.id, name: r.name, createdAt: r.createdAt.getTime() })));
    } catch { setTags([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { tags, loading, reload: load };
}
