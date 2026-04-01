/**
 * Central HTTP client — Next.js internal `/api/*` or external FastAPI (`NEXT_PUBLIC_API_BASE_URL`).
 * Toggle: NEXT_PUBLIC_USE_EXTERNAL_API=true|false
 *
 * External mode: sends Authorization: Bearer <token> from localStorage (`auth_token` / `access_token`)
 * or readable `auth_token` cookie. Default JWT cookie is httpOnly — sync token to localStorage for
 * cross-origin calls, or expose a BFF route that proxies to FastAPI.
 */

import { clearClientAuth } from '@/lib/client-auth';

const AUTH_COOKIE_NAME = 'auth_token';
const LOCAL_STORAGE_TOKEN_KEYS = ['auth_token', 'access_token'] as const;

export function isExternalApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_EXTERNAL_API === 'true';
}

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  return raw.replace(/\/$/, '');
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return m ? decodeURIComponent(m[1].trim()) : null;
}

/** Token readable from JS (localStorage or non-httpOnly cookie). */
export function getClientAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const key of LOCAL_STORAGE_TOKEN_KEYS) {
    const v = localStorage.getItem(key);
    if (v && v.trim()) return v.trim();
  }
  const fromCookie = readCookie(AUTH_COOKIE_NAME);
  if (fromCookie) return fromCookie;
  return null;
}

export type FetchWithAuthOptions = RequestInit & {
  /** Redirect to /login after clearing client auth. Default true. */
  redirectOn401?: boolean;
  /** `returnUrl` query for login when redirecting on 401 */
  returnUrl?: string;
  /** Redirect to /dashboard on 403. Default false. */
  redirectOn403?: boolean;
};

/** Path-style URL → same document origin (Next.js App Router `/api/*`). Not rewritten to FastAPI. */
function sameOriginRequestUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

function credentialsForResolvedUrl(resolved: string): RequestCredentials {
  if (resolved.startsWith('/')) return 'include';
  try {
    const u = new URL(resolved);
    if (u.origin === window.location.origin) return 'include';
  } catch {
    /* ignore */
  }
  return 'omit';
}

/**
 * Browser `fetch` for **same-origin Next.js** `/api/*` routes (dashboard, topic page, etc.).
 * Does **not** use `NEXT_PUBLIC_USE_EXTERNAL_API` — that remains for `apiRequest` / session-api → FastAPI.
 * Adds `Authorization: Bearer` when a client token exists; `credentials: 'include'` when same-origin.
 * On 401: always `clearClientAuth()`; optionally redirects to `/login`.
 * On 403: optionally redirects to `/dashboard`.
 */
export async function fetchWithAuth(url: string, init?: FetchWithAuthOptions): Promise<Response> {
  if (typeof window === 'undefined') {
    throw new Error('fetchWithAuth is client-only');
  }

  const {
    redirectOn401 = true,
    returnUrl: returnUrlOpt,
    redirectOn403 = false,
    headers: inputHeaders,
    ...rest
  } = init ?? {};

  const resolved = sameOriginRequestUrl(url);

  const headers = new Headers(inputHeaders ?? undefined);
  const token = getClientAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const credentials = credentialsForResolvedUrl(resolved);

  const res = await fetch(resolved, {
    ...rest,
    headers,
    credentials,
  });

  if (res.status === 401) {
    clearClientAuth();
    if (redirectOn401) {
      const ru = returnUrlOpt ?? `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?returnUrl=${encodeURIComponent(ru)}`);
    }
    return res;
  }

  if (res.status === 403 && redirectOn403) {
    window.location.assign('/dashboard');
    return res;
  }

  return res;
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  /** Default true. Set false for FormData uploads. */
  parseJson?: boolean;
  /** Redirect browser to /login on 401 (client only). Default true. */
  redirectOn401?: boolean;
  /** Used for login returnUrl when redirecting on 401 */
  returnUrl?: string;
  /** JSON-serializable object or string / FormData / Blob */
  body?: BodyInit | Record<string, unknown> | null;
};

