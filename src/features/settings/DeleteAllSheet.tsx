import React, { useState } from "react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAuth } from "@/app/AuthContext";
import { useToast } from "@/shared/hooks/useToast";
import { db } from "@/shared/db/db";
import { hashPin } from "@/shared/crypto/crypto";

interface DeleteAllSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAllSheet({ isOpen, onClose }: DeleteAllSheetProps) {
  const { state } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<"confirm" | "pin">("confirm");
  const [confirmText, setConfirmText] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const hasPin = state.status === "unlocked" ? state.hasPin : false;

  const handleClose = () => {
    setStep("confirm");
    setConfirmText("");
    setPin("");
    onClose();
  };

  const verifyAndDelete = async () => {
    setLoading(true);
    try {
      if (hasPin) {
        const saltRow = await db.auth.get("salt");
        const storedHashRow = await db.auth.get("pinHash");
        if (!saltRow || !storedHashRow) {
          showToast("Gagal memverifikasi PIN.", "error");
          return;
        }
        const enteredHash = await hashPin(pin, saltRow.value);
        if (enteredHash !== storedHashRow.value) {
          showToast("PIN salah. Coba lagi.", "error");
          setPin("");
          return;
        }
      }
      await db.wallets.clear();
      await db.transactions.clear();
      await db.categories.clear();
      await db.budgets.clear();
      await db.reminders.clear();
      await db.price_cache.clear();
      await db.auth.clear();
      await db.settings.clear();
      await db.notifications_sent.clear();
      showToast("Semua data berhasil dihapus. Aplikasi akan dimuat ulang.", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showToast("Gagal menghapus data. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Hapus Semua Data">
      <div className="p-4 pb-10 space-y-4">
        <div className="bg-danger/8 border border-danger/25 rounded-2xl p-4">
          <p className="text-sm text-danger font-semibold mb-1">Tindakan ini tidak dapat dibatalkan</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Semua dompet, transaksi, anggaran, kategori, dan pengingat akan dihapus permanen dari perangkat ini.
          </p>
        </div>

        {step === "confirm" && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-text-primary font-semibold">
                Ketik <strong className="text-danger">HAPUS</strong> untuk melanjutkan
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Ketik HAPUS di sini"
                className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-danger/40"
                autoComplete="off"
              />
            </div>
            <button
              onClick={() => {
                if (confirmText !== "HAPUS") {
                  showToast("Ketik HAPUS terlebih dahulu", "error");
                  return;
                }
                if (hasPin) {
                  setStep("pin");
                } else {
                  void verifyAndDelete();
                }
              }}
              disabled={confirmText !== "HAPUS" || loading}
              className="w-full py-4 bg-danger text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              Lanjutkan
            </button>
          </>
        )}

        {step === "pin" && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-text-primary font-semibold">Konfirmasi PIN</p>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="Masukkan PIN Anda"
                className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-danger/40"
                autoFocus
              />
            </div>
            <button
              onClick={() => void verifyAndDelete()}
              disabled={pin.length < 4 || loading}
              className="w-full py-4 bg-danger text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {loading ? "Menghapus..." : "Hapus Semua Data"}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
