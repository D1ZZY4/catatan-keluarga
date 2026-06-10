/**
 * PriceService — kurs multi-aset dengan CCXT + static fallback.
 * Cache: in-memory (TTL 15 menit fiat, 5 menit crypto).
 * Offline-safe: return last cached value jika fetch gagal.
 */

const FIAT_TTL = 15 * 60 * 1000; // 15 menit
const CRYPTO_TTL = 5 * 60 * 1000; // 5 menit

interface CacheEntry {
  value: number;
  fetchedAt: number;
}

const cache: Record<string, CacheEntry> = {};

// Kurs fallback statis (update berkala)
const STATIC_FALLBACK: Record<string, number> = {
  'IDR/IDR': 1,
  'USD/IDR': 16400,
  'EUR/IDR': 17800,
  'SGD/IDR': 12200,
  'MYR/IDR': 3600,
  'JPY/IDR': 105,
  'GBP/IDR': 20800,
  'AUD/IDR': 10200,
  'BTC/IDR': 1_650_000_000,
  'ETH/IDR': 95_000_000,
  'BNB/IDR': 9_500_000,
  'USDT/IDR': 16400,
  'GOLD/IDR': 1_500_000, // per gram
};

function getCached(key: string, ttl: number): number | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > ttl) return null;
  return entry.value;
}

function setCached(key: string, value: number): void {
  cache[key] = { value, fetchedAt: Date.now() };
}

/**
 * Ambil kurs pair (FROM/TO).
 * Contoh: getRate('USD', 'IDR') → 16400
 */
export async function getRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const key = `${from}/${to}`;
  const reverseKey = `${to}/${from}`;

  const cached = getCached(key, from === 'BTC' || from === 'ETH' ? CRYPTO_TTL : FIAT_TTL);
  if (cached !== null) return cached;

  try {
    const rate = await fetchLiveRate(from, to);
    if (rate !== null) {
      setCached(key, rate);
      return rate;
    }
  } catch {
    // fallback
  }

  // Coba reverse
  const fallback = STATIC_FALLBACK[key];
  if (fallback !== undefined) {
    setCached(key, fallback);
    return fallback;
  }

  const reverseFallback = STATIC_FALLBACK[reverseKey];
  if (reverseFallback !== undefined) {
    const rev = 1 / reverseFallback;
    setCached(key, rev);
    return rev;
  }

  return 1;
}

async function fetchLiveRate(from: string, to: string): Promise<number | null> {
  // Gunakan exchangerate-api gratis untuk fiat
  if (isFiat(from) && isFiat(to)) {
    const url = `https://open.er-api.com/v6/latest/${from}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { rates: Record<string, number> };
    const rate = data.rates[to];
    if (typeof rate === 'number') {
      // Cache semua rates sekaligus
      for (const [toCur, r] of Object.entries(data.rates)) {
        setCached(`${from}/${toCur}`, r);
      }
      return rate;
    }
    return null;
  }

  // Crypto: gunakan CoinGecko API gratis
  if (isCrypto(from)) {
    const coinId = CRYPTO_COIN_IDS[from];
    if (!coinId) return null;
    const vsCurrency = to.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, Record<string, number>>;
    const rate = data[coinId]?.[vsCurrency];
    if (typeof rate === 'number') return rate;
    return null;
  }

  return null;
}

const FIAT_LIST = new Set([
  'IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD','CHF','CNY',
  'HKD','KRW','THB','VND','PHP','INR','SAR','AED','TWD','NZD',
]);

const CRYPTO_LIST = new Set(['BTC','ETH','BNB','USDT','USDC','XRP','ADA','SOL','DOT','AVAX']);

const CRYPTO_COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  USDT: 'tether',
  USDC: 'usd-coin',
  XRP: 'ripple',
  ADA: 'cardano',
  SOL: 'solana',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
};

function isFiat(currency: string): boolean {
  return FIAT_LIST.has(currency.toUpperCase());
}

function isCrypto(currency: string): boolean {
  return CRYPTO_LIST.has(currency.toUpperCase());
}

/**
 * Convert amount dari satu currency ke currency lain.
 */
export async function convertAmount(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return amount;
  const rate = await getRate(from, to);
  return amount * rate;
}

/**
 * Daftar kurs untuk home screen widget.
 * Return list pasangan (code, rate, name) terhadap baseCurrency.
 */
export async function getHomeRates(baseCurrency: string): Promise<
  Array<{ code: string; name: string; rate: number; change?: number }>
> {
  const pairs = ['USD','EUR','SGD','BTC','ETH','GOLD'].filter((c) => c !== baseCurrency);
  const results = await Promise.allSettled(
    pairs.map(async (code) => ({
      code,
      name: CURRENCY_NAMES[code] ?? code,
      rate: await getRate(code, baseCurrency),
    })),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<{ code: string; name: string; rate: number }> =>
      r.status === 'fulfilled',
    )
    .map((r) => r.value);
}

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'Dolar AS',
  EUR: 'Euro',
  SGD: 'Dolar Singapura',
  MYR: 'Ringgit',
  JPY: 'Yen Jepang',
  GBP: 'Pound Inggris',
  AUD: 'Dolar Australia',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  BNB: 'BNB',
  GOLD: 'Emas (gram)',
};

/** Clear semua cache (untuk testing / manual refresh). */
export function clearPriceCache(): void {
  for (const key of Object.keys(cache)) {
    delete cache[key];
  }
}

/** Daftar semua currency yang didukung. */
export const SUPPORTED_CURRENCIES = [
  ...Array.from(FIAT_LIST),
  ...Array.from(CRYPTO_LIST),
  'GOLD',
];
