import { getTopicById } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';

const CACHE_MAX_AGE = 60;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return errorResponse('Topic id is required', 400);

    const topic = await getTopicById(id);
    if (!topic) return errorResponse('Topic not found', 404);

    const res = successResponse(topic, 200);
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`);
    return res;
  } catch (error) {
    console.error('[GET /api/topics/[id]]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
