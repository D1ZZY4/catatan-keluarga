/**
 * AppDataContext — sumber kebenaran tunggal untuk semua data finansial.
 * Pattern: optimistic updates + WatermelonDB persistence
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  ReactNode,
} from 'react';
import type { Budget, Category, Reminder, Transaction, Wallet } from '../types';
import {
  listWallets,
  putWallet,
  deleteWallet,
  listTransactions,
  putTransaction,
  deleteTransaction,
  listCategories,
  putCategory,
  deleteCategory,
  listBudgets,
  putBudget,
  deleteBudget,
  listReminders,
  putReminder,
  deleteReminder,
  clearAllData,
} from '../db/repo';
import { newId } from '../utils/misc';
import { INCOME_TYPES, EXPENSE_TYPES } from '../constants/transactionTypes';

// ---- Types -----------------------------------------------------------------

interface AppData {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  reminders: Reminder[];
  loading: boolean;
}

export interface AppDataContextValue extends AppData {
  addWallet: (data: Omit<Wallet, 'id' | 'createdAt'>) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  removeWallet: (id: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addCategory: (data: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addBudget: (data: Omit<Budget, 'id' | 'createdAt'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  addReminder: (data: Omit<Reminder, 'id' | 'createdAt'>) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  getWalletBalance: (walletId: string) => number;
  reload: () => Promise<void>;
  clearAll: () => Promise<void>;
}

// ---- Balance helper --------------------------------------------------------

export function computeWalletBalance(wallet: Wallet, transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.walletId === wallet.id) {
      switch (tx.type) {
        case 'income':
        case 'debt_received':
        case 'savings_withdraw':
        case 'invest_sell':
          return acc + tx.amount;
        case 'expense':
        case 'transfer_external':
        case 'debt_given':
        case 'savings_deposit':
        case 'invest_buy':
        case 'debt_repay':
          return acc - tx.amount;
        case 'transfer_internal':
          return acc - tx.amount;
        default:
          return acc;
      }
    }
    if (tx.toWalletId === wallet.id && tx.type === 'transfer_internal') {
      return acc + tx.amount;
    }
    return acc;
  }, wallet.initialBalance);
}

// ---- Reducer ---------------------------------------------------------------

type DataAction =
  | { type: 'LOADED'; data: Omit<AppData, 'loading'> }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_WALLETS'; wallets: Wallet[] }
  | { type: 'SET_TRANSACTIONS'; transactions: Transaction[] }
  | { type: 'SET_CATEGORIES'; categories: Category[] }
  | { type: 'SET_BUDGETS'; budgets: Budget[] }
  | { type: 'SET_REMINDERS'; reminders: Reminder[] };

function dataReducer(state: AppData, action: DataAction): AppData {
  switch (action.type) {
    case 'LOADED':
      return { ...action.data, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_WALLETS':
      return { ...state, wallets: action.wallets };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.categories };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.budgets };
    case 'SET_REMINDERS':
      return { ...state, reminders: action.reminders };
    default:
      return state;
  }
}

const initialState: AppData = {
  wallets: [],
  transactions: [],
  categories: [],
  budgets: [],
  reminders: [],
  loading: true,
};

// ---- Context ---------------------------------------------------------------

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(dataReducer, initialState);
  const dataRef = useRef(data);
  dataRef.current = data;

  const load = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const [wallets, transactions, categories, budgets, reminders] = await Promise.all([
        listWallets(),
        listTransactions(),
        listCategories(),
        listBudgets(),
        listReminders(),
      ]);
      dispatch({
        type: 'LOADED',
        data: { wallets, transactions, categories, budgets, reminders },
      });
    } catch {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(async () => { await load(); }, [load]);

  // ---- Wallets -------------------------------------------------------------

  const addWallet = useCallback(async (walletData: Omit<Wallet, 'id' | 'createdAt'>) => {
    const wallet: Wallet = { ...walletData, id: newId(), createdAt: Date.now() };
    const prev = dataRef.current.wallets;
    dispatch({ type: 'SET_WALLETS', wallets: [...prev, wallet] });
    try {
      await putWallet(wallet);
    } catch {
      dispatch({ type: 'SET_WALLETS', wallets: prev });
    }
  }, []);

  const updateWallet = useCallback(async (wallet: Wallet) => {
    const prev = dataRef.current.wallets;
    dispatch({ type: 'SET_WALLETS', wallets: prev.map((w) => (w.id === wallet.id ? wallet : w)) });
    try {
      await putWallet(wallet);
    } catch {
      dispatch({ type: 'SET_WALLETS', wallets: prev });
    }
  }, []);

  const removeWallet = useCallback(async (id: string) => {
    const prev = dataRef.current.wallets;
    dispatch({ type: 'SET_WALLETS', wallets: prev.filter((w) => w.id !== id) });
    try {
      await deleteWallet(id);
    } catch {
      dispatch({ type: 'SET_WALLETS', wallets: prev });
    }
  }, []);

  // ---- Transactions --------------------------------------------------------

  const addTransaction = useCallback(
    async (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const tx: Transaction = { ...txData, id: newId(), createdAt: now, updatedAt: now };
      const prev = dataRef.current.transactions;
      dispatch({ type: 'SET_TRANSACTIONS', transactions: [tx, ...prev] });
      try {
        await putTransaction(tx);
      } catch {
        dispatch({ type: 'SET_TRANSACTIONS', transactions: prev });
      }
    },
    [],
  );

  const updateTransaction = useCallback(async (tx: Transaction) => {
    const updated: Transaction = { ...tx, updatedAt: Date.now() };
    const prev = dataRef.current.transactions;
    dispatch({
      type: 'SET_TRANSACTIONS',
      transactions: prev.map((t) => (t.id === updated.id ? updated : t)),
    });
    try {
      await putTransaction(updated);
    } catch {
      dispatch({ type: 'SET_TRANSACTIONS', transactions: prev });
    }
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    const prev = dataRef.current.transactions;
    dispatch({ type: 'SET_TRANSACTIONS', transactions: prev.filter((t) => t.id !== id) });
    try {
      await deleteTransaction(id);
    } catch {
      dispatch({ type: 'SET_TRANSACTIONS', transactions: prev });
    }
  }, []);

  // ---- Categories ----------------------------------------------------------

  const addCategory = useCallback(
    async (catData: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => {
      const cat: Category = { ...catData, id: newId(), createdAt: Date.now(), isDefault: false };
      const prev = dataRef.current.categories;
      dispatch({ type: 'SET_CATEGORIES', categories: [...prev, cat] });
      try {
        await putCategory(cat);
      } catch {
        dispatch({ type: 'SET_CATEGORIES', categories: prev });
      }
    },
    [],
  );

  const updateCategory = useCallback(async (cat: Category) => {
    const prev = dataRef.current.categories;
    dispatch({ type: 'SET_CATEGORIES', categories: prev.map((c) => (c.id === cat.id ? cat : c)) });
    try {
      await putCategory(cat);
    } catch {
      dispatch({ type: 'SET_CATEGORIES', categories: prev });
    }
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    const prev = dataRef.current.categories;
    dispatch({ type: 'SET_CATEGORIES', categories: prev.filter((c) => c.id !== id) });
    try {
      await deleteCategory(id);
    } catch {
      dispatch({ type: 'SET_CATEGORIES', categories: prev });
    }
  }, []);

  // ---- Budgets -------------------------------------------------------------

  const addBudget = useCallback(async (budgetData: Omit<Budget, 'id' | 'createdAt'>) => {
    const budget: Budget = { ...budgetData, id: newId(), createdAt: Date.now() };
    const prev = dataRef.current.budgets;
    dispatch({ type: 'SET_BUDGETS', budgets: [...prev, budget] });
    try {
      await putBudget(budget);
    } catch {
      dispatch({ type: 'SET_BUDGETS', budgets: prev });
    }
  }, []);

  const updateBudget = useCallback(async (budget: Budget) => {
    const prev = dataRef.current.budgets;
    dispatch({ type: 'SET_BUDGETS', budgets: prev.map((b) => (b.id === budget.id ? budget : b)) });
    try {
      await putBudget(budget);
    } catch {
      dispatch({ type: 'SET_BUDGETS', budgets: prev });
    }
  }, []);

  const removeBudget = useCallback(async (id: string) => {
    const prev = dataRef.current.budgets;
    dispatch({ type: 'SET_BUDGETS', budgets: prev.filter((b) => b.id !== id) });
    try {
      await deleteBudget(id);
    } catch {
      dispatch({ type: 'SET_BUDGETS', budgets: prev });
    }
  }, []);

  // ---- Reminders -----------------------------------------------------------

  const addReminder = useCallback(async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const reminder: Reminder = { ...reminderData, id: newId(), createdAt: Date.now() };
    const prev = dataRef.current.reminders;
    dispatch({ type: 'SET_REMINDERS', reminders: [...prev, reminder] });
    try {
      await putReminder(reminder);
    } catch {
      dispatch({ type: 'SET_REMINDERS', reminders: prev });
    }
  }, []);

  const updateReminder = useCallback(async (reminder: Reminder) => {
    const prev = dataRef.current.reminders;
    dispatch({ type: 'SET_REMINDERS', reminders: prev.map((r) => (r.id === reminder.id ? reminder : r)) });
    try {
      await putReminder(reminder);
    } catch {
      dispatch({ type: 'SET_REMINDERS', reminders: prev });
    }
  }, []);

  const removeReminder = useCallback(async (id: string) => {
    const prev = dataRef.current.reminders;
    dispatch({ type: 'SET_REMINDERS', reminders: prev.filter((r) => r.id !== id) });
    try {
      await deleteReminder(id);
    } catch {
      dispatch({ type: 'SET_REMINDERS', reminders: prev });
    }
  }, []);

  // ---- Clear All -------------------------------------------------------------

  const clearAll = useCallback(async () => {
    await clearAllData();
    dispatch({
      type: 'LOADED',
      data: { wallets: [], transactions: [], categories: [], budgets: [], reminders: [] },
    });
  }, []);

  // ---- Derived -------------------------------------------------------------

  const getWalletBalance = useCallback(
    (walletId: string): number => {
      const wallet = data.wallets.find((w) => w.id === walletId);
      if (!wallet) return 0;
      return computeWalletBalance(wallet, data.transactions);
    },
    [data.wallets, data.transactions],
  );

  return (
    <AppDataContext.Provider
      value={{
        ...data,
        addWallet,
        updateWallet,
        removeWallet,
        addTransaction,
        updateTransaction,
        removeTransaction,
        addCategory,
        updateCategory,
        removeCategory,
        addBudget,
        updateBudget,
        removeBudget,
        addReminder,
        updateReminder,
        removeReminder,
        getWalletBalance,
        reload,
        clearAll,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
