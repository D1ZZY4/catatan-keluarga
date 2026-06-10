import React from "react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAppData } from "@/app/AppDataContext";
import { cn } from "@/shared/utils/misc";

export type FilterPeriod = "all" | "today" | "week" | "month";
export type FilterType = "all" | "income" | "expense" | "transfer";

export interface FilterState {
  period: FilterPeriod;
  txType: FilterType;
  walletId: string;
  search: string;
}

interface TransactionFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filter: FilterState;
  onFilter: (f: FilterState) => void;
  activeFilterCount: number;
}

export function TransactionFilterSheet({
  isOpen,
  onClose,
  filter,
  onFilter,
  activeFilterCount,
}: TransactionFilterSheetProps) {
  const { wallets } = useAppData();

  const TX_TYPES: { id: FilterType; label: string }[] = [
    { id: "all", label: "Semua Jenis" },
    { id: "income", label: "Pemasukan" },
    { id: "expense", label: "Pengeluaran" },
    { id: "transfer", label: "Transfer" },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filter">
      <div className="p-4 space-y-5 pb-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Jenis Transaksi</p>
          <div className="grid grid-cols-2 gap-2">
            {TX_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => onFilter({ ...filter, txType: t.id })}
                className={cn(
                  "flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  filter.txType === t.id
                    ? "bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/30"
                    : "bg-bg-card text-text-primary",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Dompet</p>
          <div className="flex flex-col gap-1">
            {[{ id: "all", name: "Semua Dompet" }, ...wallets].map((w) => (
              <button
                key={w.id}
                onClick={() => onFilter({ ...filter, walletId: w.id })}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  filter.walletId === w.id
                    ? "bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/30"
                    : "bg-bg-card text-text-primary",
                )}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={() => { onFilter({ ...filter, txType: "all", walletId: "all" }); onClose(); }}
              className="flex-1 py-3 bg-bg-card text-text-muted rounded-2xl text-sm font-semibold"
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-accent-primary text-white rounded-2xl text-sm font-semibold"
          >
            Terapkan
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
