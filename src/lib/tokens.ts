import crypto from 'crypto';

export function randomUrlToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
