/**
 * Format utilities — angka, mata uang, tanggal, teks.
 * Semua output menggunakan format Indonesia.
 */

const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const GENERIC_FORMATTER = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Format angka sebagai mata uang.
 * formatCurrency(75000, 'IDR') → 'Rp 75.000'
 * formatCurrency(10.5, 'USD') → 'USD 10,50'
 */
export function formatCurrency(amount: number, currency = 'IDR'): string {
  if (currency === 'IDR') {
    return IDR_FORMATTER.format(amount);
  }
  // Untuk mata uang lain, gunakan format sederhana
  const formatted = GENERIC_FORMATTER.format(Math.abs(amount));
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency} ${formatted}`;
}

/**
 * Format angka kompak untuk chart dan card.
 * formatCompact(1500000) → '1,5 Jt'
 * formatCompact(75000) → '75 Rb'
 * formatCompact(1000) → '1 Rb'
 */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)} Rb`;
  return `${sign}${abs}`;
}

/**
 * Format tanggal ringkas.
 * formatDateShort(Date) → 'Hari ini', 'Kemarin', '12 Jan', '12 Jan 2023'
 */
export function formatDateShort(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return 'Hari ini';
  if (isSameDay(date, yesterday)) return 'Kemarin';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];

  if (date.getFullYear() === today.getFullYear()) {
    return `${day} ${month}`;
  }
  return `${day} ${month} ${date.getFullYear()}`;
}

/**
 * Format tanggal lengkap.
 * formatDateFull(Date) → 'Senin, 12 Januari 2024'
 */
export function formatDateFull(timestamp: number): string {
  const date = new Date(timestamp);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format waktu.
 * formatTime(Date) → '14:30'
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Format tanggal untuk group header SectionList.
 * formatSectionDate(Date) → 'Hari ini · Senin, 12 Jan'
 */
export function formatSectionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dateStr = `${dayName}, ${date.getDate()} ${monthName}`;

  if (isSameDay(date, today)) return `Hari ini \u00b7 ${dateStr}`;
  if (isSameDay(date, yesterday)) return `Kemarin \u00b7 ${dateStr}`;
  return dateStr;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/**
 * Format persentase.
 * formatPercent(0.75) → '75%'
 */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/**
 * Truncate teks panjang.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}\u2026`;
}
