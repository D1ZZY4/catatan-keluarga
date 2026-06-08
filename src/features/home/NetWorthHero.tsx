import React, { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";

interface NetWorthHeroProps {
  userName: string;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export function NetWorthHero({
  userName,
  netWorth,
  monthlyIncome,
  monthlyExpense,
}: NetWorthHeroProps) {
  const [visible, setVisible] = useState(true);
  const now = new Date();
  const monthName = now.toLocaleString("id-ID", { month: "long" });

  return (
    <div className="relative overflow-hidden">
      <div
        className="px-4 pt-14 pb-6"
        style={{ background: "linear-gradient(170deg, var(--bg-card) 0%, var(--bg-page) 100%)" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[13px] font-semibold text-text-primary">
              Halo, <span className="text-warning font-bold">{userName}</span>
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {monthName} {now.getFullYear()}
            </p>
          </div>
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-[10px] font-semibold text-text-muted bg-bg-surface/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-black/[0.06] active:opacity-60 transition-opacity"
            aria-label={visible ? "Sembunyikan saldo" : "Tampilkan saldo"}
          >
            {visible ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        <p className="text-[10px] text-text-muted font-semibold mb-1 tracking-widest uppercase">
          Total kekayaan bersih
        </p>
        <p className="text-[40px] font-bold font-display text-text-primary tabular-nums leading-none tracking-tight mb-5">
          {visible ? formatCurrency(netWorth, "IDR") : "Rp ••••••"}
        </p>

        <div className="flex gap-3">
          <div className="flex-1 bg-bg-surface/60 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-success/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={11} className="text-success" />
              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">Masuk</p>
            </div>
            <p className="text-[14px] font-bold font-display tabular-nums text-success leading-none">
              {visible ? formatCurrency(monthlyIncome, "IDR") : "••••"}
            </p>
          </div>
          <div className="flex-1 bg-bg-surface/60 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-danger/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={11} className="text-danger" />
              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">Keluar</p>
            </div>
            <p className="text-[14px] font-bold font-display tabular-nums text-danger leading-none">
              {visible ? formatCurrency(monthlyExpense, "IDR") : "••••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
