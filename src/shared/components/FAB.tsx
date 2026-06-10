import React, { useCallback, useEffect, useRef, useState } from "react";
import { MoreVertical, Settings2, X } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
import { cn } from "@/shared/utils/misc";
import { useQuickActions } from "@/features/home/useQuickActions";
import { QUICK_ACTION_META } from "@/features/home/quickActionsConfig";
import { EditQuickActionsSheet } from "@/features/home/EditQuickActionsSheet";
import type { TransactionType } from "@/shared/types";

export type FABAction = TransactionType | "scan";

interface FABProps {
  onAction: (action: FABAction) => void;
}

export function FAB({ onAction }: FABProps) {
  const [dialOpen, setDialOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { actions } = useQuickActions();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!dialOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dialOpen]);

  const handleToggle = useCallback(() => {
    setDialOpen((v) => !v);
  }, []);

  const handleDialAction = useCallback(
    (type: FABAction) => {
      setDialOpen(false);
      onAction(type);
    },
    [onAction],
  );

  const handleEditOpen = useCallback(() => {
    setDialOpen(false);
    setEditOpen(true);
  }, []);

  return (
    <>
      {dialOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDialOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed right-4 z-50 flex flex-col items-end gap-2.5 transition-all duration-300",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Edit Aksi Cepat — always last (topmost) */}
        <div
          className={cn(
            "flex items-center gap-2.5 transition-all",
            dialOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none",
          )}
          style={{
            transitionDuration: "180ms",
            transitionDelay: dialOpen ? `${(actions.length) * 50}ms` : "0ms",
          }}
        >
          <span
            className="text-xs font-semibold text-text-primary bg-bg-surface/95 backdrop-blur-sm px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
          >
            Edit Aksi Cepat
          </span>
          <button
            onClick={handleEditOpen}
            aria-label="Edit aksi cepat"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-bg-surface ring-1 ring-black/[0.08] active:scale-90 transition-transform shadow-card"
          >
            <Settings2 size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Quick action items — reversed so first action is closest to button */}
        {[...actions].reverse().map((action, revIdx) => {
          const idx = actions.length - 1 - revIdx;
          const meta = QUICK_ACTION_META[action.type];
          const delay = dialOpen ? `${idx * 50}ms` : "0ms";
          return (
            <div
              key={action.id}
              className={cn(
                "flex items-center gap-2.5 transition-all",
                dialOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none",
              )}
              style={{ transitionDuration: "180ms", transitionDelay: delay }}
            >
              <span
                className="text-xs font-semibold text-text-primary bg-bg-surface/95 backdrop-blur-sm px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
              >
                {meta.label}
              </span>
              <button
                onClick={() => handleDialAction(action.type as FABAction)}
                aria-label={meta.label}
                className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-card ring-1 ring-black/[0.08]"
                style={{ background: meta.iconBg }}
              >
                <DynamicIcon
                  name={meta.iconName}
                  size={19}
                  strokeWidth={2}
                  style={{ color: meta.iconColor }}
                />
              </button>
            </div>
          );
        })}

        {/* Main toggle button */}
        <button
          data-tour="fab"
          onClick={handleToggle}
          aria-label={dialOpen ? "Tutup menu" : "Buka menu aksi cepat"}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            "active:scale-90 transition-all duration-200 select-none",
            dialOpen ? "bg-text-muted/70" : "bg-accent-primary",
          )}
          style={
            !dialOpen
              ? {
                  boxShadow:
                    "0 4px 20px rgba(140,192,235,0.55), 0 2px 8px rgba(140,192,235,0.30)",
                }
              : undefined
          }
        >
          <div
            className={cn(
              "transition-transform duration-200",
              dialOpen ? "rotate-90" : "rotate-0",
            )}
          >
            {dialOpen ? (
              <X size={22} strokeWidth={2.5} className="text-white" />
            ) : (
              <MoreVertical size={22} strokeWidth={2.5} className="text-white" />
            )}
          </div>
        </button>
      </div>

      <EditQuickActionsSheet
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
