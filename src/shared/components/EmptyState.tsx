import React from "react";
import { cn } from "@/shared/utils/misc";

interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

function DefaultIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="opacity-60">
      <circle cx="60" cy="60" r="50" fill="var(--bg-card)" />
      <path d="M40 70 Q60 40 80 70" stroke="var(--warning)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="52" r="12" fill="var(--warning)" opacity="0.25" />
      <path d="M53 52 L57 56 L67 46" stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WalletEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="35" width="80" height="55" rx="12" fill="var(--bg-card)" />
      <rect x="20" y="35" width="80" height="20" rx="12" fill="var(--warning)" opacity="0.25" />
      <circle cx="76" cy="65" r="8" fill="var(--warning)" opacity="0.4" />
      <rect x="32" y="42" width="24" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
      <rect x="32" y="62" width="16" height="2.5" rx="1.25" fill="var(--text-muted)" opacity="0.4" />
      <rect x="32" y="68" width="24" height="2.5" rx="1.25" fill="var(--text-muted)" opacity="0.3" />
      <circle cx="88" cy="32" r="14" fill="var(--success)" opacity="0.15" />
      <path d="M84 32 L87 35 L93 29" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TransactionEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="28" y="25" width="64" height="75" rx="10" fill="var(--bg-card)" />
      <rect x="36" y="38" width="40" height="4" rx="2" fill="var(--warning)" opacity="0.5" />
      <rect x="36" y="48" width="30" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
      <rect x="36" y="57" width="40" height="4" rx="2" fill="var(--success)" opacity="0.5" />
      <rect x="36" y="67" width="25" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
      <rect x="36" y="76" width="40" height="4" rx="2" fill="var(--danger)" opacity="0.4" />
      <circle cx="85" cy="30" r="16" fill="var(--bg-page)" />
      <path d="M78 30 L82 34 L92 24" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReminderEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="55" r="30" fill="var(--bg-card)" />
      <path d="M60 30 C60 30 60 28 62 28 A2 2 0 0 1 58 28 C60 28 60 30 60 30" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M42 55 C42 45.6 50.1 38 60 38 C69.9 38 78 45.6 78 55 L78 66 L84 72 L36 72 L42 66 Z" fill="var(--accent-primary)" opacity="0.25" />
      <path d="M42 55 C42 45.6 50.1 38 60 38 C69.9 38 78 45.6 78 55 L78 66 L84 72 L36 72 L42 66 Z" stroke="var(--accent-primary)" strokeWidth="2" fill="none" opacity="0.6" />
      <rect x="36" y="72" width="48" height="4" rx="2" fill="var(--accent-primary)" opacity="0.3" />
      <path d="M55 76 Q60 82 65 76" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <circle cx="88" cy="35" r="14" fill="var(--warning)" opacity="0.15" />
      <path d="M84 35 L87 38 L93 32" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

export function StatsEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="80" width="16" height="25" rx="4" fill="var(--danger)" opacity="0.35" />
      <rect x="42" y="60" width="16" height="45" rx="4" fill="var(--warning)" opacity="0.45" />
      <rect x="64" y="50" width="16" height="55" rx="4" fill="var(--success)" opacity="0.55" />
      <rect x="86" y="35" width="16" height="70" rx="4" fill="var(--warning)" opacity="0.7" />
      <path d="M20 80 Q52 40 90 35" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4 3" fill="none" opacity="0.4" />
    </svg>
  );
}

export function BudgetEmptyIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-28 h-28" fill="none" aria-hidden>
      <rect x="20" y="20" width="80" height="65" rx="10" fill="var(--bg-card)" />
      <rect x="32" y="34" width="56" height="8" rx="4" fill="var(--warning)" opacity="0.4" />
      <rect x="32" y="50" width="40" height="6" rx="3" fill="var(--bg-surface)" />
      <rect x="32" y="62" width="25" height="6" rx="3" fill="var(--bg-surface)" />
      <circle cx="90" cy="18" r="16" fill="var(--success)" opacity="0.15" />
      <path d="M83 18 L87 22 L97 12" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CategoryEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="18" y="18" width="36" height="36" rx="10" fill="var(--accent-primary)" opacity="0.2" />
      <rect x="66" y="18" width="36" height="36" rx="10" fill="var(--success)" opacity="0.2" />
      <rect x="18" y="66" width="36" height="36" rx="10" fill="var(--warning)" opacity="0.2" />
      <rect x="66" y="66" width="36" height="36" rx="10" fill="var(--danger)" opacity="0.2" />
      <circle cx="36" cy="36" r="10" fill="var(--accent-primary)" opacity="0.35" />
      <circle cx="84" cy="36" r="10" fill="var(--success)" opacity="0.35" />
      <circle cx="36" cy="84" r="10" fill="var(--warning)" opacity="0.35" />
      <path d="M74 84 L94 84 M84 74 L84 94" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function DebtEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="42" cy="48" r="18" fill="var(--bg-card)" />
      <circle cx="78" cy="48" r="18" fill="var(--bg-card)" />
      <circle cx="42" cy="48" r="10" fill="var(--accent-primary)" opacity="0.3" />
      <circle cx="78" cy="48" r="10" fill="var(--success)" opacity="0.3" />
      <path d="M55 48 L65 48" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
      <rect x="30" y="72" width="60" height="22" rx="8" fill="var(--bg-card)" />
      <path d="M42 83 L55 83 M65 83 L78 83" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="90" cy="30" r="14" fill="var(--success)" opacity="0.12" />
      <path d="M85 30 L88 33 L95 26" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center gap-4", className)}>
      <div className="mb-2">
        {illustration ?? <DefaultIllustration />}
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description !== undefined && (
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      )}
      {action !== undefined && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2.5 bg-accent-primary text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-fab"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
