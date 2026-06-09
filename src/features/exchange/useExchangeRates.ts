import { useState, useEffect } from 'react';
import { getExchangeRates } from '@/features/services/PriceService';

interface ExchangeRateState {
  rates: Record<string, number>;
  loading: boolean;
  fromCache: boolean;
  cachedAt?: number;
  error: boolean;
}

export function useExchangeRates() {
  const [state, setState] = useState<ExchangeRateState>({
    rates: {},
    loading: true,
    fromCache: false,
    error: false,
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const result = await getExchangeRates();
      setState({ rates: result.rates, loading: false, fromCache: result.fromCache, cachedAt: result.cachedAt, error: false });
    } catch {
      setState(prev => ({ ...prev, loading: false, error: true }));
    }
  }

  return { ...state, refresh: load };
}
