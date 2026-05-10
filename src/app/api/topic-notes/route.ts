import { getTopicById } from '@/lib/curriculum-api';
import { getTopicNotesForTopic } from '@/lib/content-layer';
import { successResponse, errorResponse } from '@/lib/api-response';
import { enforceTopicReadForScope } from '@/lib/teacher-scope';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');
    const noteType = searchParams.get('noteType') ?? undefined;

    if (!topicId) return errorResponse('topicId is required', 400);

    const access = await enforceTopicReadForScope(req, topicId);
    if (!access.ok) return access.response;

    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const notes = await getTopicNotesForTopic(topicId, { noteType });
    return successResponse(notes, 200);
  } catch (error) {
    console.error('[GET /api/topic-notes]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
