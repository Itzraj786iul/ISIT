/**
 * Session analytics events — canonical POST for the session player (snake_case body).
 * Persists via the same storage as /api/session-events.
 */
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { getSessionById, createSessionEvent } from '@/lib/learning-execution';
import { successResponse, errorResponse } from '@/lib/api-response';

const VALID_EVENT_TYPES = [
  'question',
  'answer',
  'pause',
  'rewind',
  'play',
  'hint_request',
  'teachback',
  'teachback_attempt',
  'hint_given',
  'explanation_given',
  'difficulty_changed',
  'session_end',
  'start_learning_click',
] as const;

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const session_id = body.session_id ?? body.sessionId;
    const event_type = body.event_type ?? body.eventType;
    const content = body.content;
    const is_correct = body.is_correct ?? body.isCorrect;
    const response_time_ms = body.response_time_ms ?? body.responseTimeMs;
    const metadata = body.metadata;

    if (!session_id || typeof session_id !== 'string') {
      return errorResponse('session_id is required', 400);
    }

    const typeVal =
      typeof event_type === 'string' && VALID_EVENT_TYPES.includes(event_type as (typeof VALID_EVENT_TYPES)[number])
        ? (event_type as (typeof VALID_EVENT_TYPES)[number])
        : null;
    if (!typeVal) {
      return errorResponse(`event_type must be one of: ${VALID_EVENT_TYPES.join(', ')}`, 400);
    }

    const sessionDoc = await getSessionById(session_id);
    if (!sessionDoc) return errorResponse('Session not found', 404);
    const session = sessionDoc as unknown as { organization_id: unknown; student_id?: unknown };
    if (String(session.student_id) !== auth.userId) return errorResponse('Forbidden', 403);

    const correctVal = typeof is_correct === 'boolean' ? is_correct : undefined;
    const rtVal = typeof response_time_ms === 'number' && Number.isFinite(response_time_ms) ? response_time_ms : undefined;

    const event = await createSessionEvent({
      organization_id: session.organization_id as mongoose.Types.ObjectId,
      session_id: new mongoose.Types.ObjectId(session_id),
      student_id: new mongoose.Types.ObjectId(auth.userId),
      event_type: typeVal,
      content: typeof content === 'string' ? content : undefined,
      metadata: metadata ?? undefined,
      is_correct: correctVal,
      response_time_ms: rtVal,
    });

    const eventObj = event.toObject ? event.toObject() : event;
    return successResponse(eventObj, 201);
  } catch (error) {
    console.error('[POST /api/events]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
