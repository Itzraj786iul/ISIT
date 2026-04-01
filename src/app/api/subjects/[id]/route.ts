import { getSubjectById } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';

const CACHE_MAX_AGE = 60;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return errorResponse('Subject id is required', 400);

    const subject = await getSubjectById(id);
    if (!subject) return errorResponse('Subject not found', 404);

    const res = successResponse(subject, 200);
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`);
    return res;
  } catch (error) {
    console.error('[GET /api/subjects/[id]]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
