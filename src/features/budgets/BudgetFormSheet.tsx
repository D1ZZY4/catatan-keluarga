import React, { useState } from "react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { useToast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/utils/misc";
import type { Budget, Category } from "@/shared/types";

interface BudgetFormState {
  categoryId: string;
  amountRaw: string;
  amount: number;
  currency: string;
  period: "monthly" | "weekly";
  notifyAt: number;
}

function defaultForm(): BudgetFormState {
  return {
    categoryId: "",
    amountRaw: "",
    amount: 0,
    currency: "IDR",
    period: "monthly",
    notifyAt: 80,
  };
}

interface BudgetFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editBudget?: Budget;
  categories: Category[];
  existingCategoryIds: Set<string>;
  onSave: (data: Omit<Budget, "id" | "createdAt">) => Promise<void>;
}

export function BudgetFormSheet({
  isOpen,
  onClose,
  editBudget,
  categories,
  existingCategoryIds,
  onSave,
}: BudgetFormSheetProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<BudgetFormState>(() => {
    if (editBudget) {
      return {
        categoryId: editBudget.categoryId,
        amountRaw: String(editBudget.amount),
        amount: editBudget.amount,
        currency: editBudget.currency,
        period: editBudget.period,
        notifyAt: editBudget.notifyAt,
      };
    }
    return defaultForm();
  });
  const [loading, setLoading] = useState(false);

  const availableCategories = categories.filter(
    (c) =>
      c.type !== "income" &&
      (!existingCategoryIds.has(c.id) || c.id === editBudget?.categoryId),
  );

  const handleSave = async () => {
    if (!form.categoryId) {
      showToast("Pilih kategori terlebih dahulu", "error");
      return;
    }
    if (form.amount <= 0) {
      showToast("Masukkan jumlah anggaran", "error");
      return;
    }
    setLoading(true);
    try {
      await onSave({
        categoryId: form.categoryId,
        amount: form.amount,
        currency: form.currency,
        period: form.period,
        notifyAt: form.notifyAt,
      });
      onClose();
    } catch {
      showToast("Gagal menyimpan anggaran", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editBudget ? "Edit Anggaran" : "Tambah Anggaran"}
      fullHeight
    >
      <div className="p-4 space-y-5 pb-8">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Kategori
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setForm((s) => ({ ...s, categoryId: cat.id }))}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                  form.categoryId === cat.id
                    ? "border-accent-primary bg-accent-primary/10"
                    : "border-bg-card bg-bg-card",
                )}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}22` }}>
                  <DynamicIcon name={cat.icon} size={16} style={{ color: cat.color }} />
                </div>
                <span className="text-[10px] text-text-muted leading-tight line-clamp-2">{cat.name}</span>
              </button>
            ))}
          </div>
          {availableCategories.length === 0 && (
            <p className="text-xs text-text-muted text-center py-4">
              Semua kategori sudah memiliki anggaran
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Batas Anggaran
          </label>
          <CurrencyInput
            value={form.amountRaw}
            onChange={(raw, evaluated) => {
              setForm((s) => ({
                ...s,
                amountRaw: raw,
                ...(evaluated !== null ? { amount: evaluated } : {}),
              }));
            }}
            currency={form.currency}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Periode
          </label>
          <div className="flex gap-2">
            {(["monthly", "weekly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setForm((s) => ({ ...s, period: p }))}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                  form.period === p
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "bg-bg-card text-text-primary border-bg-card",
                )}
              >
                {p === "monthly" ? "Bulanan" : "Mingguan"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Notifikasi saat
            </label>
            <span className="text-sm font-bold text-accent-primary">{form.notifyAt}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={form.notifyAt}
            onChange={(e) => setForm((s) => ({ ...s, notifyAt: parseInt(e.target.value) }))}
            className="w-full accent-accent-primary h-2"
          />
          <p className="text-xs text-text-muted">
            Kirim notifikasi ketika pengeluaran mencapai {form.notifyAt}% dari batas
          </p>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={loading || form.amount <= 0 || !form.categoryId}
          className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab"
        >
          {loading ? "Menyimpan…" : editBudget ? "Simpan Perubahan" : "Tambah Anggaran"}
        </button>
      </div>
    </BottomSheet>
  );
}
