import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart2, Home, Settings, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/shared/utils/misc";

const NAV_ITEMS = [
  { to: "/", label: "Beranda", Icon: Home, exact: true },
  { to: "/transactions", label: "Transaksi", Icon: TrendingUp, exact: false },
  { to: "/stats", label: "Statistik", Icon: BarChart2, exact: false },
  { to: "/wallets", label: "Dompet", Icon: Wallet, exact: false },
  { to: "/settings", label: "Pengaturan", Icon: Settings, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      aria-label="Navigasi utama"
    >
      <div className="mx-3 mb-2 bg-bg-surface/95 backdrop-blur-md rounded-2xl border border-bg-card shadow-[0_4px_24px_rgba(26,24,20,0.10)]">
        <div className="flex items-center justify-around h-[56px] px-1">
          {NAV_ITEMS.map(({ to, label, Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className="flex-1 flex items-center justify-center min-h-[44px]"
              aria-label={label}
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-accent-primary/15 text-accent-primary"
                      : "text-text-muted active:scale-90",
                  )}
                >
                  <Icon
                    size={isActive ? 17 : 20}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  {isActive && (
                    <span className="text-[11px] font-semibold leading-none whitespace-nowrap">
                      {label}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
