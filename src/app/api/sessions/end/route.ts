import { getAuthFromRequest } from '@/lib/auth';
import { getSessionById, endSession, applyMasteryFromSessionAnswerEvents } from '@/lib/learning-execution';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { sessionId } = body;

    if (!sessionId) return errorResponse('sessionId is required', 400);

    const existing = await getSessionById(sessionId);
    if (!existing) return errorResponse('Session not found', 404);
    const sid = (existing as { student_id?: unknown }).student_id;
    if (String(sid) !== auth.userId) return errorResponse('Forbidden', 403);

    const statusBefore = (existing as { completion_status?: string }).completion_status;
    const shouldSyncMastery = statusBefore === 'in_progress';

    const session = await endSession(sessionId);
    if (!session) return errorResponse('Session not found', 404);

    if (shouldSyncMastery) {
      try {
        await applyMasteryFromSessionAnswerEvents(sessionId, auth.userId);
      } catch (e) {
        console.error('[POST /api/sessions/end] mastery sync', e);
      }
    }

    const sessionObj = session.toObject ? session.toObject() : session;
    return successResponse(sessionObj, 200);
  } catch (error) {
    console.error('[POST /api/sessions/end]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
