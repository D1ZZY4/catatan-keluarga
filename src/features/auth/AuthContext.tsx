import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { hasEncryptionKey, verifyPin, initEncryptionKey, clearEncryptionKey } from '@/shared/crypto';

interface AuthState {
  isAuthenticated: boolean;
  isPinSet: boolean;
  isLoading: boolean;
  lockTimeout: number;
  failedAttempts: number;
  lockedUntil: number | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PIN_STATUS'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOCK_TIMEOUT'; payload: number }
  | { type: 'FAILED_ATTEMPT' }
  | { type: 'RESET_ATTEMPTS' }
  | { type: 'SET_LOCKED'; payload: number }
  | { type: 'LOCK' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PIN_STATUS':
      return { ...state, isPinSet: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload, isLoading: false };
    case 'SET_LOCK_TIMEOUT':
      return { ...state, lockTimeout: action.payload };
    case 'FAILED_ATTEMPT': {
      const newAttempts = state.failedAttempts + 1;
      const lockedUntil = newAttempts >= 5 ? Date.now() + 30_000 : null;
      return { ...state, failedAttempts: newAttempts, ...(lockedUntil ? { lockedUntil } : {}) };
    }
    case 'RESET_ATTEMPTS':
      return { ...state, failedAttempts: 0, lockedUntil: null };
    case 'SET_LOCKED':
      return { ...state, lockedUntil: action.payload };
    case 'LOCK':
      return { ...state, isAuthenticated: false };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  setupPin: (pin: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lock: () => void;
  resetAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isPinSet: false,
    isLoading: true,
    lockTimeout: 60,
    failedAttempts: 0,
    lockedUntil: null,
  });

  let backgroundAt: number | null = null;

  useEffect(() => {
    void checkPinStatus();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [state.lockTimeout, state.isAuthenticated]);

  const handleAppState = useCallback((status: AppStateStatus) => {
    if (status === 'background' || status === 'inactive') {
      backgroundAt = Date.now();
    } else if (status === 'active' && backgroundAt !== null) {
      const elapsed = (Date.now() - backgroundAt) / 1000;
      if (elapsed >= state.lockTimeout && state.isAuthenticated) {
        dispatch({ type: 'LOCK' });
      }
      backgroundAt = null;
    }
  }, [state.lockTimeout, state.isAuthenticated]);

  async function checkPinStatus() {
    try {
      const hasPIN = await hasEncryptionKey();
      dispatch({ type: 'SET_PIN_STATUS', payload: hasPIN });
      if (!hasPIN) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function setupPin(pin: string): Promise<void> {
    await initEncryptionKey(pin);
    dispatch({ type: 'SET_PIN_STATUS', payload: true });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    dispatch({ type: 'RESET_ATTEMPTS' });
  }

  async function unlockWithPin(pin: string): Promise<boolean> {
    if (state.lockedUntil && Date.now() < state.lockedUntil) return false;
    const valid = await verifyPin(pin);
    if (valid) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'RESET_ATTEMPTS' });
      return true;
    } else {
      dispatch({ type: 'FAILED_ATTEMPT' });
      return false;
    }
  }

  async function unlockWithBiometrics(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return false;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Masuk ke Catatan Keuangan',
        cancelLabel: 'Batalkan',
        fallbackLabel: 'Gunakan PIN',
      });
      if (result.success) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'RESET_ATTEMPTS' });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function lock() {
    dispatch({ type: 'LOCK' });
  }

  async function resetAuth(): Promise<void> {
    await clearEncryptionKey();
    dispatch({ type: 'SET_PIN_STATUS', payload: false });
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    dispatch({ type: 'RESET_ATTEMPTS' });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setupPin,
        unlockWithPin,
        unlockWithBiometrics,
        lock,
        resetAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}
