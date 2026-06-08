import React, { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useAppData } from "@/app/AppDataContext";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import {
  Period, getPeriodStart, isIncome, isExpense,
  getMonthKey, getDayKey, last6Months,
} from "./StatsUtils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-bg-surface rounded-xl shadow-fab px-3 py-2 text-xs space-y-1">
      {label !== undefined && <p className="font-semibold text-text-muted">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, "IDR")}
        </p>
      ))}
    </div>
  );
}

interface OverviewTabProps {
  period: Period;
  customStart?: number;
  customEnd?: number;
}

export function OverviewTab({ period, customStart, customEnd }: OverviewTabProps) {
  const { transactions, categories, wallets } = useAppData();

  const periodStart = period === "custom"
    ? (customStart ?? getPeriodStart("month"))
    : getPeriodStart(period);
  const periodEnd = period === "custom" ? (customEnd ?? Date.now()) : Date.now();

  const filtered = useMemo(
    () => transactions.filter((tx) => tx.date >= periodStart && tx.date <= periodEnd),
    [transactions, periodStart, periodEnd],
  );

  const totalIncome = filtered.filter(isIncome).reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = filtered.filter(isExpense).reduce((s, tx) => s + tx.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const daysInPeriod = Math.max(1, Math.ceil((periodEnd - periodStart) / 86400000));
  const avgDailyExpense = totalExpense / daysInPeriod;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of filtered.filter(isExpense)) {
      const cat = categories.find((c) => c.id === tx.categoryId);
      const key = cat?.name ?? "Lain-lain";
      map[key] = (map[key] ?? 0) + tx.amount;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => {
        const cat = categories.find((c) => c.name === name);
        return { name, value, color: cat?.color ?? "#E65100" };
      });
  }, [filtered, categories]);

  const monthlyData = useMemo(() => {
    const months = last6Months();
    const map: Record<string, { income: number; expense: number }> = {};
    for (const m of months) map[m] = { income: 0, expense: 0 };
    for (const tx of transactions.filter((tx) => tx.date >= getPeriodStart("6months"))) {
      const key = getMonthKey(tx.date);
      if (!(key in map)) continue;
      const row = map[key];
      if (row === undefined) continue;
      if (isIncome(tx)) row.income += tx.amount;
      else if (isExpense(tx)) row.expense += tx.amount;
    }
    return months.map((m) => {
      const row = map[m];
      return { name: m, Pemasukan: row?.income ?? 0, Pengeluaran: row?.expense ?? 0 };
    });
  }, [transactions]);

  const dailyExpenseData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    for (const tx of filtered.filter(isExpense)) {
      const key = getDayKey(tx.date);
      dayMap[key] = (dayMap[key] ?? 0) + tx.amount;
    }
    return Object.entries(dayMap)
      .slice(-14)
      .map(([name, value]) => ({ name, Pengeluaran: value }));
  }, [filtered]);

  const balanceOverTime = useMemo(() => {
    const months = last6Months();
    return months.map((m, i) => {
      const untilDate = new Date();
      untilDate.setDate(1);
      untilDate.setMonth(new Date().getMonth() - (5 - i) + 1);
      const bal = wallets
        .filter((w) => !w.isArchived)
        .reduce((s, w) => {
          const walletBal = transactions
            .filter((tx) => tx.date < untilDate.getTime())
            .reduce((acc, tx) => {
              if (tx.walletId === w.id) {
                if (isIncome(tx)) return acc + tx.amount;
                if (isExpense(tx) || tx.type === "transfer_internal") return acc - tx.amount;
              }
              if (tx.toWalletId === w.id && tx.type === "transfer_internal") return acc + tx.amount;
              return acc;
            }, w.initialBalance);
          return s + walletBal;
        }, 0);
      return { name: m, "Total Aset": bal };
    });
  }, [wallets, transactions]);

  return (
    <div className="space-y-5 pb-4">
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        {[
          { label: "Pemasukan", value: formatCurrency(totalIncome, "IDR"), color: "text-success" },
          { label: "Pengeluaran", value: formatCurrency(totalExpense, "IDR"), color: "text-danger" },
          { label: "Selisih", value: formatCurrency(netBalance, "IDR"), color: netBalance >= 0 ? "text-success" : "text-danger" },
          { label: "Rata-rata/Hari", value: formatCurrency(avgDailyExpense, "IDR"), color: "text-warning" },
        ].map((m) => (
          <div key={m.label} className="bg-bg-card rounded-xl p-3 shadow-card">
            <p className="text-[10px] text-text-muted mb-1">{m.label}</p>
            <p className={cn("text-sm font-bold font-display tabular-nums leading-tight", m.color)}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {expenseByCategory.length > 0 && (
        <section className="px-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Pengeluaran per Kategori</h2>
          <div className="bg-bg-card rounded-xl p-3 shadow-card">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} animationBegin={0}>
                  {expenseByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {expenseByCategory.slice(0, 6).map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] text-text-muted truncate">{entry.name}</span>
                  <span className="text-[10px] font-semibold text-text-primary ml-auto flex-shrink-0">
                    {formatNumber(entry.value / 1000, 0)}k
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {dailyExpenseData.length > 1 && (
        <section className="px-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Tren Pengeluaran Harian</h2>
          <div className="bg-bg-card rounded-xl p-3 shadow-card">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dailyExpenseData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-page)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Pengeluaran" fill="var(--danger)" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="px-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Pemasukan vs Pengeluaran (6 Bulan)</h2>
        <div className="bg-bg-card rounded-xl p-3 shadow-card">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-page)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Pemasukan" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="px-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Tren Total Aset</h2>
        <div className="bg-bg-card rounded-xl p-3 shadow-card">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={balanceOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-page)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Total Aset" stroke="var(--success)" fill="url(#assetGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="px-4">
        <div className="bg-bg-card rounded-xl p-4 shadow-card">
          <p className="text-xs text-text-muted mb-1">Tingkat Tabungan</p>
          <p className={cn("text-2xl font-bold font-display tabular-nums", savingsRate >= 0 ? "text-success" : "text-danger")}>
            {savingsRate}%
          </p>
          <p className="text-xs text-text-muted mt-1">
            {savingsRate >= 20
              ? "Bagus! Kamu menabung dengan baik."
              : savingsRate >= 0
                ? "Coba tingkatkan tabungan kamu."
                : "Pengeluaran melebihi pemasukan."}
          </p>
        </div>
      </div>
    </div>
  );
}
