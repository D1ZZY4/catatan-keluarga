import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextValue {
  primaryCurrency: string;
  setPrimaryCurrency: (code: string) => void;
  formatAmount: (amount: number, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  primaryCurrency: 'IDR',
  setPrimaryCurrency: () => {},
  formatAmount: (amount) => String(amount),
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [primaryCurrency, setPrimaryCurrency] = useState<string>('IDR');

  function formatAmount(amount: number, currency: string = primaryCurrency): string {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  }

  return (
    <CurrencyContext.Provider value={{ primaryCurrency, setPrimaryCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
