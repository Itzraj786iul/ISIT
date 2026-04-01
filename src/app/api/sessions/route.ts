import { getAuthFromRequest } from '@/lib/auth';
import { createSession, getSessionsForStudent } from '@/lib/learning-execution';
import { getTopicById } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const sessions = await getSessionsForStudent(auth.userId);
    return successResponse(sessions, 200);
  } catch (error) {
    console.error('[GET /api/sessions]', error);
    return errorResponse('Internal Server Error', 500);
  }
}

const VALID_MODES = ['explorer', 'revision', 'exam'] as const;

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { topicId, subjectId, mode } = body;

    if (!topicId) return errorResponse('topicId is required', 400);
    if (!subjectId) return errorResponse('subjectId is required', 400);
    const modeVal = typeof mode === 'string' && VALID_MODES.includes(mode as (typeof VALID_MODES)[number])
      ? (mode as (typeof VALID_MODES)[number])
      : 'explorer';

    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const orgId = (topic as { organization_id?: unknown }).organization_id;
    if (!orgId) return errorResponse('Topic has no organization', 400);

    const mongoose = (await import('mongoose')).default;
    const session = await createSession({
      organization_id: orgId as import('mongoose').Types.ObjectId,
      student_id: new mongoose.Types.ObjectId(auth.userId),
      topic_id: new mongoose.Types.ObjectId(topicId),
      subject_id: new mongoose.Types.ObjectId(subjectId),
      mode: modeVal,
      start_time: new Date(),
    });

    const sessionObj = session.toObject ? session.toObject() : session;
    return successResponse(sessionObj, 201);
  } catch (error) {
    console.error('[POST /api/sessions]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
