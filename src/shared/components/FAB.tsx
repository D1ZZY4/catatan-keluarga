import React, { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  ScanLine,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/misc";

export type FABAction = "income" | "expense" | "transfer" | "scan";

interface ActionCard {
  action: FABAction;
  label: string;
  sub: string;
  Icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  textClass: string;
}

const ACTIONS: ActionCard[] = [
  {
    action: "income",
    label: "Pemasukan",
    sub: "Uang masuk",
    Icon: TrendingUp,
    colorClass: "text-success",
    bgClass: "bg-success/15",
    textClass: "text-success",
  },
  {
    action: "expense",
    label: "Pengeluaran",
    sub: "Uang keluar",
    Icon: TrendingDown,
    colorClass: "text-danger",
    bgClass: "bg-danger/15",
    textClass: "text-danger",
  },
  {
    action: "transfer",
    label: "Transfer",
    sub: "Pindah dompet",
    Icon: ArrowLeftRight,
    colorClass: "text-accent-primary",
    bgClass: "bg-accent-primary/15",
    textClass: "text-accent-primary",
  },
  {
    action: "scan",
    label: "Scan Struk",
    sub: "Foto kwitansi",
    Icon: ScanLine,
    colorClass: "text-warning",
    bgClass: "bg-warning/15",
    textClass: "text-warning",
  },
];

interface FABProps {
  onAction: (action: FABAction) => void;
}

export function FAB({ onAction }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [isOpen]);

  const handleAction = (action: FABAction) => {
    setIsOpen(false);
    onAction(action);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[3px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-[80px] left-0 right-0 z-50 px-3 pointer-events-none">
        <div
          className={cn(
            "bg-bg-surface rounded-3xl shadow-2xl border border-black/[0.06] dark:border-white/10 overflow-hidden transition-all duration-300 ease-out pointer-events-auto",
            isOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-95 pointer-events-none",
          )}
        >
          <div className="p-3 pb-2">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider text-center mb-3">
              Catat Transaksi
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {ACTIONS.map((act) => (
                <button
                  key={act.action}
                  onClick={() => handleAction(act.action)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl active:scale-95 transition-all text-left",
                    act.bgClass,
                  )}
                  aria-label={act.label}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60 dark:bg-black/20",
                    )}
                  >
                    <act.Icon size={20} strokeWidth={2.2} className={act.colorClass} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-bold leading-tight", act.textClass)}>
                      {act.label}
                    </p>
                    <p className="text-[11px] text-text-muted leading-tight mt-0.5">{act.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="h-2 bg-bg-surface" />
        </div>
      </div>

      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed right-4 bottom-[calc(80px+12px)] z-50",
          "w-[58px] h-[58px] rounded-[18px] flex flex-col items-center justify-center text-white",
          "active:scale-90 transition-all duration-200",
          isOpen ? "bg-text-muted/80 shadow-lg" : "bg-accent-primary",
        )}
        style={
          isOpen
            ? undefined
            : {
                boxShadow:
                  "0 8px 28px rgba(140,192,235,0.55), 0 2px 8px rgba(140,192,235,0.30)",
              }
        }
        aria-label={isOpen ? "Tutup" : "Tambah transaksi"}
      >
        {isOpen ? (
          <X size={22} strokeWidth={2.5} />
        ) : (
          <>
            <Plus size={24} strokeWidth={2.5} />
            <span className="text-[9px] font-bold mt-0.5 tracking-wide leading-none opacity-90">
              CATAT
            </span>
          </>
        )}
      </button>
    </>
  );
}
