/**
 * AI-first: single learning session by id (Subject → Topic → Session).
 * Used by /session/[id] and future resume flows. Not part of legacy Course/Lesson APIs.
 */
import { getAuthFromRequest } from '@/lib/auth';
import { getSessionById } from '@/lib/learning-execution';
import { getTopicById } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(_req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    if (!id) return errorResponse('Session id required', 400);

    const session = await getSessionById(id);
    if (!session) return errorResponse('Session not found', 404);

    const studentId = (session as { student_id?: { toString(): string } }).student_id?.toString?.();
    if (studentId !== auth.userId) {
      return errorResponse('Forbidden', 403);
    }

    const topicId = (session as { topic_id?: unknown }).topic_id;
    let topic_name: string | undefined;
    if (topicId != null) {
      const topic_id_str = topicId.toString?.() ?? String(topicId);
      const topicDoc = await getTopicById(topic_id_str);
      if (topicDoc) {
        topic_name = (topicDoc as { topic_name?: string }).topic_name;
      }
    }

    const payload = { ...(session as Record<string, unknown>), topic_name };
    return successResponse(payload, 200);
  } catch (error) {
    console.error('[GET /api/sessions/[id]]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
