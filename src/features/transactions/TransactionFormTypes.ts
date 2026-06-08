import React from "react";
import {
  ArrowLeftRight, BarChart2, CheckCircle, DollarSign,
  PiggyBank, Send, TrendingDown, TrendingUp,
  UserMinus, UserPlus, Wallet,
} from "lucide-react";
import type { TransactionType } from "@/shared/types";

export type Step = 1 | 2 | 3;

export interface FormState {
  type: TransactionType;
  amountRaw: string;
  amount: number;
  categoryId: string;
  walletId: string;
  toWalletId: string;
  date: number;
  note: string;
  linkedPersonName: string;
  linkedPersonPhone: string;
}

export const TYPE_OPTIONS: {
  type: TransactionType;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { type: "expense", label: "Pengeluaran", Icon: TrendingDown, color: "text-danger", bg: "bg-danger/10" },
  { type: "income", label: "Pemasukan", Icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  { type: "transfer_internal", label: "Transfer", Icon: ArrowLeftRight, color: "text-accent-primary", bg: "bg-accent-primary/10" },
  { type: "transfer_external", label: "Kirim Uang", Icon: Send, color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
  { type: "debt_given", label: "Piutang", Icon: UserPlus, color: "text-warning", bg: "bg-warning/10" },
  { type: "debt_received", label: "Hutang", Icon: UserMinus, color: "text-warning", bg: "bg-warning/10" },
  { type: "debt_repay", label: "Pelunasan", Icon: CheckCircle, color: "text-text-muted", bg: "bg-bg-page" },
  { type: "savings_deposit", label: "Tabungan", Icon: PiggyBank, color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
  { type: "savings_withdraw", label: "Tarik Tabungan", Icon: Wallet, color: "text-success", bg: "bg-success/10" },
  { type: "invest_buy", label: "Beli Investasi", Icon: BarChart2, color: "text-accent-primary", bg: "bg-accent-primary/10" },
  { type: "invest_sell", label: "Jual Investasi", Icon: DollarSign, color: "text-success", bg: "bg-success/10" },
];
