/**
 * Daftar mata uang yang didukung.
 * Digunakan di WalletForm dan CurrencySelector.
 */

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'IDR', name: 'Rupiah Indonesia', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'USD', name: 'Dolar AS', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'SGD', name: 'Dolar Singapura', symbol: 'S$', flag: '🇸🇬' },
  { code: 'MYR', name: 'Ringgit Malaysia', symbol: 'RM', flag: '🇲🇾' },
  { code: 'JPY', name: 'Yen Jepang', symbol: '¥', flag: '🇯🇵' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£', flag: '🇬🇧' },
  { code: 'AUD', name: 'Dolar Australia', symbol: 'A$', flag: '🇦🇺' },
  { code: 'SAR', name: 'Riyal Arab Saudi', symbol: '﷼', flag: '🇸🇦' },
  { code: 'CNY', name: 'Yuan Tiongkok', symbol: '¥', flag: '🇨🇳' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '🟠' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: '🔷' },
  { code: 'XAU', name: 'Emas (per gram)', symbol: 'g', flag: '🥇' },
];

export const DEFAULT_CURRENCY = 'IDR';

export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  return getCurrencyInfo(code)?.symbol ?? code;
}
