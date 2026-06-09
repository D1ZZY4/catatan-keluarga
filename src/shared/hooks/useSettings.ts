import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { SettingModel } from '@/shared/db';

const DEFAULT_SETTINGS: Record<string, string> = {
  baseCurrency: 'IDR',
  theme: 'auto',
  language: 'id',
  lockTimeout: '60',
  showBalanceOnLock: 'false',
  useBiometrics: 'false',
  fontScale: '1',
  firstDayOfWeek: '1',
  dateFormat: 'dd/MM/yyyy',
};

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void loadSettings(); }, []);

  async function loadSettings() {
    try {
      const records = await database.get<SettingModel>('settings').query().fetch();
      const loaded: Record<string, string> = { ...DEFAULT_SETTINGS };
      for (const r of records) {
        loaded[r.key] = r.value;
      }
      setSettings(loaded);
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }

  const setSetting = useCallback(async (key: string, value: string) => {
    try {
      await database.write(async () => {
        const existing = await database.get<SettingModel>('settings').query().fetch();
        const found = existing.find(r => r.key === key);
        if (found) {
          await found.update(() => { found.value = value; });
        } else {
          await database.get<SettingModel>('settings').create((record) => {
            record.key = key;
            record.value = value;
          });
        }
      });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch {
      // ignore
    }
  }, []);

  return { settings, loading, setSetting };
}
