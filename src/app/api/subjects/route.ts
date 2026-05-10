/** AI-first — org or public subject catalog (prefer over GET /api/courses for learning UX). */
import mongoose from 'mongoose';
import { getSubjectsForOrganization, getAllPublishedSubjects } from '@/lib/curriculum-api';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { requireTeacherOrganization } from '@/lib/teacher-org';
import { requireTeacherScope, subjectQueryFilterForTeacher } from '@/lib/teacher-scope';

const CACHE_MAX_AGE = 120; // 2 minutes — safe for org catalog; revalidate in background

export async function GET(req: Request) {
  try {
    const scope = await requireTeacherScope(req);
    const { searchParams } = new URL(req.url);
    let organizationId = searchParams.get('organizationId');
    const classId = searchParams.get('class_id');
    const grade = searchParams.get('grade') ?? undefined;
    const board = searchParams.get('board') ?? undefined;

    if (scope.kind === 'teacher') {
      if (organizationId && organizationId !== scope.organizationId) {
        return errorResponse('Forbidden', 403);
      }
      organizationId = scope.organizationId;
    }

    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return errorResponse('Invalid class_id', 400);
      }
      const auth = await getAuthFromRequest(req);
      if (!auth) return errorResponse('Unauthorized', 401);

      await connectToDB();
      const ClassModel = (await import('@/models/Class')).default;
      const User = (await import('@/models/User')).default;
      const Subject = (await import('@/models/Subject')).default;

      const cls = await ClassModel.findById(classId).lean<{ organization_id: mongoose.Types.ObjectId } | null>();
      if (!cls) return errorResponse('Class not found', 404);

      const user = await User.findById(auth.userId).select('organization_id').lean<{
        organization_id?: mongoose.Types.ObjectId;
      } | null>();
      const uOrg = user?.organization_id?.toString();
      if (!uOrg || uOrg !== cls.organization_id.toString()) {
        return errorResponse('Forbidden', 403);
      }

      const teacherFilter = subjectQueryFilterForTeacher(scope);
      if (scope.kind === 'teacher') {
        if (!scope.assignedClassIds.includes(classId)) {
          return errorResponse('Forbidden', 403);
        }
        const q: Record<string, unknown> = {
          organization_id: uOrg,
          ...(teacherFilter ?? {}),
          class_id: classId,
        };
        if (grade != null && grade !== '') q.grade = grade;
        if (board != null && board !== '') q.board = board;
        const subjects = await Subject.find(q).sort({ name: 1 }).lean().exec();
        const res = successResponse(subjects, 200);
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
      }

      const list = await getSubjectsForOrganization(uOrg, { grade, board, classId });
      return successResponse(list, 200);
    }

    let subjects =
      organizationId != null && organizationId !== ''
        ? await getSubjectsForOrganization(organizationId, { grade, board })
        : await getAllPublishedSubjects({ grade, board });

    const teacherFilter = subjectQueryFilterForTeacher(scope);
    if (scope.kind === 'teacher' && teacherFilter) {
      await connectToDB();
      const Subject = (await import('@/models/Subject')).default;
      const q: Record<string, unknown> = {
        organization_id: scope.organizationId,
        ...teacherFilter,
      };
      if (grade != null && grade !== '') q.grade = grade;
      if (board != null && board !== '') q.board = board;
      subjects = await Subject.find(q).sort({ name: 1 }).lean().exec();
      const res = successResponse(subjects, 200);
      res.headers.set('Cache-Control', 'private, no-store');
      return res;
    }

    const res = successResponse(subjects, 200);
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`);
    return res;
  } catch (error) {
    console.error('[GET /api/subjects]', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const classId = typeof body?.class_id === 'string' ? body.class_id.trim() : '';
    if (!name || !classId) return errorResponse('name and class_id are required', 400);
    if (!mongoose.Types.ObjectId.isValid(classId)) return errorResponse('Invalid class_id', 400);

    await connectToDB();
    const ClassModel = (await import('@/models/Class')).default;
    const Subject = (await import('@/models/Subject')).default;

    const cls = await ClassModel.findById(classId).lean<{ organization_id: mongoose.Types.ObjectId } | null>();
    if (!cls) return errorResponse('Class not found', 404);
    if (cls.organization_id.toString() !== gate.organizationId) {
      return errorResponse('Class does not belong to your organization', 403);
    }

    const scope = await requireTeacherScope(req);
    if (scope.kind === 'teacher' && !scope.assignedClassIds.includes(classId)) {
      return errorResponse('You are not assigned to this class', 403);
    }

    const subject = await Subject.create({
      organization_id: gate.organizationId,
      class_id: classId,
      name,
      grade:
        typeof body?.grade === 'string' && body.grade.trim()
          ? body.grade.trim()
          : '-',
      board:
        typeof body?.board === 'string' && body.board.trim()
          ? body.board.trim()
          : '-',
      academic_year:
        typeof body?.academic_year === 'string' && body.academic_year.trim()
          ? body.academic_year.trim()
          : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      description: typeof body?.description === 'string' ? body.description : '',
      status: 'published',
      is_active: true,
    });

    return successResponse(subject.toObject(), 201);
  } catch (error) {
    console.error('[POST /api/subjects]', error);
    return errorResponse('Internal Server Error', 500);
  }
}

