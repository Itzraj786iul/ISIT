import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { getTopicById } from '@/lib/curriculum-api';
import { incrementLearningTimeAndTopics, getPerformanceMetricsForStudent } from '@/lib/intelligence-layer';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const metrics = await getPerformanceMetricsForStudent(auth.userId);
    return successResponse(metrics, 200);
  } catch (error) {
    console.error('[GET /api/performance]', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { topicId, timeSpent } = body;

    if (!topicId) return errorResponse('topicId is required', 400);

    const timeSpentMinutes = typeof timeSpent === 'number' && timeSpent >= 0 ? timeSpent : 0;

    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const orgId = (topic as { organization_id?: unknown }).organization_id;
    if (!orgId) return errorResponse('Topic has no organization', 400);

    const doc = await incrementLearningTimeAndTopics(
      orgId as mongoose.Types.ObjectId,
      auth.userId,
      timeSpentMinutes
    );

    if (!doc) return successResponse({ updated: false, reason: 'timeSpent <= 0' }, 200);
    const record = doc.toObject ? doc.toObject() : doc;
    return successResponse(record, 200);
  } catch (error) {
    console.error('[POST /api/performance]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
