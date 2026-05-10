import { describe, it, expect } from 'vitest';
import { rateLimitOr429 } from '@/lib/rate-limit';

describe('rateLimitOr429', () => {
  it('allows requests under max', () => {
    const req = new Request('http://localhost/api/test');
    const r1 = rateLimitOr429(req, 'u1', { windowMs: 60_000, max: 3 });
    const r2 = rateLimitOr429(req, 'u1', { windowMs: 60_000, max: 3 });
    expect(r1).toBeNull();
    expect(r2).toBeNull();
  });

  it('returns 429 after max within window', () => {
    const req = new Request('http://localhost/api/test');
    rateLimitOr429(req, 'u2', { windowMs: 60_000, max: 2 });
    rateLimitOr429(req, 'u2', { windowMs: 60_000, max: 2 });
    const blocked = rateLimitOr429(req, 'u2', { windowMs: 60_000, max: 2 });
    expect(blocked?.status).toBe(429);
  });
});
