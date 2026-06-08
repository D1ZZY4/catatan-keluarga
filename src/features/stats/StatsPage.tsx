import React, { useState } from "react";
import { AppBar } from "@/shared/components/AppBar";
import { EmptyState, StatsEmptyIllustration } from "@/shared/components/EmptyState";
import { useAppData } from "@/app/AppDataContext";
import { cn } from "@/shared/utils/misc";
import {
  Period, StatsTab, PERIOD_LABELS,
  dateToInputValue, inputValueToTs,
} from "./StatsUtils";
import { OverviewTab } from "./OverviewTab";
import { DebtTab } from "./DebtTab";

export function StatsPage() {
  const { transactions } = useAppData();
  const [period, setPeriod] = useState<Period>("month");
  const [activeTab, setActiveTab] = useState<StatsTab>("overview");
  const [customStart, setCustomStart] = useState<number>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  const [customEnd, setCustomEnd] = useState<number>(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  });

  if (transactions.length === 0) {
    return (
      <>
        <AppBar title="Statistik" />
        <EmptyState
          illustration={<StatsEmptyIllustration />}
          title="Belum ada data"
          description="Tambahkan transaksi untuk melihat statistik keuangan kamu"
        />
      </>
    );
  }

  return (
    <>
      <AppBar title="Statistik" />

      <div className="flex border-b border-bg-card">
        {(["overview", "debt"] as StatsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-all border-b-2",
              activeTab === tab
                ? "text-accent-primary border-accent-primary"
                : "text-text-muted border-transparent",
            )}
          >
            {tab === "overview" ? "Ringkasan" : "Hutang & Piutang"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar border-b border-bg-card">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                  period === p ? "bg-accent-primary text-white" : "bg-bg-card text-text-muted",
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border-b border-bg-card">
              <div className="flex-1">
                <p className="text-[10px] text-text-muted mb-1">Dari tanggal</p>
                <input
                  type="date"
                  value={dateToInputValue(customStart)}
                  onChange={(e) => { if (e.target.value) setCustomStart(inputValueToTs(e.target.value)); }}
                  className="w-full bg-bg-surface rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/40"
                />
              </div>
              <div className="w-4 h-px bg-text-muted/40 flex-shrink-0 mt-4" />
              <div className="flex-1">
                <p className="text-[10px] text-text-muted mb-1">Sampai tanggal</p>
                <input
                  type="date"
                  value={dateToInputValue(customEnd)}
                  onChange={(e) => { if (e.target.value) setCustomEnd(inputValueToTs(e.target.value, true)); }}
                  className="w-full bg-bg-surface rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/40"
                />
              </div>
            </div>
          )}

          <OverviewTab
            period={period}
            {...(period === "custom" ? { customStart, customEnd } : {})}
          />
        </>
      )}

      {activeTab === "debt" && <DebtTab />}
    </>
  );
}
