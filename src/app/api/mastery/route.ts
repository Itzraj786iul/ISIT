import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { getTopicById } from '@/lib/curriculum-api';
import {
  getMasteryRecord,
  getMasteryRecordsForStudent,
  createOrUpdateMasteryRecord,
  createKnowledgeGap,
} from '@/lib/learning-execution';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      const records = await getMasteryRecordsForStudent(auth.userId);
      return successResponse(records, 200);
    }

    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const orgId = (topic as { organization_id?: unknown }).organization_id;
    if (!orgId) return errorResponse('Topic has no organization', 400);

    const record = await getMasteryRecord(
      auth.userId,
      topicId,
      orgId as mongoose.Types.ObjectId
    );

    const mastery_score = (record as { mastery_score?: number })?.mastery_score ?? 0;
    const attempt_count = (record as { attempt_count?: number })?.attempt_count ?? 0;
    const correct_answers = (record as { correct_answers?: number })?.correct_answers ?? 0;

    return successResponse({ mastery_score, attempt_count, correct_answers }, 200);
  } catch (error) {
    console.error('[GET /api/mastery]', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { topicId, isCorrect } = body;

    if (!topicId) return errorResponse('topicId is required', 400);

    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const orgId = (topic as { organization_id?: unknown }).organization_id;
    if (!orgId) return errorResponse('Topic has no organization', 400);

    const existing = await getMasteryRecord(
      auth.userId,
      topicId,
      orgId as mongoose.Types.ObjectId
    );
    const prevAttemptCount = (existing as { attempt_count?: number })?.attempt_count ?? 0;
    const prevCorrectAnswers = (existing as { correct_answers?: number })?.correct_answers ?? 0;

    const newAttemptCount = prevAttemptCount + 1;
    const newCorrectAnswers = prevCorrectAnswers + (isCorrect ? 1 : 0);
    const newMasteryScore = newAttemptCount > 0
      ? Math.round((newCorrectAnswers / newAttemptCount) * 100)
      : 0;
    const confidenceScore = newMasteryScore;

    const doc = await createOrUpdateMasteryRecord({
      organization_id: orgId as mongoose.Types.ObjectId,
      student_id: new mongoose.Types.ObjectId(auth.userId),
      topic_id: topicId,
      attempt_count: newAttemptCount,
      correct_answers: newCorrectAnswers,
      mastery_score: newMasteryScore,
      confidence_score: confidenceScore,
      revision_needed: newMasteryScore < 40,
      last_updated: new Date(),
    });

    if (newMasteryScore < 40) {
      await createKnowledgeGap({
        organization_id: orgId as mongoose.Types.ObjectId,
        student_id: new mongoose.Types.ObjectId(auth.userId),
        topic_id: topicId,
        severity_score: Math.round(100 - newMasteryScore),
        detected_reason: 'low quiz accuracy',
        resolved: false,
      });
    }

    const record = doc.toObject ? doc.toObject() : doc;
    return successResponse(record, 200);
  } catch (error) {
    console.error('[POST /api/mastery]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
