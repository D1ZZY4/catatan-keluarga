/**
 * Misc utilities.
 */

/** Generate ID unik sederhana (cukup untuk offline-only app) */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Combine class names (NativeWind cn helper) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Delay async */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Group array by key */
export function groupBy<T>(
  arr: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {});
}

/** Sort array of objects by key */
export function sortBy<T>(
  arr: T[],
  keyFn: (item: T) => number | string,
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  return [...arr].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    if (ka < kb) return direction === 'asc' ? -1 : 1;
    if (ka > kb) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/** Check if a value is defined (not null or undefined) */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Debounce a function */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
