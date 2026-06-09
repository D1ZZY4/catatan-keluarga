const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('id-ID');

const DATE_FORMATTER_MEDIUM = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });
const DATE_FORMATTER_SHORT = new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' });
const DATE_FORMATTER_LONG = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });
const TIME_FORMATTER = new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' });
const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });

export function formatCurrency(amount: number, currency = 'IDR'): string {
  if (currency === 'IDR') {
    return IDR_FORMATTER.format(amount);
  }
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${NUMBER_FORMATTER.format(amount)}`;
  }
}

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp${(abs / 1_000_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp${(abs / 1_000_000).toFixed(1)}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp${(abs / 1_000).toFixed(0)}rb`;
  }
  return formatCurrency(amount);
}

export function formatDate(timestamp: number): string {
  return DATE_FORMATTER_MEDIUM.format(new Date(timestamp));
}

export function formatDateShort(timestamp: number): string {
  return DATE_FORMATTER_SHORT.format(new Date(timestamp));
}

export function formatDateLong(timestamp: number): string {
  return DATE_FORMATTER_LONG.format(new Date(timestamp));
}

export function formatTime(timestamp: number): string {
  return TIME_FORMATTER.format(new Date(timestamp));
}

export function formatDateTime(timestamp: number): string {
  return `${DATE_FORMATTER_MEDIUM.format(new Date(timestamp))}, ${TIME_FORMATTER.format(new Date(timestamp))}`;
}

export function formatMonthYear(timestamp: number): string {
  return MONTH_YEAR_FORMATTER.format(new Date(timestamp));
}

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const dayMs = 86_400_000;

  if (diff < dayMs) return 'Hari ini';
  if (diff < 2 * dayMs) return 'Kemarin';
  if (diff < 7 * dayMs) {
    const days = Math.floor(diff / dayMs);
    return `${days} hari lalu`;
  }
  return DATE_FORMATTER_MEDIUM.format(new Date(timestamp));
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[Rp.,\s]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
