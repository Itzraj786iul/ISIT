import { getTopicsForSubject } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';

const CACHE_MAX_AGE = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const organizationId = searchParams.get('organizationId') ?? undefined;

    if (!subjectId) return errorResponse('subjectId is required', 400);

    const topics = await getTopicsForSubject(subjectId, {
      organizationId: organizationId || undefined,
      activeOnly: true,
    });
    const res = successResponse(topics, 200);
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`);
    return res;
  } catch (error) {
    console.error('[GET /api/topics]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
