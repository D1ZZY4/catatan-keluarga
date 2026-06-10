/**
 * Math utilities — evaluasi ekspresi kalkulator.
 */

/**
 * Evaluasi ekspresi matematika dari input user.
 * Menggunakan mathjs untuk keamanan (tidak eval).
 * evaluateExpression('100 + 50 * 2') → 200
 */
export async function evaluateExpression(expr: string): Promise<number | null> {
  if (!expr || expr.trim() === '') return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { evaluate } = require('mathjs') as { evaluate: (expr: string) => number };
    const result = evaluate(expr.replace(/,/g, '.').replace(/x/g, '*'));
    if (typeof result === 'number' && isFinite(result)) return result;
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse input angka dari string — handle format lokal Indonesia.
 * parseAmount('1.500.000') → 1500000
 * parseAmount('1,5') → 1.5
 */
export function parseAmount(raw: string): number {
  // Remove thousand separators (dots) and replace comma with dot for decimal
  const cleaned = raw.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/**
 * Apakah string adalah ekspresi matematika valid?
 */
export function isExpression(input: string): boolean {
  return /[+\-*/]/.test(input);
}
