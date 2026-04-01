/**
 * Session player endpoints — internal Next routes or FastAPI (see api-client).
 * Paths (external): GET sessions/:id, POST events, POST sessions/ask, POST sessions/end
 */
import { apiRequest, isExternalApiEnabled, unwrapSessionPayload, unwrapTutorReply, type ApiResult } from '@/lib/api-client';
import type { QuickAction } from '@/lib/tutor-adaptive';

function pathSessions(id: string): string {
  return isExternalApiEnabled() ? `sessions/${id}` : `/api/sessions/${id}`;
}

function pathEvents(): string {
  return isExternalApiEnabled() ? `events` : `/api/events`;
}

function pathAsk(): string {
  return isExternalApiEnabled() ? `sessions/ask` : `/api/sessions/ask`;
}

function pathEnd(): string {
  return isExternalApiEnabled() ? `sessions/end` : `/api/sessions/end`;
}

export async function fetchSessionById(
  sessionId: string,
  returnUrl?: string
): Promise<ApiResult<unknown> & { session: Record<string, unknown> | null }> {
  const r = await apiRequest<unknown>(pathSessions(sessionId), {
    method: 'GET',
    returnUrl,
    redirectOn401: true,
  });
  const session = r.ok ? unwrapSessionPayload(r.data) : null;
  return { ...r, session };
}

export async function postSessionEvent(
  body: Record<string, unknown>
): Promise<ApiResult<unknown>> {
  return apiRequest(pathEvents(), {
    method: 'POST',
    body,
    redirectOn401: false,
  });
}

export type TutorAskPhase = 'normal' | 'teachback_invite' | 'teachback_submit';

export async function postSessionAsk(payload: {
  sessionId: string;
  message?: string;
  tab?: string;
  phase?: TutorAskPhase;
  quickAction?: QuickAction;
}): Promise<
  ApiResult<unknown> & {
    reply: string | null;
    adaptive: { difficulty?: string; mode?: string; mastery_score?: number } | null;
  }
> {
  const tab = payload.tab ?? 'explain';
  const message = payload.message ?? '';
  const body = isExternalApiEnabled()
    ? {
        session_id: payload.sessionId,
        message,
        tab,
        phase: payload.phase,
        quick_action: payload.quickAction,
      }
    : {
        sessionId: payload.sessionId,
        message,
        tab,
        phase: payload.phase,
        quickAction: payload.quickAction,
      };
  const r = await apiRequest<unknown>(pathAsk(), {
    method: 'POST',
    body,
    redirectOn401: true,
  });
  const reply = r.ok ? unwrapTutorReply(r.data) : null;
  let adaptive: { difficulty?: string; mode?: string; mastery_score?: number } | null = null;
  if (r.ok && r.data && typeof r.data === 'object') {
    const root = r.data as {
      success?: boolean;
      data?: { adaptive?: { difficulty?: string; mode?: string; mastery_score?: number } };
    };
    if (root.success && root.data?.adaptive && typeof root.data.adaptive === 'object') {
      adaptive = root.data.adaptive as { difficulty?: string; mode?: string; mastery_score?: number };
    }
  }
  return { ...r, reply, adaptive };
}

export async function postSessionEnd(sessionId: string): Promise<ApiResult<unknown>> {
  const body = isExternalApiEnabled()
    ? { session_id: sessionId }
    : { sessionId };
  return apiRequest(pathEnd(), {
    method: 'POST',
    body,
    redirectOn401: false,
  });
}
