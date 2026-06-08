import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/misc";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  fullHeight,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        closeBtnRef.current?.focus();
      });
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    currentY.current = Math.max(0, e.clientY - startY.current);
    sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
  };

  const handlePointerUp = () => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    if (currentY.current > 120) {
      onClose();
    } else {
      sheetRef.current.style.transform = "";
    }
    currentY.current = 0;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end"
      role="dialog"
      aria-modal="true"
      {...(title !== undefined ? { "aria-labelledby": "sheet-title" } : {})}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[3px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={cn(
          "relative w-full bg-bg-page rounded-t-[28px] shadow-2xl animate-sheet-in transition-transform",
          fullHeight ? "max-h-[92dvh]" : "max-h-[88dvh]",
          "flex flex-col",
          className,
        )}
        style={{ transition: isDragging.current ? "none" : undefined }}
      >
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-bg-card" />
          </div>
          {title !== undefined && (
            <div className="flex items-center justify-between px-5 pt-1 pb-3">
              <h2
                id="sheet-title"
                className="text-[17px] font-semibold text-text-primary tracking-tight"
              >
                {title}
              </h2>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-card hover:bg-bg-card/80 active:scale-90 transition-all"
                aria-label="Tutup"
              >
                <X size={15} className="text-text-muted" />
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
