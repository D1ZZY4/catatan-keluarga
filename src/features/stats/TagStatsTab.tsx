import React, { useMemo } from "react";
import { useAppData } from "@/app/AppDataContext";
import { formatCurrency } from "@/shared/utils/format";
import { EXPENSE_TYPES, INCOME_TYPES } from "@/shared/constants/transactionTypes";
import { cn } from "@/shared/utils/misc";

interface TagStat {
  tag: string;
  totalExpense: number;
  totalIncome: number;
  count: number;
}

export function TagStatsTab() {
  const { transactions } = useAppData();

  const tagStats = useMemo<TagStat[]>(() => {
    const map = new Map<string, TagStat>();
    for (const tx of transactions) {
      for (const tag of tx.tags ?? []) {
        const stat = map.get(tag) ?? { tag, totalExpense: 0, totalIncome: 0, count: 0 };
        stat.count++;
        if (EXPENSE_TYPES.includes(tx.type)) stat.totalExpense += tx.amount;
        else if (INCOME_TYPES.includes(tx.type)) stat.totalIncome += tx.amount;
        map.set(tag, stat);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalExpense + b.totalIncome - (a.totalExpense + a.totalIncome));
  }, [transactions]);

  if (tagStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <svg viewBox="0 0 80 80" className="w-20 h-20 mb-4 opacity-40" fill="none">
          <rect x="10" y="28" width="46" height="28" rx="8" fill="var(--accent-secondary)" opacity="0.4" />
          <path d="M56 28l10-10" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="62" cy="18" r="4" fill="var(--accent-warm)" />
        </svg>
        <p className="text-text-muted text-sm">Belum ada tag pada transaksi</p>
        <p className="text-text-muted/60 text-xs mt-1">Tambahkan tag saat mencatat transaksi</p>
      </div>
    );
  }

  const maxValue = Math.max(...tagStats.map((t) => t.totalExpense + t.totalIncome), 1);

  return (
    <div className="px-4 py-4 space-y-3 pb-32">
      {tagStats.map((stat) => {
        const total = stat.totalExpense + stat.totalIncome;
        const barWidth = (total / maxValue) * 100;
        return (
          <div key={stat.tag} className="bg-bg-card rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
                  #{stat.tag}
                </span>
                <span className="text-xs text-text-muted">{stat.count} transaksi</span>
              </div>
              <span className="text-xs font-mono text-text-muted">{formatCurrency(total)}</span>
            </div>

            <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-accent-primary rounded-full transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <div className="flex justify-between text-xs">
              {stat.totalExpense > 0 && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-danger/70" />
                  <span className="text-text-muted">Keluar</span>
                  <span className={cn("font-mono font-medium", "text-danger")}>{formatCurrency(stat.totalExpense)}</span>
                </div>
              )}
              {stat.totalIncome > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-success/70" />
                  <span className="text-text-muted">Masuk</span>
                  <span className="font-mono font-medium text-success">{formatCurrency(stat.totalIncome)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
