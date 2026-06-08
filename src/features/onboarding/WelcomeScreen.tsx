import React, { useEffect, useState } from "react";
import { Banknote, Building2, PiggyBank } from "lucide-react";

interface WalletPreview {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const DEFAULT_WALLET_PREVIEWS: WalletPreview[] = [
  { name: "Tunai", icon: <Banknote size={20} className="text-white" />, color: "#4CAF50" },
  { name: "Bank", icon: <Building2 size={20} className="text-white" />, color: "#8CC0EB" },
  { name: "Tabungan", icon: <PiggyBank size={20} className="text-white" />, color: "#F4A35A" },
];

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

function ConfettiCanvas() {
  const [pieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#8CC0EB", "#F4A35A", "#4CAF50", "#D81B60", "#FBC02D", "#8E24AA"][i % 6] ?? "#8CC0EB",
      delay: Math.random() * 1.2,
      duration: 1.8 + Math.random() * 1.4,
      size: 6 + Math.random() * 8,
    })),
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

interface WelcomeScreenProps {
  userName: string;
  onContinue: () => void;
}

export function WelcomeScreen({ userName, onContinue }: WelcomeScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-bg-page flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <ConfettiCanvas />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full text-center">
        <div
          className="transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "0ms",
          }}
        >
          <div className="w-20 h-20 rounded-3xl bg-accent-primary flex items-center justify-center shadow-fab mx-auto mb-4">
            <span className="text-white font-bold text-2xl font-display">CK</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary font-display leading-snug">
            Selamat datang,<br />{userName}!
          </h1>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            Semua siap. Tiga dompet default sudah dibuat untuk Anda.
          </p>
        </div>

        <div
          className="w-full flex flex-col gap-3 transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "150ms",
          }}
        >
          {DEFAULT_WALLET_PREVIEWS.map((w, i) => (
            <div
              key={w.name}
              className="flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3 shadow-card transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transitionDelay: `${200 + i * 80}ms`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: w.color }}
              >
                {w.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-text-primary">{w.name}</p>
                <p className="text-xs text-text-muted font-mono">Rp 0</p>
              </div>
              <span className="text-xs text-text-muted bg-bg-surface px-2 py-1 rounded-full">Siap</span>
            </div>
          ))}
        </div>

        <div
          className="w-full transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "500ms",
          }}
        >
          <button
            onClick={onContinue}
            className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold text-base active:scale-[0.98] transition-transform shadow-fab mt-2"
          >
            Jelajahi Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
}
