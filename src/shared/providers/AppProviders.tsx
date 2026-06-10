import React from 'react';
import { ToastProvider } from '@/shared/components/Toast';
import { AuthProvider } from '@/features/auth/AuthContext';
import { useRecurringCheck } from '@/features/recurring/useRecurringCheck';

interface AppProvidersProps {
  children: React.ReactNode;
}

function RecurringChecker() {
  useRecurringCheck();
  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <RecurringChecker />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
