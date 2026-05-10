import mongoose from 'mongoose';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { fetchStudentAssignedTopicItems } from '@/lib/student-assigned-topics-data';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);
    if ((auth.role || '').toLowerCase() !== 'student') {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(req.url);
    const topicIdFilter = searchParams.get('topicId') ?? searchParams.get('topic_id');

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const student = await User.findById(auth.userId)
      .select('organization_id class_id role')
      .lean<{
        organization_id?: mongoose.Types.ObjectId;
        class_id?: mongoose.Types.ObjectId | null;
      } | null>();
    if (!student?.organization_id) {
      return errorResponse('Student profile incomplete', 400);
    }

    const orgId = student.organization_id.toString();
    const classId = student.class_id?.toString() ?? null;

    const items = await fetchStudentAssignedTopicItems(auth.userId, orgId, classId, {
      topicId: topicIdFilter || undefined,
    });

    return successResponse(items, 200);
  } catch (error) {
    console.error('[GET /api/student/assigned-topics]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
