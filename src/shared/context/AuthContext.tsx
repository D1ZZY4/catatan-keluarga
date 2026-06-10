/**
 * AuthContext — PIN / biometric gate untuk Catat Artha.
 * Status flow: initializing → unlocked (no PIN) | locked (PIN set)
 * PIN 6-digit, PBKDF2 via e2e.ts, biometric via expo-local-authentication.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppState, AppStateStatus } from 'react-native';
import { e2e } from '../crypto/e2e';
import { getSetting, setSetting } from '../db/database';

export type AuthStatus = 'initializing' | 'unlocked' | 'locked';

interface AuthContextValue {
  status: AuthStatus;
  isUnlocked: boolean;
  hasPin: boolean;
  autoLockSeconds: number;
  userName: string;
  setupPin: (pin: string, name?: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lock: () => void;
  disablePin: () => Promise<void>;
  setAutoLockSeconds: (s: number) => void;
  setUserName: (name: string) => Promise<void>;
  setLockEnabled: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue>({
  status: 'initializing',
  isUnlocked: false,
  hasPin: false,
  autoLockSeconds: 60,
  userName: 'Pengguna',
  setupPin: async () => {},
  unlockWithPin: async () => false,
  unlockWithBiometric: async () => false,
  lock: () => {},
  disablePin: async () => {},
  setAutoLockSeconds: () => {},
  setUserName: async () => {},
  setLockEnabled: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [hasPin, setHasPin] = useState(false);
  const [autoLockSeconds, setAutoLockSecondsState] = useState(60);
  const [userName, setUserNameState] = useState('Pengguna');
  const [lockEnabled, setLockEnabledState] = useState(false);
  const bgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgEnteredAt = useRef<number | null>(null);

  // Init: cek PIN dan device key
  useEffect(() => {
    async function init() {
      try {
        const [pinExists, storedName, lockPref, autoLock] = await Promise.all([
          e2e.hasPin(),
          getSetting('userName'),
          getSetting('lockEnabled'),
          getSetting('autoLockSeconds'),
        ]);

        if (storedName) setUserNameState(storedName);
        if (autoLock) setAutoLockSecondsState(parseInt(autoLock, 10) || 60);
        const isLockEnabled = lockPref === 'true';
        setLockEnabledState(isLockEnabled);
        setHasPin(pinExists);

        if (pinExists && isLockEnabled) {
          setStatus('locked');
        } else {
          // Unlock tanpa PIN - gunakan device key
          await e2e.unlockWithoutPin();
          setStatus('unlocked');
        }
      } catch {
        await e2e.unlockWithoutPin();
        setStatus('unlocked');
      }
    }
    void init();
  }, []);

  // Auto-lock saat app ke background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        bgEnteredAt.current = Date.now();
      } else if (state === 'active') {
        if (bgEnteredAt.current !== null && lockEnabled && hasPin) {
          const elapsed = (Date.now() - bgEnteredAt.current) / 1000;
          if (elapsed >= autoLockSeconds) {
            e2e.lock();
            setStatus('locked');
          }
        }
        bgEnteredAt.current = null;
      }
    });
    return () => sub.remove();
  }, [lockEnabled, hasPin, autoLockSeconds]);

  const setupPin = useCallback(async (pin: string, name?: string) => {
    await e2e.setupPin(pin);
    setHasPin(true);
    setLockEnabledState(true);
    await setSetting('lockEnabled', 'true');
    if (name) {
      setUserNameState(name);
      await setSetting('userName', name);
    }
    setStatus('unlocked');
  }, []);

  const unlockWithPin = useCallback(async (pin: string): Promise<boolean> => {
    const ok = await e2e.unlockWithPin(pin);
    if (ok) setStatus('unlocked');
    return ok;
  }, []);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHw || !enrolled) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifikasi identitas Anda',
        cancelLabel: 'Batal',
        fallbackLabel: 'Gunakan PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Coba unlock e2e - jika ada PIN, kita perlu PIN-nya, jadi gunakan device key
        if (!hasPin) {
          await e2e.unlockWithoutPin();
        }
        setStatus('unlocked');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [hasPin]);

  const lock = useCallback(() => {
    if (lockEnabled && hasPin) {
      e2e.lock();
      setStatus('locked');
    }
  }, [lockEnabled, hasPin]);

  const disablePin = useCallback(async () => {
    await e2e.unlockWithoutPin();
    setHasPin(false);
    setLockEnabledState(false);
    await setSetting('lockEnabled', 'false');
    setStatus('unlocked');
  }, []);

  const setAutoLockSeconds = useCallback((s: number) => {
    setAutoLockSecondsState(s);
    void setSetting('autoLockSeconds', String(s));
  }, []);

  const setUserName = useCallback(async (name: string) => {
    setUserNameState(name);
    await setSetting('userName', name);
  }, []);

  const setLockEnabled = useCallback((v: boolean) => {
    setLockEnabledState(v);
    void setSetting('lockEnabled', String(v));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        isUnlocked: status === 'unlocked',
        hasPin,
        autoLockSeconds,
        userName,
        setupPin,
        unlockWithPin,
        unlockWithBiometric,
        lock,
        disablePin,
        setAutoLockSeconds,
        setUserName,
        setLockEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
