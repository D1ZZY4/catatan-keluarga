/**
 * TextEngine — algoritma teks otomatis rule-based.
 * Tidak ada ML, tidak ada API, tidak ada randomness.
 * Hasilnya konsisten dan ter-cache.
 */

import type { PeriodKey } from '../config/periods';
import type { TransactionType } from '../types';

const _cache = new Map<string, string>();

function cached(key: string, fn: () => string): string {
  if (_cache.has(key)) return _cache.get(key)!;
  const result = fn();
  _cache.set(key, result);
  return result;
}

function formatCustomPeriod(from: Date, to: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const fromDay = from.getDate();
  const toDay = to.getDate();
  const fromMonth = months[from.getMonth()];
  const toMonth = months[to.getMonth()];
  const fromYear = from.getFullYear();
  const toYear = to.getFullYear();

  if (fromYear !== toYear) {
    return `${fromDay} ${fromMonth} ${fromYear} \u2013 ${toDay} ${toMonth} ${toYear}`;
  }
  if (from.getMonth() !== to.getMonth()) {
    return `${fromDay} ${fromMonth} \u2013 ${toDay} ${toMonth} ${fromYear}`;
  }
  return `${fromDay}\u2013${toDay} ${fromMonth} ${fromYear}`;
}

// Forward reference untuk menghindari circular import
function getTransactionTypeLabel(type: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AppLabels } = require('../config/labels') as typeof import('../config/labels');
  return AppLabels.transactionType[type] ?? type;
}

function getPeriodLabel(key: PeriodKey): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AppLabels } = require('../config/labels') as typeof import('../config/labels');
  return AppLabels.periodLabels[key];
}

export const textEngine = {
  /**
   * Gabung list dengan konjungsi Indonesia yang benar.
   */
  joinList(items: string[], conjunction: 'dan' | 'atau' = 'dan'): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0]!;
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
    const allButLast = items.slice(0, -1).join(', ');
    return `${allButLast}, ${conjunction} ${items[items.length - 1]}`;
  },

  /**
   * Deskripsi kuantitas dengan konteks.
   */
  quantityLabel(count: number, noun: string, overflow = false): string {
    const key = `qty:${count}:${noun}:${overflow}`;
    return cached(key, () => {
      if (count === 0) return `Tidak ada ${noun}`;
      const countStr = overflow && count >= 100 ? `${count}+` : `${count}`;
      return `${countStr} ${noun}`;
    });
  },

  /**
   * Deskripsi periode natural.
   */
  periodDescription(key: PeriodKey, customRange?: { from: Date; to: Date }): string {
    const cacheKey = `period:${key}:${customRange?.from.getTime() ?? ''}`;
    return cached(cacheKey, () => {
      const map: Record<PeriodKey, string> = {
        today: 'hari ini',
        last7days: '7 hari terakhir',
        thisMonth: 'bulan ini',
        last3months: '3 bulan terakhir',
        last6months: '6 bulan terakhir',
        thisYear: 'tahun ini',
        all: 'semua waktu',
        custom: customRange
          ? formatCustomPeriod(customRange.from, customRange.to)
          : 'rentang kustom',
      };
      return map[key];
    });
  },

  /**
   * Deskripsi ringkas filter aktif.
   */
  filterSummary(filter: { period: PeriodKey; types: TransactionType[] }): string {
    const key = `filter:${filter.period}:${filter.types.join(',')}`;
    return cached(key, () => {
      const typeLabels = filter.types.map(getTransactionTypeLabel);
      const typePart =
        typeLabels.length === 0 ? 'Semua' : textEngine.joinList(typeLabels);
      const periodPart = textEngine.periodDescription(filter.period);
      return `${typePart} \u00b7 ${periodPart}`;
    });
  },

  /**
   * Peringatan hapus dompet.
   */
  walletDeleteWarning(transactionCount: number): string {
    if (transactionCount === 0) return 'Hapus dompet ini secara permanen?';
    return `Dompet ini memiliki ${transactionCount} transaksi. Sebaiknya arsipkan agar data tetap aman?`;
  },

  /**
   * Label ringkas untuk summary card.
   */
  summaryLabel(type: TransactionType, amount: number, currency: string): string {
    const typeLabel = getTransactionTypeLabel(type);
    const { formatCurrency } = require('./format') as typeof import('./format');
    const amountLabel = formatCurrency(Math.abs(amount), currency);
    return `${typeLabel} \u00b7 ${amountLabel}`;
  },

  /**
   * Saran kategori dari kata kunci catatan.
   * RULE-BASED — tidak ada AI.
   */
  suggestCategory(note: string): string | null {
    const lower = note.toLowerCase();
    const rules: Array<{ keywords: string[]; category: string }> = [
      { keywords: ['indomaret', 'alfamart', 'lawson', 'minimarket'], category: 'shopping' },
      { keywords: ['grab', 'gojek', 'maxim', 'ojol', 'bensin', 'parkir'], category: 'transport' },
      { keywords: ['makan', 'minum', 'warung', 'resto', 'kafe', 'cafe', 'nasi', 'bakso', 'soto'], category: 'food' },
      { keywords: ['listrik', 'pln', 'pdam', 'wifi', 'internet', 'pulsa', 'token'], category: 'bills' },
      { keywords: ['dokter', 'obat', 'apotik', 'apotek', 'rs ', 'rumah sakit', 'klinik'], category: 'health' },
      { keywords: ['netflix', 'spotify', 'game', 'bioskop', 'cinema', 'film'], category: 'entertainment' },
      { keywords: ['spp', 'buku', 'sekolah', 'kursus', 'les', 'kuliah', 'kampus'], category: 'education' },
      { keywords: ['gaji', 'salary', 'slip gaji', 'upah'], category: 'salary' },
      { keywords: ['bonus', 'thr'], category: 'bonus' },
      { keywords: ['transfer', 'kirim'], category: 'other' },
    ];

    for (const { keywords, category } of rules) {
      if (keywords.some((kw) => lower.includes(kw))) return category;
    }
    return null;
  },

  /** Bersihkan cache — panggil saat konfigurasi berubah */
  clearCache(): void {
    _cache.clear();
  },
};
