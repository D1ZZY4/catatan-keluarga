/**
 * AuthContext — PIN/biometric gate.
 * isUnlocked: true saat user sudah lewati lock screen.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { e2e } from '../crypto/e2e';

interface AuthContextValue {
  isUnlocked: boolean;
  isLockEnabled: boolean;
  unlock: () => Promise<boolean>;
  lock: () => void;
  setLockEnabled: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue>({
  isUnlocked: true,
  isLockEnabled: false,
  unlock: async () => true,
  lock: () => {},
  setLockEnabled: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isLockEnabled, setLockEnabled] = useState(false);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (!isLockEnabled) { setIsUnlocked(true); return true; }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifikasi identitas Anda',
        cancelLabel: 'Batal',
        fallbackLabel: 'Gunakan PIN',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    }

    setIsUnlocked(true);
    return true;
  }, [isLockEnabled]);

  const lock = useCallback(() => {
    if (isLockEnabled) {
      e2e.lock();
      setIsUnlocked(false);
    }
  }, [isLockEnabled]);

  return (
    <AuthContext.Provider value={{ isUnlocked, isLockEnabled, unlock, lock, setLockEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
