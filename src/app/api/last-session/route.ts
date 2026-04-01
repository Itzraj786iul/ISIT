/** AI-first — latest `Session` summary for dashboard; supports deep links to /session/[id]. */
import { getAuthFromRequest } from '@/lib/auth';
import { getLastSessionForStudent } from '@/lib/learning-execution';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const session = await getLastSessionForStudent(auth.userId);
    if (!session) {
      return successResponse(null, 200);
    }

    const s = session as { _id?: unknown; topic_id?: unknown; subject_id?: unknown; start_time?: unknown };
    const session_id = s._id?.toString?.() ?? String(s._id);
    const topic_id = s.topic_id?.toString?.() ?? String(s.topic_id);
    const subject_id = s.subject_id?.toString?.() ?? String(s.subject_id);
    const start_time = s.start_time;

    // session_id is additive for /session/[id] resume links (docs/AI_FIRST_MIGRATION.md).
    return successResponse({ session_id, topic_id, subject_id, start_time }, 200);
  } catch (error) {
    console.error('[GET /api/last-session]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
