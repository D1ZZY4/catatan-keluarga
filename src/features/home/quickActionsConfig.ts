import type { TransactionType } from "@/shared/types";

export type QuickActionType = TransactionType | "scan";

export interface QuickActionConfig {
  id: string;
  type: QuickActionType;
}

export const QUICK_ACTION_META: Record<
  QuickActionType,
  { label: string; iconName: string; iconColor: string; iconBg: string }
> = {
  expense: {
    label: "Pengeluaran",
    iconName: "TrendingDown",
    iconColor: "#C62828",
    iconBg: "rgba(198,40,40,0.12)",
  },
  income: {
    label: "Pemasukan",
    iconName: "TrendingUp",
    iconColor: "#2E7D32",
    iconBg: "rgba(46,125,50,0.12)",
  },
  transfer_internal: {
    label: "Transfer",
    iconName: "ArrowLeftRight",
    iconColor: "var(--text-muted)",
    iconBg: "var(--bg-surface)",
  },
  scan: {
    label: "Scan Struk",
    iconName: "ScanLine",
    iconColor: "var(--text-muted)",
    iconBg: "var(--bg-surface)",
  },
  transfer_external: {
    label: "Kirim Uang",
    iconName: "Send",
    iconColor: "var(--accent-secondary)",
    iconBg: "rgba(140,192,235,0.12)",
  },
  debt_given: {
    label: "Piutang",
    iconName: "UserPlus",
    iconColor: "#E65100",
    iconBg: "rgba(230,81,0,0.12)",
  },
  debt_received: {
    label: "Hutang",
    iconName: "UserMinus",
    iconColor: "#E65100",
    iconBg: "rgba(230,81,0,0.12)",
  },
  debt_repay: {
    label: "Pelunasan",
    iconName: "CheckCircle",
    iconColor: "var(--text-muted)",
    iconBg: "var(--bg-surface)",
  },
  savings_deposit: {
    label: "Tabungan",
    iconName: "PiggyBank",
    iconColor: "var(--accent-secondary)",
    iconBg: "rgba(140,192,235,0.12)",
  },
  savings_withdraw: {
    label: "Tarik Tabungan",
    iconName: "Wallet",
    iconColor: "#2E7D32",
    iconBg: "rgba(46,125,50,0.12)",
  },
  invest_buy: {
    label: "Beli Investasi",
    iconName: "BarChart2",
    iconColor: "var(--accent-primary)",
    iconBg: "rgba(140,192,235,0.12)",
  },
  invest_sell: {
    label: "Jual Investasi",
    iconName: "DollarSign",
    iconColor: "#2E7D32",
    iconBg: "rgba(46,125,50,0.12)",
  },
};

export const AVAILABLE_QUICK_ACTION_TYPES: QuickActionType[] = [
  "expense",
  "income",
  "transfer_internal",
  "scan",
  "transfer_external",
  "debt_given",
  "debt_received",
  "debt_repay",
  "savings_deposit",
  "savings_withdraw",
  "invest_buy",
  "invest_sell",
];

export const DEFAULT_QUICK_ACTIONS: QuickActionConfig[] = [
  { id: "qa_expense", type: "expense" },
  { id: "qa_income", type: "income" },
  { id: "qa_transfer", type: "transfer_internal" },
  { id: "qa_scan", type: "scan" },
];
