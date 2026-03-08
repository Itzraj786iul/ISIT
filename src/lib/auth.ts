import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'auth_token';
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type JWTPayload = { userId: string; role: string; email?: string };

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET must be set and at least 16 characters');
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JWTPayload, maxAge: number = DEFAULT_MAX_AGE): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;
    const role = (payload.role as string) || 'Student';
    if (!userId) return null;
    return { userId, role, email: payload.email as string | undefined };
  } catch {
    return null;
  }
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

/** Get auth from Request (e.g. in API route). Reads cookie and verifies JWT. */
export async function getAuthFromRequest(req: Request): Promise<JWTPayload | null> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];
  if (!token) return null;
  return verifyToken(token);
}

/** Build Set-Cookie header value for auth token (httpOnly, secure in prod). */
export function buildAuthCookie(token: string, maxAge: number = DEFAULT_MAX_AGE): string {
  const isProd = process.env.NODE_ENV === 'production';
  const base = `${COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
  return isProd ? `${base}; Secure` : base;
}
