import type { Transaction, Budget, Category } from "@/shared/types";

export interface HealthScoreBreakdown {
  score: number;
  savingsScore: number;
  budgetScore: number;
  frequencyScore: number;
  diversityScore: number;
  savingsRate: number;
  label: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian";
}

const INCOME_TYPES = ["income", "debt_received", "savings_withdraw", "invest_sell"];
const EXPENSE_TYPES = ["expense", "transfer_external", "debt_given", "savings_deposit", "invest_buy"];

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function computeHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  _categories: Category[],
): HealthScoreBreakdown {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 86400000;
  const recent = transactions.filter((tx) => tx.date >= thirtyDaysAgo);

  const income = recent
    .filter((tx) => INCOME_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);
  const expense = recent
    .filter((tx) => EXPENSE_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const savingsRate = income > 0 ? Math.max(0, (income - expense) / income) : 0;
  const savingsScore = clamp(Math.round((savingsRate / 0.2) * 30), 0, 30);

  let budgetScore = 30;
  if (budgets.length > 0) {
    const now2 = new Date();
    const startOfMonth = new Date(now2.getFullYear(), now2.getMonth(), 1).getTime();
    const compliant = budgets.filter((b) => {
      const spent = transactions
        .filter((tx) => tx.categoryId === b.categoryId && tx.date >= startOfMonth && EXPENSE_TYPES.includes(tx.type))
        .reduce((s, tx) => s + tx.amount, 0);
      return spent <= b.amount;
    });
    budgetScore = Math.round((compliant.length / budgets.length) * 30);
  }

  const daysWithTx = new Set(
    recent.map((tx) => new Date(tx.date).toDateString()),
  ).size;
  const weeksInPeriod = 4.3;
  const avgPerWeek = daysWithTx / weeksInPeriod;
  const frequencyScore = clamp(Math.round((avgPerWeek / 5) * 20), 0, 20);

  const uniqueCats = new Set(recent.map((tx) => tx.categoryId)).size;
  const diversityScore = clamp(Math.round((uniqueCats / 5) * 20), 0, 20);

  const score = savingsScore + budgetScore + frequencyScore + diversityScore;

  const label =
    score >= 80
      ? "Sangat Baik"
      : score >= 60
        ? "Baik"
        : score >= 40
          ? "Cukup"
          : "Perlu Perhatian";

  return {
    score,
    savingsScore,
    budgetScore,
    frequencyScore,
    diversityScore,
    savingsRate,
    label,
  };
}