export type ApiResultKind = 'success' | 'http_error' | 'network' | 'unauthorized' | 'forbidden';

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  kind: ApiResultKind;
};

function extractErrorMessage(parsed: unknown): string | null {
  if (parsed == null) return null;
  if (typeof parsed === 'string') return parsed;
  if (typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.error === 'string') return o.error;
  if (typeof o.message === 'string') return o.message;
  if (typeof o.detail === 'string') return o.detail;
  if (Array.isArray(o.detail) && o.detail.length > 0) {
    const first = o.detail[0] as Record<string, unknown>;
    if (typeof first?.msg === 'string') return first.msg as string;
  }
  return null;
}

function resolveUrl(path: string): string {
  const external = isExternalApiEnabled();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  if (external) {
    return `${getApiBaseUrl()}/${normalized}`;
  }
  return path.startsWith('/') ? path : `/${path}`;
}

function prepareBody(body: ApiRequestOptions['body']): { body?: BodyInit; setJson: boolean } {
  if (body == null) return { setJson: false };
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return { body, setJson: false };
  }
  if (typeof body === 'string') {
    return { body, setJson: true };
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return { body, setJson: false };
  }
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return { body, setJson: false };
  }
  if (typeof body === 'object') {
    return { body: JSON.stringify(body), setJson: true };
  }
  return { setJson: false };
}

/**
 * Single entry for session / AI backend calls.
 * Internal: same-origin + credentials (httpOnly cookie).
 * External: Bearer token + JSON (configure CORS on FastAPI).
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  const {
    parseJson = true,
    redirectOn401 = true,
    returnUrl,
    headers: initHeaders,
    body: rawBody,
    ...rest
  } = options;

  const external = isExternalApiEnabled();
  const url = resolveUrl(path);
  const { body, setJson } = prepareBody(rawBody ?? undefined);

  const headers = new Headers(initHeaders);
  if (setJson && body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getClientAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchInit: RequestInit = {
    ...rest,
    body: body ?? undefined,
    headers,
    credentials: external ? 'omit' : 'include',
  };

  try {
    const res = await fetch(url, fetchInit);

    let parsed: unknown = null;
    if (parseJson && res.status !== 204) {
      const text = await res.text();
      if (text) {
        try {
          parsed = JSON.parse(text) as unknown;
        } catch {
          parsed = null;
        }
      }
    }

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        clearClientAuth();
      }
      if (redirectOn401 && typeof window !== 'undefined') {
        const ru = returnUrl ?? `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?returnUrl=${encodeURIComponent(ru)}`);
      }
      return {
        ok: false,
        status: 401,
        data: null,
        error: extractErrorMessage(parsed) ?? 'Unauthorized',
        kind: 'unauthorized',
      };
    }

    if (res.status === 403) {
      return {
        ok: false,
        status: 403,
        data: (parsed as T) ?? null,
        error: extractErrorMessage(parsed) ?? 'Access denied',
        kind: 'forbidden',
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: extractErrorMessage(parsed) ?? (res.statusText || 'Request failed'),
        kind: 'http_error',
      };
    }

    return {
      ok: true,
      status: res.status,
      data: (parsed as T) ?? (null as T),
      error: null,
      kind: 'success',
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Network error. Check your connection and API URL.',
      kind: 'network',
    };
  }
}

/** Next.js `{ success, data }` or raw FastAPI session document. */
export function unwrapSessionPayload(parsed: unknown): Record<string, unknown> | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (o.success === true && o.data != null && typeof o.data === 'object') {
    return o.data as Record<string, unknown>;
  }
  if ('_id' in o || 'topic_id' in o || 'completion_status' in o) {
    return o;
  }
  return null;
}

/** Next envelope or FastAPI `{ message }` / `{ answer }`. */
export function unwrapTutorReply(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (o.success === true && o.data != null && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>;
    const m = d.message ?? d.answer;
    if (typeof m === 'string' && m.trim()) return m;
  }
  const direct = o.message ?? o.answer;
  if (typeof direct === 'string' && direct.trim()) return direct;
  return null;
}
