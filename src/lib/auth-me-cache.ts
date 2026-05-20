/**
 * Deduped, short-lived cache for GET /api/auth/me — avoids duplicate network calls
 * on navigation while AuthProvider and route guards mount.
 */

export type CachedAuthUser = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  organization_id?: string;
  class_id?: string;
  learning_mode?: string;
  email_verified?: boolean;
};

const TTL_MS = 45_000;

let cachedUser: CachedAuthUser | null | undefined;
let cachedAt = 0;
let inflight: Promise<CachedAuthUser | null> | null = null;

function isFresh(): boolean {
  return Date.now() - cachedAt < TTL_MS && cachedUser !== undefined;
}

export function peekAuthMeCache(): CachedAuthUser | null | undefined {
  if (isFresh()) return cachedUser;
  return undefined;
}

export function writeAuthMeCache(user: CachedAuthUser | null): void {
  cachedUser = user;
  cachedAt = Date.now();
}

export function invalidateAuthMeCache(): void {
  cachedUser = undefined;
  cachedAt = 0;
  inflight = null;
}

export async function fetchAuthMeCached(options?: { force?: boolean }): Promise<CachedAuthUser | null> {
  if (!options?.force && isFresh()) {
    return cachedUser ?? null;
  }

  if (!options?.force && inflight) {
    return inflight;
  }

  inflight = (async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.status === 401) {
        writeAuthMeCache(null);
        return null;
      }
      if (!res.ok) {
        return peekAuthMeCache() ?? null;
      }
      const data = (await res.json()) as { user?: CachedAuthUser | null };
      const user = data.user ?? null;
      writeAuthMeCache(user);
      return user;
    } catch {
      return peekAuthMeCache() ?? null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
