import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart2, Home, Settings, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/shared/utils/misc";

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  Icon: React.ElementType;
  exact: boolean;
  center?: boolean;
}> = [
  { to: "/", label: "Beranda", Icon: Home, exact: true },
  { to: "/transactions", label: "Transaksi", Icon: TrendingUp, exact: false },
  { to: "/stats", label: "Statistik", Icon: BarChart2, exact: false, center: true },
  { to: "/wallets", label: "Dompet", Icon: Wallet, exact: false },
  { to: "/settings", label: "Pengaturan", Icon: Settings, exact: false },
];

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-48px)] max-w-[480px]"
      aria-label="Navigasi utama"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="flex items-center justify-around h-16 px-2 rounded-[28px]"
        style={{
          background: "rgba(var(--bg-card-rgb, 255,235,204), 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          border: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        {NAV_ITEMS.map(({ to, label, Icon, exact, center }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] min-h-[44px] relative"
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={center ? 28 : 22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-accent-primary" : "text-text-muted",
                  )}
                />
                <div
                  className={cn(
                    "w-1 h-1 rounded-full transition-all duration-200",
                    isActive ? "bg-accent-primary scale-100" : "scale-0 bg-transparent",
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
