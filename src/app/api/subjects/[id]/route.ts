import mongoose from 'mongoose';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth';
import { isSubjectPubliclyVisible } from '@/lib/curriculum-public';
import { connectToDB } from '@/lib/db';
import { requireTeacherOrganization } from '@/lib/teacher-org';
import { enforceSubjectReadForScope, subjectAllowedForTeacherScope, requireTeacherScope } from '@/lib/teacher-scope';

const CACHE_MAX_AGE = 60;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return errorResponse('Subject id is required', 400);

    const gate = await enforceSubjectReadForScope(req, id);
    if (!gate.ok) return gate.response;
    const subject = gate.subject;

    const auth = await getAuthFromRequest(req);
    if (!auth && !isSubjectPubliclyVisible(subject as { is_active?: boolean; status?: string })) {
      return errorResponse('Subject not found', 404);
    }

    const res = successResponse(subject, 200);
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`);
    return res;
  } catch (error) {
    console.error('[GET /api/subjects/[id]]', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid subject id', 400);
    }

    await connectToDB();
    const Subject = (await import('@/models/Subject')).default;
    const Topic = (await import('@/models/Topic')).default;

    const subject = await Subject.findById(id).lean<{
      _id: mongoose.Types.ObjectId;
      organization_id: mongoose.Types.ObjectId;
      class_id?: mongoose.Types.ObjectId | null;
    } | null>();
    if (!subject) return errorResponse('Subject not found', 404);
    if (subject.organization_id.toString() !== gate.organizationId) {
      return errorResponse('Forbidden', 403);
    }

    const scope = await requireTeacherScope(req);
    if (
      scope.kind === 'teacher' &&
      !subjectAllowedForTeacherScope(scope, subject)
    ) {
      return errorResponse('Forbidden', 403);
    }

    const topicCount = await Topic.countDocuments({ subject_id: id });
    if (topicCount > 0) {
      return errorResponse('Remove or reassign topics before deleting this subject', 400);
    }

    await Subject.findByIdAndDelete(id);
    return successResponse({ deleted: true }, 200);
  } catch (error) {
    console.error('[DELETE /api/subjects/[id]]', error);
    return errorResponse('Internal Server Error', 500);
  }
}

