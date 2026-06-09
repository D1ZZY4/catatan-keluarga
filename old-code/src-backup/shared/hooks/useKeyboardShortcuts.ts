import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TransactionType } from "@/shared/types";

interface ShortcutHandlers {
  openTransactionForm: (type?: TransactionType) => void;
  openCalculator: () => void;
}

export function useKeyboardShortcuts({ openTransactionForm, openCalculator }: ShortcutHandlers) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      switch (e.key) {
        case "n":
        case "N":
          e.preventDefault();
          openTransactionForm("expense");
          break;
        case "t":
        case "T":
          e.preventDefault();
          void navigate("/transactions");
          break;
        case "s":
        case "S":
          e.preventDefault();
          void navigate("/stats");
          break;
        case "w":
        case "W":
          e.preventDefault();
          void navigate("/wallets");
          break;
        case "k":
        case "K":
          e.preventDefault();
          openCalculator();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, openTransactionForm, openCalculator]);
}
