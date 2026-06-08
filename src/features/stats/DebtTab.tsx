import React, { useMemo } from "react";
import { Check, Users } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAppData } from "@/app/AppDataContext";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { AppOutletContext } from "@/app/AppShell";

export function DebtTab() {
  const { transactions } = useAppData();
  const { openTransactionForm } = useOutletContext<AppOutletContext>();

  const debtMap = useMemo(() => {
    const map: Record<
      string,
      { name: string; given: number; received: number; repaid: number; txIds: string[] }
    > = {};

    for (const tx of transactions) {
      if (!["debt_given", "debt_received", "debt_repay"].includes(tx.type)) continue;
      const person = tx.linkedPersonName ?? "Tidak diketahui";
      if (!(person in map)) {
        map[person] = { name: person, given: 0, received: 0, repaid: 0, txIds: [] };
      }
      const entry = map[person];
      if (entry === undefined) continue;
      entry.txIds.push(tx.id);
      if (tx.type === "debt_given") entry.given += tx.amount;
      else if (tx.type === "debt_received") entry.received += tx.amount;
      else if (tx.type === "debt_repay") entry.repaid += tx.amount;
    }

    return Object.values(map).filter((e) => e.given > 0 || e.received > 0);
  }, [transactions]);

  const debtTx = transactions.filter((tx) =>
    ["debt_given", "debt_received"].includes(tx.type),
  );

  if (debtTx.length === 0) {
    return (
      <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center">
          <Users size={28} className="text-text-muted" />
        </div>
        <p className="text-sm font-semibold text-text-primary">Tidak ada hutang/piutang</p>
        <p className="text-xs text-text-muted max-w-xs">
          Catat transaksi piutang atau hutang untuk melihat rekap di sini
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-warning/10 rounded-xl p-3">
          <p className="text-[10px] text-text-muted">Total Piutang</p>
          <p className="text-sm font-bold text-warning tabular-nums">
            {formatCurrency(debtMap.reduce((s, e) => s + Math.max(0, e.given - e.repaid), 0), "IDR")}
          </p>
        </div>
        <div className="bg-danger/10 rounded-xl p-3">
          <p className="text-[10px] text-text-muted">Total Hutang</p>
          <p className="text-sm font-bold text-danger tabular-nums">
            {formatCurrency(debtMap.reduce((s, e) => s + Math.max(0, e.received - e.repaid), 0), "IDR")}
          </p>
        </div>
      </div>

      {debtMap.map((entry) => {
        const net = entry.given - entry.received - entry.repaid;
        const isOwedToMe = net > 0;
        const outstanding = Math.abs(net);

        return (
          <div key={entry.name} className="bg-bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center text-sm font-bold text-warning">
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{entry.name}</p>
                  <p className={cn("text-xs font-medium", isOwedToMe ? "text-warning" : "text-danger")}>
                    {isOwedToMe ? "Piutang" : "Hutang"}
                  </p>
                </div>
              </div>
              <p className={cn("text-sm font-bold tabular-nums", isOwedToMe ? "text-warning" : "text-danger")}>
                {formatCurrency(outstanding, "IDR")}
              </p>
            </div>

            <div className="flex gap-3 text-[11px] text-text-muted mb-3">
              {entry.given > 0 && <span>Dipinjamkan: {formatCurrency(entry.given, "IDR")}</span>}
              {entry.received > 0 && <span>Dipinjam: {formatCurrency(entry.received, "IDR")}</span>}
              {entry.repaid > 0 && <span>Terlunasi: {formatCurrency(entry.repaid, "IDR")}</span>}
            </div>

            {outstanding > 0 && (
              <button
                onClick={() => { openTransactionForm("debt_repay"); }}
                className="w-full py-2 bg-success/15 text-success rounded-lg text-xs font-semibold active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <Check size={13} />
                Tandai Lunas
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
