import React, { useState } from "react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAuth } from "@/app/AuthContext";
import { useToast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/utils/misc";

interface PINSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "setup" | "change" | "remove";
}

export function PINSheet({ isOpen, onClose, mode }: PINSheetProps) {
  const { setupPin, changePin, removePin } = useAuth();
  const { showToast } = useToast();
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (mode === "remove") {
      setLoading(true);
      await removePin();
      showToast("PIN berhasil dihapus", "success");
      setLoading(false);
      onClose();
      return;
    }
    if (newPin.length < 4) {
      showToast("PIN minimal 4 digit", "error");
      return;
    }
    if (newPin !== confirmPin) {
      showToast("PIN tidak cocok", "error");
      return;
    }
    setLoading(true);
    try {
      if (mode === "setup") {
        await setupPin(newPin);
        showToast("PIN berhasil diatur", "success");
      } else {
        const ok = await changePin(oldPin, newPin);
        if (!ok) {
          showToast("PIN lama salah", "error");
          setLoading(false);
          return;
        }
        showToast("PIN berhasil diubah", "success");
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "setup" ? "Buat PIN" : mode === "change" ? "Ganti PIN" : "Hapus PIN";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4 space-y-3 pb-8">
        {mode === "change" && (
          <input
            type="password"
            inputMode="numeric"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="PIN lama"
            className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
          />
        )}
        {mode !== "remove" && (
          <>
            <input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder={mode === "setup" ? "Buat PIN baru (4-8 digit)" : "PIN baru (4-8 digit)"}
              className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            />
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Ulangi PIN baru"
              className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            />
          </>
        )}
        {mode === "remove" && (
          <p className="text-sm text-text-muted bg-bg-card rounded-2xl px-4 py-3 leading-relaxed">
            Menghapus PIN akan menonaktifkan kunci otomatis. Data tetap tersimpan dan aman.
          </p>
        )}
        <button
          onClick={() => void handleSave()}
          disabled={loading}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab",
            mode === "remove" ? "bg-danger text-white" : "bg-accent-primary text-white",
          )}
        >
          {loading
            ? "Memproses..."
            : mode === "remove"
              ? "Hapus PIN"
              : mode === "setup"
                ? "Buat PIN"
                : "Ganti PIN"}
        </button>
      </div>
    </BottomSheet>
  );
}
