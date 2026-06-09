import { database } from '@/shared/db';

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const STATIC_RATES: Record<string, number> = {
  USD: 16200,
  EUR: 17500,
  SGD: 12000,
  MYR: 3600,
  JPY: 110,
  GBP: 20500,
  AUD: 10500,
  CNY: 2200,
  HKD: 2100,
  KRW: 12,
  THB: 450,
  CAD: 11800,
  CHF: 18000,
};

interface RatesResult {
  rates: Record<string, number>;
  fromCache: boolean;
  cachedAt?: number;
}

export async function getExchangeRates(): Promise<RatesResult> {
  try {
    const cacheKey = 'exchange_rates';
    const cached = await database.get<import('@/shared/db').PriceCacheModel>('price_cache').query().fetch();
    const entry = cached.find(c => c.key === cacheKey);

    if (entry) {
      const age = Date.now() - entry.fetchedAt;
      if (age < CACHE_TTL) {
        const rates = JSON.parse(entry.value) as Record<string, number>;
        return { rates, fromCache: true, cachedAt: entry.fetchedAt };
      }
    }

    const fetched = await fetchFromFrankfurter();
    await saveToCache(cacheKey, JSON.stringify(fetched), entry?.id);
    return { rates: fetched, fromCache: false };
  } catch {
    const cacheKey = 'exchange_rates';
    const cached = await database.get<import('@/shared/db').PriceCacheModel>('price_cache').query().fetch();
    const entry = cached.find(c => c.key === cacheKey);
    if (entry) {
      const rates = JSON.parse(entry.value) as Record<string, number>;
      return { rates, fromCache: true, cachedAt: entry.fetchedAt };
    }
    return { rates: STATIC_RATES, fromCache: true };
  }
}

async function fetchFromFrankfurter(): Promise<Record<string, number>> {
  const resp = await fetch('https://api.frankfurter.app/latest?base=IDR');
  if (!resp.ok) throw new Error('Frankfurter API error');
  const data = await resp.json() as { rates?: Record<string, number> };
  if (!data.rates) throw new Error('Invalid response');
  const result: Record<string, number> = {};
  for (const [currency, rate] of Object.entries(data.rates)) {
    result[currency] = Math.round(1 / rate);
  }
  return result;
}

async function saveToCache(key: string, value: string, existingId?: string) {
  await database.write(async () => {
    if (existingId) {
      const record = await database.get<import('@/shared/db').PriceCacheModel>('price_cache').find(existingId);
      await record.update(() => {
        record.value = value;
        record.fetchedAt = Date.now();
      });
    } else {
      await database.get<import('@/shared/db').PriceCacheModel>('price_cache').create((r) => {
        r.key = key;
        r.value = value;
        r.fetchedAt = Date.now();
      });
    }
  });
}

export async function convertToIDR(amount: number, currency: string): Promise<number> {
  if (currency === 'IDR') return amount;
  const { rates } = await getExchangeRates();
  const rate = rates[currency] ?? STATIC_RATES[currency] ?? 1;
  return amount * rate;
}

export async function convertFromIDR(amountIDR: number, targetCurrency: string): Promise<number> {
  if (targetCurrency === 'IDR') return amountIDR;
  const { rates } = await getExchangeRates();
  const rate = rates[targetCurrency] ?? STATIC_RATES[targetCurrency] ?? 1;
  return amountIDR / rate;
}
