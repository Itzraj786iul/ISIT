/**
 * Minimal structured logging for API and AI paths. Extend with APM later.
 */

type LogLevel = 'error' | 'warn' | 'info';

function line(level: LogLevel, event: string, payload: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, event, ...payload };
  const text = JSON.stringify(entry);
  if (level === 'error') console.error(text);
  else if (level === 'warn') console.warn(text);
  else console.info(text);
}

export const log = {
  apiError(route: string, err: unknown, extra?: Record<string, unknown>) {
    const message = err instanceof Error ? err.message : String(err);
    line('error', 'api_error', { route, message, ...(extra || {}) });
  },

  aiFailure(feature: string, err: unknown, extra?: Record<string, unknown>) {
    const message = err instanceof Error ? err.message : String(err);
    line('error', 'ai_failure', { feature, message, ...(extra || {}) });
  },

  warn(event: string, payload: Record<string, unknown>) {
    line('warn', event, payload);
  },
};
