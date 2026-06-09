import React from 'react';
import { ToastProvider } from '@/shared/components/Toast';
import { AuthProvider } from '@/features/auth/AuthContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
