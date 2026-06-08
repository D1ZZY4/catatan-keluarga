import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/misc";

export function SettingRow({
  icon,
  label,
  description,
  right,
  onClick,
  href,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const content = (
    <div className="flex items-center gap-3 w-full px-4 py-3.5 active:bg-bg-card transition-colors">
      <div className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", danger ? "text-danger" : "text-text-primary")}>
          {label}
        </p>
        {description !== undefined && (
          <p className="text-xs text-text-muted truncate mt-0.5">{description}</p>
        )}
      </div>
      {right !== undefined ? (
        right
      ) : (
        <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
      )}
    </div>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }
  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
  }
  return <div>{content}</div>;
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-4 pt-5 pb-2">
      {title}
    </p>
  );
}

export function Toggle({ value }: { value: boolean }) {
  return (
    <div
      className={cn(
        "w-10 h-6 rounded-full transition-colors relative flex-shrink-0",
        value ? "bg-accent-primary" : "bg-bg-card",
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-bg-page shadow transition-transform",
          value ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </div>
  );
}
