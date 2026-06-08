import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getSetting, setSetting } from "@/shared/db/db";

interface TourStep {
  selector: string;
  title: string;
  text: string;
  bubbleY: "top" | "middle" | "bottom";
}

const STEPS: TourStep[] = [
  {
    selector: "[data-tour='greeting']",
    title: "Dasbor Keuangan Anda",
    text: "Selamat datang! Di sini Anda bisa melihat ringkasan kekayaan bersih dan arus kas bulan ini.",
    bubbleY: "top",
  },
  {
    selector: "[data-tour='wallets']",
    title: "Dompet Anda",
    text: "Tiga dompet sudah siap. Ketuk kartu dompet untuk melihat detail dan riwayat transaksinya.",
    bubbleY: "middle",
  },
  {
    selector: "[data-tour='fab']",
    title: "Catat Transaksi",
    text: "Ketuk tombol ini untuk mencatat pengeluaran, pemasukan, atau transfer dengan cepat.",
    bubbleY: "bottom",
  },
  {
    selector: "[data-tour='navbar']",
    title: "Navigasi Utama",
    text: "Akses semua fitur dari sini: Transaksi, Statistik, Dompet, dan Pengaturan.",
    bubbleY: "bottom",
  },
  {
    selector: "[data-tour='budget']",
    title: "Pantau Anggaran",
    text: "Kelola anggaran bulanan di sini. Anda akan mendapat notifikasi saat mendekati batas yang ditetapkan.",
    bubbleY: "middle",
  },
  {
    selector: "[data-tour='calculator']",
    title: "Kalkulator Bawaan",
    text: "Kalkulator pintar langsung mengisi nominal di form transaksi. Tidak perlu buka aplikasi lain!",
    bubbleY: "top",
  },
];

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function ConfettiBurst() {
  const pieces = useRef(
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#8CC0EB", "#F4A35A", "#4CAF50", "#D81B60", "#FBC02D"][i % 5] ?? "#8CC0EB",
      delay: Math.random() * 0.8,
      duration: 1.4 + Math.random() * 1,
      size: 5 + Math.random() * 7,
    })),
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[200]" aria-hidden>
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
          }}
        />
      ))}
    </div>
  );
}

export function GuidedHomeTour() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const [confetti, setConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getSetting<boolean>("tour_completed").then((done) => {
      if (!done) setReady(true);
    });
  }, []);

  const updateSpot = useCallback((s: number) => {
    const sel = STEPS[s]?.selector;
    if (!sel) return;
    const el = document.querySelector(sel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 });
  }, []);

  useEffect(() => {
    if (!ready) return;
    updateSpot(step);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      advance();
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ready, step, updateSpot]);

  const finish = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setReady(false);
    setConfetti(true);
    await setSetting("tour_completed", true);
    setTimeout(() => setConfetti(false), 2200);
  }, []);

  const advance = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      void finish();
    }
  }, [step, finish]);

  if (!ready && !confetti) return null;

  const current = STEPS[step];

  return (
    <>
      {confetti && <ConfettiBurst />}
      {ready && current !== undefined && (
        <div
          className="fixed inset-0 z-[150] pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label={`Tur panduan: langkah ${step + 1} dari ${STEPS.length}`}
        >
          <div className="absolute inset-0 bg-black/50" style={{ pointerEvents: "all" }} onClick={advance} />

          {spot !== null && (
            <div
              className="absolute rounded-2xl ring-2 ring-accent-primary ring-offset-2 ring-offset-transparent"
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.52)",
                pointerEvents: "none",
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <div className="absolute inset-0 rounded-2xl animate-pulse bg-accent-primary/10" />
            </div>
          )}

          <div
            className={`absolute left-4 right-4 bg-bg-card rounded-2xl p-4 shadow-float pointer-events-all z-10 ${
              current.bubbleY === "top"
                ? "top-[72px]"
                : current.bubbleY === "middle"
                  ? "top-[42%] -translate-y-1/2"
                  : "bottom-[140px]"
            }`}
            style={{ pointerEvents: "all" }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step ? "w-5 bg-accent-primary" : "w-1.5 bg-bg-surface"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-text-muted mt-1">
                  Langkah {step + 1} dari {STEPS.length}
                </p>
              </div>
              <button
                onClick={() => void finish()}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-bg-surface text-text-muted flex-shrink-0"
                aria-label="Lewati tur panduan"
              >
                <X size={13} />
              </button>
            </div>

            <h3 className="text-sm font-bold text-text-primary mb-1">{current.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{current.text}</p>

            <button
              onClick={advance}
              className="mt-3 w-full py-2.5 bg-accent-primary text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-transform"
            >
              {step < STEPS.length - 1 ? "Lanjut" : "Selesai!"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
