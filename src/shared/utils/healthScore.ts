/**
 * Algoritma skor kesehatan keuangan (0-100).
 * Rule-based — tidak ada ML, tidak ada API.
 * Dimigrasi 1:1 dari old-code/src-backup/shared/utils/healthScore.ts
 */

import type { Transaction, Budget, Wallet } from '../types';
import { INCOME_TYPES, EXPENSE_TYPES } from '../constants/transactionTypes';

export interface HealthScoreResult {
  score: number;          // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  components: HealthScoreComponents;
}

interface HealthScoreComponents {
  savingsRate: number;    // 0-30 poin
  budgetAdherence: number; // 0-25 poin
  transactionConsistency: number; // 0-20 poin
  debtRatio: number;      // 0-15 poin
  emergencyFund: number;  // 0-10 poin
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function computeHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  wallets: Wallet[],
): HealthScoreResult {
  const now = Date.now();
  const monthStart = now - MONTH_MS;
  const monthTxs = transactions.filter((t) => t.date >= monthStart);

  const monthIncome = monthTxs
    .filter((t) => INCOME_TYPES.includes(t.type))
    .reduce((s, t) => s + t.amount, 0);

  const monthExpense = monthTxs
    .filter((t) => EXPENSE_TYPES.includes(t.type))
    .reduce((s, t) => s + t.amount, 0);

  // 1. Savings rate (0-30 poin)
  let savingsRate = 0;
  if (monthIncome > 0) {
    const rate = (monthIncome - monthExpense) / monthIncome;
    if (rate >= 0.3) savingsRate = 30;
    else if (rate >= 0.2) savingsRate = 24;
    else if (rate >= 0.1) savingsRate = 16;
    else if (rate >= 0) savingsRate = 8;
    else savingsRate = 0;
  }

  // 2. Budget adherence (0-25 poin)
  let budgetAdherence = 25;
  if (budgets.length > 0) {
    // Simplified: full score jika ada budgets dan expense < income
    if (monthExpense > monthIncome) budgetAdherence = 5;
    else if (monthExpense > monthIncome * 0.9) budgetAdherence = 15;
    else budgetAdherence = 25;
  }

  // 3. Transaction consistency (0-20 poin)
  const uniqueDays = new Set(
    monthTxs.map((t) => new Date(t.date).toDateString()),
  ).size;
  let transactionConsistency = 0;
  if (uniqueDays >= 20) transactionConsistency = 20;
  else if (uniqueDays >= 15) transactionConsistency = 15;
  else if (uniqueDays >= 10) transactionConsistency = 10;
  else if (uniqueDays >= 5) transactionConsistency = 5;

  // 4. Debt ratio (0-15 poin)
  const debtTxs = monthTxs.filter((t) => t.type === 'debt_received');
  const debtAmount = debtTxs.reduce((s, t) => s + t.amount, 0);
  let debtRatio = 15;
  if (monthIncome > 0) {
    const ratio = debtAmount / monthIncome;
    if (ratio > 0.5) debtRatio = 0;
    else if (ratio > 0.3) debtRatio = 5;
    else if (ratio > 0.1) debtRatio = 10;
    else debtRatio = 15;
  }

  // 5. Emergency fund (0-10 poin)
  const totalBalance = wallets
    .filter((w) => !w.isArchived && w.includeInTotal)
    .reduce((s, w) => s + w.balance, 0);
  let emergencyFund = 0;
  if (monthExpense > 0) {
    const months = totalBalance / (monthExpense || 1);
    if (months >= 6) emergencyFund = 10;
    else if (months >= 3) emergencyFund = 7;
    else if (months >= 1) emergencyFund = 4;
  }

  const score = Math.min(
    100,
    savingsRate + budgetAdherence + transactionConsistency + debtRatio + emergencyFund,
  );

  let grade: HealthScoreResult['grade'];
  let color: string;

  if (score >= 80) { grade = 'A'; color = '#2e7d32'; }
  else if (score >= 65) { grade = 'B'; color = '#558b2f'; }
  else if (score >= 50) { grade = 'C'; color = '#e65100'; }
  else if (score >= 35) { grade = 'D'; color = '#c62828'; }
  else { grade = 'F'; color = '#c62828'; }

  return {
    score,
    grade,
    color,
    components: {
      savingsRate,
      budgetAdherence,
      transactionConsistency,
      debtRatio,
      emergencyFund,
    },
  };
}
