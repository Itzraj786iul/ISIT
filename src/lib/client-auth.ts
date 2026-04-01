/**
 * Client-side auth mirror for `NEXT_PUBLIC_USE_EXTERNAL_API` (Bearer from localStorage).
 * httpOnly cookie remains the source of truth for same-origin Next.js API routes.
 */

export const STORAGE_USER_KEY = 'user';

export function persistAuthFromLogin(token: string, user: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const t = token?.trim();
  if (t) {
    localStorage.setItem('auth_token', t);
  }
  try {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore quota */
  }
}

export function clearClientAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem(STORAGE_USER_KEY);
}
