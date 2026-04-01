/** Lightweight request validation (no extra deps). */

const EMAIL_MAX = 320;
const PASSWORD_MAX = 128;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  if (!s || s.length > EMAIL_MAX) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return null;
  return s;
}

export function parsePassword(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  if (raw.length < 1 || raw.length > PASSWORD_MAX) return null;
  return raw;
}

export function parseRememberMe(raw: unknown): boolean {
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
}
