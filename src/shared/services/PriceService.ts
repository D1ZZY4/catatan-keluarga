import NetInfo from '@react-native-community/netinfo';
import fallbackRates from '@/shared/data/exchange-rates-fallback.json';

const STATIC_RATES = fallbackRates.rates as Record<string, number>;

interface GoldPrice {
  perGram: number;
  perOz: number;
}

const CACHE_TTL_FIAT_MS = 4 * 60 * 60 * 1000;
const CACHE_TTL_CRYPTO_MS = 15 * 60 * 1000;
const CACHE_TTL_GOLD_MS = 60 * 60 * 1000;

class PriceServiceClass {
  private memCache = new Map<string, { value: unknown; ts: number }>();

  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true;
    } catch {
      return false;
    }
  }

  getLastUpdatedAt(key: string): Date | null {
    const cached = this.memCache.get(key);
    if (!cached) return null;
    return new Date(cached.ts);
  }

  async getExchangeRates(_base: string): Promise<Record<string, number>> {
    const cacheKey = `rates_${_base}`;
    const cached = this.memCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_FIAT_MS) {
      return cached.value as Record<string, number>;
    }

    if (!(await this.isOnline())) {
      return this.getStaticExchangeRates();
    }

    try {
      const ccxt = await import('ccxt');
      const exchange = new ccxt.binance({ enableRateLimit: true });
      const has = exchange.has['fetchTicker'];
      if (!has) return this.getStaticExchangeRates();

      const rates: Record<string, number> = { ...fallbackRates.rates };
      const pairs = [
        { symbol: 'USDT/BUSD', key: 'USD' },
      ];

      for (const pair of pairs) {
        try {
          const ticker = await exchange.fetchTicker(pair.symbol);
          if (ticker.last) rates[pair.key] = 1 / (ticker.last * (rates['USD'] ?? 0.000064));
        } catch {
          // keep static fallback
        }
      }

      this.memCache.set(cacheKey, { value: rates, ts: Date.now() });
      return rates;
    } catch {
      return this.getStaticExchangeRates();
    }
  }

  async getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
    const cacheKey = `crypto_${symbols.join(',')}`;
    const cached = this.memCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_CRYPTO_MS) {
      return cached.value as Record<string, number>;
    }

    if (!(await this.isOnline())) {
      return this.getStaticCryptoPrices(symbols);
    }

    try {
      const ccxt = await import('ccxt');
      const exchange = new ccxt.binance({ enableRateLimit: true });
      const results: Record<string, number> = {};

      for (const symbol of symbols) {
        try {
          const ticker = await exchange.fetchTicker(`${symbol}/USDT`);
          if (ticker.last !== undefined && ticker.last !== null) {
            results[symbol] = ticker.last;
          }
        } catch {
          const staticPrice = STATIC_RATES[symbol];
          if (staticPrice !== undefined) results[symbol] = staticPrice;
        }
      }

      this.memCache.set(cacheKey, { value: results, ts: Date.now() });
      return results;
    } catch {
      return this.getStaticCryptoPrices(symbols);
    }
  }

  async getGoldPrice(): Promise<GoldPrice> {
    const cacheKey = 'gold';
    const cached = this.memCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_GOLD_MS) {
      return cached.value as GoldPrice;
    }
    const staticPrice = this.getStaticGoldPrice();
    this.memCache.set(cacheKey, { value: staticPrice, ts: Date.now() });
    return staticPrice;
  }

  async getPrice(currency: string, baseCurrency: string): Promise<number | null> {
    const rates = await this.getExchangeRates(baseCurrency);
    const rate = rates[currency];
    return rate !== undefined ? rate : null;
  }

  private getStaticExchangeRates(): Record<string, number> {
    return { ...STATIC_RATES };
  }

  private getStaticCryptoPrices(symbols: string[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (const sym of symbols) {
      const r = STATIC_RATES[sym];
      if (r !== undefined) result[sym] = r;
    }
    return result;
  }

  private getStaticGoldPrice(): GoldPrice {
    const xauRate = STATIC_RATES['XAU'] ?? 0.000000041;
    const idrPerOz = 1 / xauRate;
    return { perGram: idrPerOz / 31.1035, perOz: idrPerOz };
  }
}

export const PriceService = new PriceServiceClass();
