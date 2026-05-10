/**
 * User-facing copy for fetch/API failures (client + server helpers).
 */

export function isLikelyNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    const m = err.message.toLowerCase();
    return m.includes('fetch') || m.includes('network') || m.includes('failed to fetch');
  }
  return false;
}

export function friendlyNetworkMessage(): string {
  return 'Check your connection and try again.';
}

export function friendlyHttpMessage(status: number, serverMessage?: string | null): string {
  if (status === 401) return 'Please sign in again.';
  if (status === 403) return 'You do not have access to this.';
  if (status >= 500) return 'Something went wrong on our end. Please try again later.';
  const t = serverMessage?.trim();
  if (t) return t;
  return 'Something went wrong. Please try again.';
}

export function friendlyFetchFailure(err: unknown, status?: number, serverMessage?: string | null): string {
  if (err != null && isLikelyNetworkError(err)) return friendlyNetworkMessage();
  if (typeof status === 'number') return friendlyHttpMessage(status, serverMessage);
  return friendlyNetworkMessage();
}
