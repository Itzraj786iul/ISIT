import { NextResponse } from 'next/server';

type BucketOpts = {
  windowMs: number;
  max: number;
};

/** In-memory sliding window — resets on cold starts (serverless); use Redis/Upstash for strict prod quotas. */
const buckets = new Map<string, number[]>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || 'unknown';
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export function rateLimitOr429(req: Request, key: string, opts: BucketOpts): NextResponse | null {
  const windowMs = opts.windowMs;
  const max = opts.max;
  const now = Date.now();

  let timestamps = buckets.get(key) ?? [];
  timestamps = timestamps.filter((t) => now - t < windowMs);

  if (timestamps.length >= max) {
    const retryAfterSec = Math.max(1, Math.ceil(windowMs / 1000));
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please wait and try again.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      }
    );
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return null;
}

/** Reads limits from env with sensible defaults for AI routes. */
export function aiRateLimitForUser(req: Request, userId: string): NextResponse | null {
  const windowMs = Number(process.env.RATE_LIMIT_AI_WINDOW_MS) || 60_000;
  const max = Number(process.env.RATE_LIMIT_AI_MAX_PER_WINDOW) || 40;
  return rateLimitOr429(req, `ai:user:${userId}`, { windowMs, max });
}
