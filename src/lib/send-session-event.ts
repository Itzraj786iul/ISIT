/**
 * Client helper for session telemetry — POST /api/events or external FastAPI /events (via session-api).
 * Failures are non-fatal — returns false so UI never throws.
 */
import { postSessionEvent } from '@/lib/session-api';

export type SessionPlayerEventType =
  | 'question'
  | 'answer'
  | 'pause'
  | 'rewind'
  | 'play'
  | 'hint_request'
  | 'teachback'
  | 'teachback_attempt'
  | 'hint_given'
  | 'explanation_given'
  | 'difficulty_changed'
  | 'session_end'
  | 'start_learning_click';

export type SendEventInput = {
  session_id: string;
  event_type: SessionPlayerEventType;
  content?: string;
  is_correct?: boolean;
  response_time_ms?: number;
  metadata?: unknown;
};

export async function sendEvent(input: SendEventInput): Promise<boolean> {
  try {
    const r = await postSessionEvent(input as unknown as Record<string, unknown>);
    return r.ok;
  } catch {
    return false;
  }
}
