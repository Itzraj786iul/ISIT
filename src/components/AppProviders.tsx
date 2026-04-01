'use client';

import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AuthProvider>
  );
}
