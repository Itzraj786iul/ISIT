'use client';

import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import ThemeSync from '@/components/ThemeSync';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeSync />
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}
