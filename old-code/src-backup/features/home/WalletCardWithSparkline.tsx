import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { WalletCard } from "@/shared/components/WalletCard";
import { useAppData } from "@/app/AppDataContext";

function useSparkline(
  walletId: string,
  transactions: ReturnType<typeof useAppData>["transactions"],
  initialBalance: number,
) {
  return useMemo(() => {
    const days = 7;
    const now = Date.now();
    const points: number[] = [];
    for (let d = days - 1; d >= 0; d--) {
      const dayStart = now - d * 86400000;
      const dayEnd = dayStart + 86400000;
      const balance = transactions
        .filter(
          (tx) =>
            tx.date < dayEnd &&
            (tx.walletId === walletId || tx.toWalletId === walletId),
        )
        .reduce((acc, tx) => {
          if (tx.walletId === walletId) {
            switch (tx.type) {
              case "income":
              case "debt_received":
              case "savings_withdraw":
              case "invest_sell":
                return acc + tx.amount;
              case "expense":
              case "transfer_external":
              case "debt_given":
              case "savings_deposit":
              case "invest_buy":
              case "debt_repay":
                return acc - tx.amount;
              case "transfer_internal":
                return acc - tx.amount;
              default:
                return acc;
            }
          }
          if (tx.toWalletId === walletId && tx.type === "transfer_internal")
            return acc + tx.amount;
          return acc;
        }, initialBalance);
      points.push(balance);
    }
    return points;
  }, [walletId, transactions, initialBalance]);
}

export function WalletCardWithSparkline({
  wallet,
}: {
  wallet: ReturnType<typeof useAppData>["wallets"][number];
}) {
  const { transactions, getWalletBalance } = useAppData();
  const balance = getWalletBalance(wallet.id);
  const sparkline = useSparkline(
    wallet.id,
    transactions,
    wallet.initialBalance,
  );
  return (
    <Link
      to={`/wallets/${wallet.id}`}
      className="block active:scale-[0.97] transition-transform"
    >
      <WalletCard wallet={wallet} balance={balance} sparkline={sparkline} />
    </Link>
  );
}
