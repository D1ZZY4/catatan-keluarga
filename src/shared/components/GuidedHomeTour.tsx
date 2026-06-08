import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getSetting, setSetting } from "@/shared/db/db";

interface TourStep {
  selector: string;
  title: string;
  text: string;
}

const STEPS: TourStep[] = [
  {
    selector: "[data-tour='greeting']",
    title: "Dasbor Keuangan Anda",
    text: "Selamat datang! Di sini Anda bisa melihat ringkasan saldo bersih dan arus kas bulan ini.",
  },
  {
    selector: "[data-tour='wallets']",
    title: "Dompet Anda",
    text: "Tiga dompet sudah siap. Ketuk kartu dompet untuk melihat detail dan riwayat transaksinya.",
  },
  {
    selector: "[data-tour='fab']",
    title: "Catat Transaksi",
    text: "Ketuk tombol ini untuk mencatat pengeluaran, pemasukan, atau transfer. Tahan sebentar untuk pilihan cepat.",
  },
  {
    selector: "[data-tour='navbar']",
    title: "Navigasi Utama",
    text: "Akses semua fitur dari sini: Transaksi, Statistik, Dompet, dan Pengaturan.",
  },
  {
    selector: "[data-tour='budget']",
    title: "Pantau Anggaran",
    text: "Kelola anggaran bulanan di sini. Anda akan mendapat notifikasi saat mendekati batas yang ditetapkan.",
  },
  {
    selector: "[data-tour='calculator']",
    title: "Kalkulator Bawaan",
    text: "Kalkulator pintar di AppBar bisa langsung mengisi nominal di form transaksi. Tidak perlu buka aplikasi lain!",
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

/** Compute where the bubble card should appear so it doesn't overlap the spotlight */
function computeBubbleStyle(spot: SpotRect | null): React.CSSProperties {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const BUBBLE_EST_HEIGHT = 170;
  const MARGIN = 14;

  if (!spot) {
    // No element found — center of screen
    return { top: `${vh * 0.35}px`, left: "1rem", right: "1rem" };
  }

  const spotBottom = spot.top + spot.height;
  const spaceBelow = vh - spotBottom;
  const spaceAbove = spot.top;

  if (spaceBelow >= BUBBLE_EST_HEIGHT + MARGIN) {
    // Enough space below the spotlight
    return { top: `${spotBottom + MARGIN}px`, left: "1rem", right: "1rem" };
  } else if (spaceAbove >= BUBBLE_EST_HEIGHT + MARGIN) {
    // Enough space above
    return { bottom: `${vh - spot.top + MARGIN}px`, left: "1rem", right: "1rem" };
  } else {
    // Not enough space either side — center below spotlight with scroll offset
    return { top: `${Math.min(spotBottom + MARGIN, vh - BUBBLE_EST_HEIGHT - 8)}px`, left: "1rem", right: "1rem" };
  }
}

export function GuidedHomeTour() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const [confetti, setConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    void getSetting<boolean>("tour_completed").then((done) => {
      if (!done) {
        // Small delay so the page layout settles before we measure elements
        setTimeout(() => setReady(true), 400);
      }
    });
  }, []);

  const updateSpot = useCallback((s: number) => {
    const stepData = STEPS[s];
    if (!stepData) return;

    const el = document.querySelector(stepData.selector);
    if (!el) {
      setSpot(null);
      return;
    }

    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) {
      setSpot(null);
      return;
    }

    // Scroll element into view if it's below the fold (only if not in a fixed container)
    const isFixed = getComputedStyle(el).position === "fixed";
    if (!isFixed && (r.top > window.innerHeight || r.bottom < 0)) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Re-measure after scroll
      setTimeout(() => {
        const r2 = el.getBoundingClientRect();
        const PAD = 8;
        setSpot({ top: r2.top - PAD, left: r2.left - PAD, width: r2.width + PAD * 2, height: r2.height + PAD * 2 });
      }, 350);
      return;
    }

    const PAD = 8;
    setSpot({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, []);

  const finish = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setReady(false);
    setConfetti(true);
    await setSetting("tour_completed", true);
    setTimeout(() => setConfetti(false), 2200);
  }, []);

  const advance = useCallback(() => {
    setStep((s) => {
      const next = s + 1;
      if (next >= STEPS.length) {
        void finish();
        return s;
      }
      return next;
    });
  }, [finish]);

  // Keep advanceRef current so the timer always calls the latest advance
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  // Update spotlight position + restart auto-advance timer when step changes
  useEffect(() => {
    if (!ready) return;
    updateSpot(step);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      advanceRef.current();
    }, 4500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ready, step, updateSpot]);

  // Recompute spot on resize
  useEffect(() => {
    if (!ready) return;
    const handleResize = () => updateSpot(step);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ready, step, updateSpot]);

  if (!ready && !confetti) return null;

  const current = STEPS[step];
  const bubbleStyle = computeBubbleStyle(spot);

  return (
    <>
      {confetti && <ConfettiBurst />}

      {ready && current !== undefined && (
        <>
          {/*
           * Full-screen transparent click interceptor at z-[150].
           * This blocks ALL click events from reaching page elements beneath the tour,
           * preventing the tour from accidentally navigating pages when the user
           * taps the spotlight area (FAB, navbar links, etc.).
           * Clicking anywhere on this overlay advances the tour.
           */}
          <div
            className="fixed inset-0 z-[150]"
            style={{ pointerEvents: "all" }}
            onClick={advance}
            aria-hidden
          />

          {/*
           * Spotlight visual: positioned exactly over the target element.
           * box-shadow creates the dark vignette around the spotlight hole.
           * pointer-events: none — visual only, clicks fall through to the overlay above.
           */}
          {spot !== null && (
            <div
              className="fixed rounded-2xl ring-2 ring-accent-primary ring-offset-2 ring-offset-transparent z-[151]"
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.58)",
                pointerEvents: "none",
                transition: "top 0.32s cubic-bezier(0.34,1.56,0.64,1), left 0.32s cubic-bezier(0.34,1.56,0.64,1), width 0.32s ease, height 0.32s ease",
              }}
              aria-hidden
            >
              <div className="absolute inset-0 rounded-2xl animate-pulse bg-accent-primary/10" />
            </div>
          )}

          {/* Dark vignette when no spotlight (element not found) */}
          {spot === null && (
            <div
              className="fixed inset-0 bg-black/58 z-[151]"
              style={{ pointerEvents: "none" }}
              aria-hidden
            />
          )}

          {/*
           * Bubble card: positioned dynamically above or below the spotlight.
           * z-[152] so it's above both the overlay and spotlight.
           * stopPropagation prevents bubble-area clicks from hitting the overlay.
           */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Tur panduan: langkah ${step + 1} dari ${STEPS.length}`}
            className="fixed bg-bg-card rounded-2xl p-4 shadow-float z-[152]"
            style={{ ...bubbleStyle, pointerEvents: "all" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress dots + step count + skip */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
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
                className="w-7 h-7 flex items-center justify-center rounded-full bg-bg-surface text-text-muted flex-shrink-0 active:scale-90 transition-transform"
                aria-label="Lewati tur panduan"
              >
                <X size={13} />
              </button>
            </div>

            <h3 className="text-sm font-bold text-text-primary mb-1">{current.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{current.text}</p>

            <div className="mt-3 flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="flex-1 py-2.5 bg-bg-surface text-text-muted rounded-xl text-xs font-semibold active:scale-[0.98] transition-transform"
                >
                  Kembali
                </button>
              )}
              <button
                onClick={advance}
                className="flex-1 py-2.5 bg-accent-primary text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-transform"
              >
                {step < STEPS.length - 1 ? "Lanjut" : "Selesai!"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
