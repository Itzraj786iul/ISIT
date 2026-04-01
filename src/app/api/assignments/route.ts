import { getTopicById } from '@/lib/curriculum-api';
import { getAssignmentsForTopic } from '@/lib/content-layer';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) return errorResponse('topicId is required', 400);

    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const assignments = await getAssignmentsForTopic(topicId);
    return successResponse(assignments, 200);
  } catch (error) {
    console.error('[GET /api/assignments]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
