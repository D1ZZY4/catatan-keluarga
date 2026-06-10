/**
 * AppConfig — konfigurasi periode filter dan parameter global.
 * Semua periode filter app — tambah atau kurangi di sini tanpa menyentuh komponen.
 */

export type PeriodKey =
  | 'today'
  | 'last7days'
  | 'thisMonth'
  | 'last3months'
  | 'last6months'
  | 'thisYear'
  | 'custom'
  | 'all';

export interface PeriodDefinition {
  key: PeriodKey;
  label: string;
  getRange: () => { from: Date; to: Date } | null;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}
function endOfYear(d: Date) {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}
function subDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}
function subMonths(d: Date, n: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() - n);
  return r;
}

// Labels diambil dari AppLabels — tapi kita hindari circular import
// dengan mendefinisikan label langsung di sini
const periodLabels: Record<PeriodKey, string> = {
  today: 'Hari Ini',
  last7days: '7 Hari',
  thisMonth: 'Bulan Ini',
  last3months: '3 Bulan',
  last6months: '6 Bulan',
  thisYear: 'Tahun Ini',
  custom: 'Kustom',
  all: 'Semua',
};

export const AppConfig = {
  periods: [
    {
      key: 'today' as PeriodKey,
      label: periodLabels.today,
      getRange: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      }),
    },
    {
      key: 'last7days' as PeriodKey,
      label: periodLabels.last7days,
      getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
    },
    {
      key: 'thisMonth' as PeriodKey,
      label: periodLabels.thisMonth,
      getRange: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      key: 'last3months' as PeriodKey,
      label: periodLabels.last3months,
      getRange: () => ({ from: subMonths(new Date(), 3), to: new Date() }),
    },
    {
      key: 'last6months' as PeriodKey,
      label: periodLabels.last6months,
      getRange: () => ({ from: subMonths(new Date(), 6), to: new Date() }),
    },
    {
      key: 'thisYear' as PeriodKey,
      label: periodLabels.thisYear,
      getRange: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      }),
    },
    {
      key: 'custom' as PeriodKey,
      label: periodLabels.custom,
      getRange: () => null,
    },
    {
      key: 'all' as PeriodKey,
      label: periodLabels.all,
      getRange: () => null,
    },
  ] satisfies PeriodDefinition[],

  defaults: {
    notifyDaysBefore: 3,
    budgetNotifyAt: 80,
    lockAfterSeconds: 60,
    pinCooldownSeconds: 30,
    maxPinAttempts: 5,
    calculatorHistoryCount: 5,
    priceRefreshIntervalMs: {
      fiat: 4 * 60 * 60 * 1000,
      crypto: 15 * 60 * 1000,
      gold: 60 * 60 * 1000,
    },
    searchDebounceMs: 150,
    tourAutoAdvanceMs: 4000,
    listWindowSize: 10,
    listMaxToRenderPerBatch: 10,
    listInitialNumToRender: 15,
  },
} as const;
