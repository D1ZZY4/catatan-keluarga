import React from "react";
import { Bell, Layers, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData } from "@/app/AppDataContext";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import { useQuickActions } from "./useQuickActions";
import { QUICK_ACTION_META } from "./quickActionsConfig";
import type { AppOutletContext } from "@/app/AppShell";
import type { TransactionType } from "@/shared/types";

export function QuickActions({
  openTransactionForm,
  onScan,
}: {
  openTransactionForm: AppOutletContext["openTransactionForm"];
  onScan: () => void;
}) {
  const { actions } = useQuickActions();

  const handleAction = (type: string) => {
    if (type === "scan") {
      onScan();
    } else {
      openTransactionForm(type as TransactionType);
    }
  };

  return (
    <div
      className={cn(
        "grid gap-2.5 px-4",
        actions.length <= 4
          ? "grid-cols-4"
          : actions.length <= 6
            ? "grid-cols-3"
            : "grid-cols-4",
      )}
    >
      {actions.map((action) => {
        const meta = QUICK_ACTION_META[action.type];
        return (
          <button
            key={action.id}
            onClick={() => handleAction(action.type)}
            className="flex flex-col items-center gap-2.5 py-3.5 rounded-2xl bg-bg-card shadow-card active:scale-95 transition-transform"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: meta.iconBg }}
            >
              <DynamicIcon
                name={meta.iconName}
                size={19}
                strokeWidth={2}
                style={{ color: meta.iconColor }}
              />
            </div>
            <span className="text-[9px] font-semibold text-text-muted leading-none tracking-wide uppercase text-center px-1 line-clamp-1">
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function BudgetRow() {
  const { budgets, transactions, categories } = useAppData();
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).getTime();

  const budgetsWithSpending = budgets.map((budget) => {
    const spent = transactions
      .filter(
        (tx) =>
          tx.categoryId === budget.categoryId &&
          tx.date >= startOfMonth &&
          ["expense", "transfer_external"].includes(tx.type),
      )
      .reduce((s, tx) => s + tx.amount, 0);
    const cat = categories.find((c) => c.id === budget.categoryId);
    return { budget, spent, cat };
  });

  if (budgetsWithSpending.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Layers size={14} className="text-text-muted" />
          Anggaran Bulan Ini
        </h2>
        <Link
          to="/budgets"
          className="text-xs text-text-muted font-medium"
        >
          Kelola
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {budgetsWithSpending.map(({ budget, spent, cat }) => {
          const pct = budget.amount > 0 ? spent / budget.amount : 0;
          const isOver = pct >= 1;
          const isNear = pct > 0.8;
          return (
            <div
              key={budget.id}
              className={cn(
                "flex-shrink-0 w-[175px] rounded-2xl p-3.5 shadow-card border",
                isOver
                  ? "bg-danger/8 border-danger/25"
                  : isNear
                    ? "bg-warning/8 border-warning/25"
                    : "bg-bg-card border-transparent",
              )}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: cat
                      ? `${cat.color}22`
                      : "var(--bg-page)",
                  }}
                >
                  <DynamicIcon
                    name={cat?.icon ?? "Circle"}
                    size={15}
                    style={{ color: cat?.color ?? "var(--text-muted)" }}
                  />
                </div>
                <span className="text-xs font-semibold text-text-primary truncate flex-1">
                  {cat?.name ?? "Anggaran"}
                </span>
              </div>
              <ProgressBar
                value={spent}
                max={budget.amount}
                showPercentage
                height="sm"
                className="mb-2"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>{formatCurrency(spent, budget.currency)}</span>
                <span>{formatCurrency(budget.amount, budget.currency)}</span>
              </div>
            </div>
          );
        })}
        <Link
          to="/budgets"
          className="flex-shrink-0 w-[130px] border-2 border-dashed border-bg-card rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 text-text-muted active:bg-bg-card transition-colors"
        >
          <Plus size={16} />
          <span className="text-[10px] font-medium">Anggaran Baru</span>
        </Link>
      </div>
    </section>
  );
}

export function RemindersRow() {
  const { reminders } = useAppData();
  const today = new Date();

  const upcoming = reminders
    .filter((r) => r.isActive)
    .map((r) => {
      let dueDate: Date;
      if (r.period === "monthly") {
        dueDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          r.dueDay,
        );
        if (dueDate.getTime() < Date.now()) {
          dueDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            r.dueDay,
          );
        }
      } else {
        const diff = (r.dueDay - today.getDay() + 7) % 7;
        dueDate = new Date(today);
        dueDate.setDate(today.getDate() + diff);
      }
      return { reminder: r, dueDate };
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Bell size={14} className="text-warning" />
          Pengingat Tagihan
        </h2>
        <Link
          to="/settings/reminders"
          className="text-xs text-text-muted font-medium"
        >
          Lihat semua
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {upcoming.map(({ reminder, dueDate }) => {
          const daysLeft = Math.ceil(
            (dueDate.getTime() - Date.now()) / 86400000,
          );
          const isUrgent = daysLeft <= 3;
          return (
            <div
              key={reminder.id}
              className={cn(
                "flex-shrink-0 w-[160px] rounded-2xl p-3.5 shadow-card border",
                isUrgent
                  ? "bg-warning/10 border-warning/30"
                  : "bg-bg-card border-transparent",
              )}
            >
              <div
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mb-2",
                  isUrgent
                    ? "bg-warning/20 text-warning"
                    : "bg-bg-surface text-text-muted",
                )}
              >
                {daysLeft === 0
                  ? "Hari ini!"
                  : daysLeft === 1
                    ? "Besok"
                    : `${daysLeft} hari lagi`}
              </div>
              <p className="text-xs font-semibold text-text-primary truncate mb-1">
                {reminder.name}
              </p>
              {reminder.amount !== undefined && (
                <p className="text-sm font-bold font-display tabular-nums text-text-primary">
                  {formatCurrency(reminder.amount, reminder.currency)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
