import { useEffect, useState, useCallback } from 'react';
import { database } from '@/shared/db';
import type { SettingModel } from '@/shared/db/models/SettingModel';
import { Q } from '@nozbe/watermelondb';

export type SettingKey =
  | 'primary_currency'
  | 'date_format'
  | 'budget_alert'
  | 'bill_reminder'
  | 'weekly_report'
  | 'language';

const DEFAULTS: Record<SettingKey, string> = {
  primary_currency: 'IDR',
  date_format: 'dd/MM/yyyy',
  budget_alert: 'true',
  bill_reminder: 'true',
  weekly_report: 'false',
  language: 'id',
};

async function getSetting(key: SettingKey): Promise<string> {
  const rows = await database
    .get<SettingModel>('settings')
    .query(Q.where('key', key))
    .fetch();
  return rows[0]?.value ?? DEFAULTS[key];
}

async function setSetting(key: SettingKey, value: string): Promise<void> {
  const rows = await database
    .get<SettingModel>('settings')
    .query(Q.where('key', key))
    .fetch();

  await database.write(async () => {
    if (rows[0]) {
      await rows[0].update((r) => {
        r.value = value;
      });
    } else {
      await database.get<SettingModel>('settings').create((r) => {
        r.key = key;
        r.value = value;
      });
    }
  });
}

export function useSetting(key: SettingKey) {
  const [value, setValue] = useState<string>(DEFAULTS[key]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSetting(key).then((v) => {
      if (active) {
        setValue(v);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [key]);

  const set = useCallback(async (newValue: string) => {
    setValue(newValue);
    await setSetting(key, newValue);
  }, [key]);

  return { value, loading, set };
}

export function useSettings(keys: SettingKey[]) {
  const [values, setValues] = useState<Partial<Record<SettingKey, string>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const entries = await Promise.all(keys.map(async (k) => [k, await getSetting(k)] as [SettingKey, string]));
    setValues(Object.fromEntries(entries));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const set = useCallback(async (key: SettingKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    await setSetting(key, value);
  }, []);

  return { values, loading, set, reload: load };
}
