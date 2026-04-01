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
    const { sessionId, eventType, content, metadata, is_correct, isCorrect, response_time_ms, responseTimeMs } = body;

    if (!sessionId) return errorResponse('sessionId is required', 400);

    const typeVal =
      typeof eventType === 'string' && VALID_EVENT_TYPES.includes(eventType as (typeof VALID_EVENT_TYPES)[number])
        ? (eventType as (typeof VALID_EVENT_TYPES)[number])
        : null;
    if (!typeVal) {
      return errorResponse(`eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}`, 400);
    }

    const sessionDoc = await getSessionById(sessionId);
    if (!sessionDoc) return errorResponse('Session not found', 404);
    const session = sessionDoc as unknown as { organization_id: unknown; student_id?: unknown };
    if (String(session.student_id) !== auth.userId) return errorResponse('Forbidden', 403);

    const correctVal = typeof is_correct === 'boolean' ? is_correct : typeof isCorrect === 'boolean' ? isCorrect : undefined;
    const rtVal =
      typeof response_time_ms === 'number'
        ? response_time_ms
        : typeof responseTimeMs === 'number'
          ? responseTimeMs
          : undefined;

    const event = await createSessionEvent({
      organization_id: session.organization_id as mongoose.Types.ObjectId,
      session_id: new mongoose.Types.ObjectId(sessionId),
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
    console.error('[POST /api/session-events]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
