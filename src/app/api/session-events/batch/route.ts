import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { getSessionById, createSessionEventsBatch } from '@/lib/learning-execution';
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

type EventItem = {
  sessionId: string;
  eventType: string;
  content?: string;
  metadata?: unknown;
};

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return errorResponse('events array is required and must not be empty', 400);
    }
    if (events.length > 50) return errorResponse('Maximum 50 events per batch', 400);

    const toInsert: import('@/lib/learning-execution').CreateSessionEventInput[] = [];
    for (const item of events as EventItem[]) {
      if (!item.sessionId || typeof item.eventType !== 'string') continue;
      const typeVal = VALID_EVENT_TYPES.includes(item.eventType as (typeof VALID_EVENT_TYPES)[number])
        ? (item.eventType as (typeof VALID_EVENT_TYPES)[number])
        : null;
      if (!typeVal) continue;

      const sessionDoc = await getSessionById(item.sessionId);
      if (!sessionDoc) continue;
      const sid = (sessionDoc as { student_id?: unknown }).student_id;
      if (String(sid) !== auth.userId) continue;

      const orgId = (sessionDoc as { organization_id?: unknown }).organization_id;
      toInsert.push({
        organization_id: orgId as mongoose.Types.ObjectId,
        session_id: new mongoose.Types.ObjectId(item.sessionId),
        student_id: new mongoose.Types.ObjectId(auth.userId),
        event_type: typeVal,
        content: typeof item.content === 'string' ? item.content : undefined,
        metadata: item.metadata,
      });
    }

    if (toInsert.length === 0) {
      return successResponse({ inserted: 0, ids: [] }, 201);
    }

    const docs = await createSessionEventsBatch(toInsert);
    const ids = docs.map((d) => (d as { _id?: unknown })._id?.toString?.() ?? String((d as { _id?: unknown })._id));
    return successResponse({ inserted: docs.length, ids }, 201);
  } catch (error) {
    console.error('[POST /api/session-events/batch]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
