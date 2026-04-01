/** AI-first — org or public subject catalog (prefer over GET /api/courses for learning UX). */
import { getSubjectsForOrganization, getAllPublishedSubjects } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';

const CACHE_MAX_AGE = 120; // 2 minutes — safe for org catalog; revalidate in background

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const grade = searchParams.get('grade') ?? undefined;
    const board = searchParams.get('board') ?? undefined;

    const subjects = organizationId
      ? await getSubjectsForOrganization(organizationId, { grade, board })
      : await getAllPublishedSubjects({ grade, board });

    const res = successResponse(subjects, 200);
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`);
    return res;
  } catch (error) {
    console.error('[GET /api/subjects]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
