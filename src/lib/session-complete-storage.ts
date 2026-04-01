/** Short-lived stats after a learning session ends — read on dashboard, cleared when modal closes. */

export const SESSION_COMPLETE_STORAGE_KEY = 'isit_last_session_complete';

export type LastSessionCompleteStats = {
  v: 1;
  timeSpentSeconds: number;
  questionsAnswered: number;
  questionsCorrect: number;
  topicName?: string;
  topicId?: string;
  endedAt: string;
};

export function writeSessionCompleteStats(stats: Omit<LastSessionCompleteStats, 'v' | 'endedAt'> & { endedAt?: string }): void {
  if (typeof window === 'undefined') return;
  const payload: LastSessionCompleteStats = {
    v: 1,
    timeSpentSeconds: Math.max(0, Math.floor(stats.timeSpentSeconds)),
    questionsAnswered: Math.max(0, Math.floor(stats.questionsAnswered)),
    questionsCorrect: Math.max(0, Math.floor(stats.questionsCorrect)),
    topicName: stats.topicName,
    topicId: stats.topicId,
    endedAt: stats.endedAt ?? new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_COMPLETE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function readSessionCompleteStats(): LastSessionCompleteStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_COMPLETE_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<LastSessionCompleteStats>;
    if (o.v !== 1) return null;
    return {
      v: 1,
      timeSpentSeconds: typeof o.timeSpentSeconds === 'number' ? o.timeSpentSeconds : 0,
      questionsAnswered: typeof o.questionsAnswered === 'number' ? o.questionsAnswered : 0,
      questionsCorrect: typeof o.questionsCorrect === 'number' ? o.questionsCorrect : 0,
      topicName: typeof o.topicName === 'string' ? o.topicName : undefined,
      topicId: typeof o.topicId === 'string' ? o.topicId : undefined,
      endedAt: typeof o.endedAt === 'string' ? o.endedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearSessionCompleteStats(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_COMPLETE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function formatSessionDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  if (r === 0) return `${m} min`;
  return `${m} min ${r}s`;
}
