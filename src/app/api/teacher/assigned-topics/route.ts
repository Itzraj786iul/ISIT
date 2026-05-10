import mongoose from 'mongoose';
import { successResponse, errorResponse } from '@/lib/api-response';
import { connectToDB } from '@/lib/db';
import { requireTeacherOrganization } from '@/lib/teacher-org';
import { requireTeacherScope } from '@/lib/teacher-scope';

export async function GET(req: Request) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    await connectToDB();
    const AssignedTopic = (await import('@/models/AssignedTopic')).default;
    const scope = await requireTeacherScope(req);

    const base: Record<string, unknown> = {
      organization_id: new mongoose.Types.ObjectId(gate.organizationId),
    };
    if (scope.kind === 'teacher') {
      base.assigned_by = new mongoose.Types.ObjectId(gate.userId);
    }

    const rows = await AssignedTopic.find(base)
      .populate('topic_id', 'topic_name')
      .populate('subject_id', 'name')
      .populate('class_id', 'name')
      .populate('student_id', 'name email')
      .populate('assigned_by', 'name email')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const data = rows.map((r) => ({
      assignment_id: (r._id as mongoose.Types.ObjectId).toString(),
      topic_id:
        r.topic_id && typeof r.topic_id === 'object' && '_id' in r.topic_id
          ? (r.topic_id as { _id: mongoose.Types.ObjectId }).toString()
          : String(r.topic_id),
      topic_name:
        r.topic_id && typeof r.topic_id === 'object' && 'topic_name' in r.topic_id
          ? String((r.topic_id as { topic_name?: string }).topic_name ?? '')
          : '',
      subject_name:
        r.subject_id && typeof r.subject_id === 'object' && 'name' in r.subject_id
          ? String((r.subject_id as { name?: string }).name ?? '')
          : '',
      class_id: r.class_id
        ? typeof r.class_id === 'object' && '_id' in r.class_id
          ? (r.class_id as { _id: mongoose.Types.ObjectId }).toString()
          : String(r.class_id)
        : null,
      class_name:
        r.class_id && typeof r.class_id === 'object' && 'name' in r.class_id
          ? String((r.class_id as { name?: string }).name ?? '')
          : null,
      student_id: r.student_id
        ? typeof r.student_id === 'object' && '_id' in r.student_id
          ? (r.student_id as { _id: mongoose.Types.ObjectId }).toString()
          : String(r.student_id)
        : null,
      student_name:
        r.student_id && typeof r.student_id === 'object' && 'name' in r.student_id
          ? String((r.student_id as { name?: string }).name ?? '')
          : null,
      status: r.status,
      due_date: r.due_date ? new Date(r.due_date).toISOString() : null,
      created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    }));

    return successResponse(data, 200);
  } catch (error) {
    console.error('[GET /api/teacher/assigned-topics]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
