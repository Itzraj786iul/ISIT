/** AI-first — create/list learning sessions (Subject → Topic → Session). */
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { createSession, getSessionsForStudent } from '@/lib/learning-execution';
import type { CompletionStatus } from '@/lib/learning-execution';
import { getTopicById } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';
import { updateAssignmentStatus } from '@/lib/assignment-lifecycle';
import { connectToDB } from '@/lib/db';
import { isTopicAssignedToStudent } from '@/lib/student-assigned-topics-data';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const topicIdParam = searchParams.get('topicId') ?? searchParams.get('topic_id');

    const completionStatus: CompletionStatus | undefined =
      status === 'in_progress' || status === 'completed' || status === 'abandoned'
        ? (status as CompletionStatus)
        : undefined;

    let topicObjectId: mongoose.Types.ObjectId | undefined;
    if (topicIdParam) {
      try {
        topicObjectId = new mongoose.Types.ObjectId(topicIdParam);
      } catch {
        return errorResponse('Invalid topic id', 400);
      }
    }

    const sessions = await getSessionsForStudent(auth.userId, {
      completionStatus,
      topicId: topicObjectId,
    });
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
    const topicId = body.topic_id ?? body.topicId;
    const subjectId = body.subject_id ?? body.subjectId;
    const { mode } = body;

    if (!topicId || typeof topicId !== 'string') return errorResponse('topicId or topic_id is required', 400);
    const modeVal = typeof mode === 'string' && VALID_MODES.includes(mode as (typeof VALID_MODES)[number])
      ? (mode as (typeof VALID_MODES)[number])
      : 'explorer';

    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const orgId = (topic as { organization_id?: unknown }).organization_id;
    if (!orgId) return errorResponse('Topic has no organization', 400);

    const topicSubjectId = (topic as { subject_id?: unknown }).subject_id;
    const resolvedSubjectId = subjectId ?? topicSubjectId;
    if (!resolvedSubjectId) return errorResponse('subjectId could not be resolved from topic', 400);

    let session_mode: 'teacher_assigned' | 'free_learning' = 'free_learning';
    let session_source: 'assigned' | 'free' = 'free';
    if ((auth.role || '').toLowerCase() === 'student') {
      try {
        await connectToDB();
        const User = (await import('@/models/User')).default;
        const u = await User.findById(auth.userId)
          .select('class_id organization_id')
          .lean<{ class_id?: mongoose.Types.ObjectId | null; organization_id?: mongoose.Types.ObjectId } | null>();
        const orgStr = (orgId as mongoose.Types.ObjectId).toString();
        if (u?.organization_id?.toString() === orgStr) {
          const classId = u.class_id?.toString() ?? null;
          const assigned = await isTopicAssignedToStudent(auth.userId, orgStr, classId, topicId);
          if (assigned) {
            session_mode = 'teacher_assigned';
            session_source = 'assigned';
          }
        }
      } catch (e) {
        console.error('[POST /api/sessions] assignment detection', e);
      }
    }

    const session = await createSession({
      organization_id: orgId as mongoose.Types.ObjectId,
      student_id: new mongoose.Types.ObjectId(auth.userId),
      topic_id: new mongoose.Types.ObjectId(topicId),
      subject_id: new mongoose.Types.ObjectId(String(resolvedSubjectId)),
      mode: modeVal,
      session_mode,
      session_source,
      start_time: new Date(),
    });

    if ((auth.role || '').toLowerCase() === 'student') {
      try {
        await updateAssignmentStatus(auth.userId, topicId, 'in_progress');
      } catch (assignErr) {
        console.error('[POST /api/sessions] assignment lifecycle', assignErr);
      }
    }

    const sessionObj = session.toObject ? session.toObject() : session;
    return successResponse(sessionObj, 201);
  } catch (error) {
    console.error('[POST /api/sessions]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
