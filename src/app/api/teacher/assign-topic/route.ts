import mongoose from 'mongoose';
import { successResponse, errorResponse } from '@/lib/api-response';
import { connectToDB } from '@/lib/db';
import {
  assertTeacherCanAssignTopic,
  assertTeacherCanTargetClass,
  assertTeacherCanTargetStudent,
} from '@/lib/assign-topic-access';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const topicId =
      typeof body?.topic_id === 'string'
        ? body.topic_id.trim()
        : typeof body?.topicId === 'string'
          ? body.topicId.trim()
          : '';
    const classId =
      typeof body?.class_id === 'string'
        ? body.class_id.trim()
        : typeof body?.classId === 'string'
          ? body.classId.trim()
          : '';
    const studentId =
      typeof body?.student_id === 'string'
        ? body.student_id.trim()
        : typeof body?.studentId === 'string'
          ? body.studentId.trim()
          : '';
    let dueDate: Date | null = null;
    if (body?.due_date != null || body?.dueDate != null) {
      const raw = body.due_date ?? body.dueDate;
      const d = typeof raw === 'string' || raw instanceof Date ? new Date(raw) : null;
      if (!d || Number.isNaN(d.getTime())) {
        return errorResponse('Invalid due_date', 400);
      }
      dueDate = d;
    }

    if (!topicId) return errorResponse('topic_id is required', 400);

    const hasClass = Boolean(classId);
    const hasStudent = Boolean(studentId);
    if (hasClass === hasStudent) {
      return errorResponse('Provide exactly one of class_id or student_id', 400);
    }

    const access = await assertTeacherCanAssignTopic(req, topicId);
    if (!access.ok) return access.response;

    if (classId) {
      const c = await assertTeacherCanTargetClass(req, access.organizationId, classId);
      if (!c.ok) return c.response;
    } else {
      const s = await assertTeacherCanTargetStudent(access.organizationId, studentId);
      if (!s.ok) return s.response;
    }

    await connectToDB();
    const AssignedTopic = (await import('@/models/AssignedTopic')).default;

    const filter: Record<string, unknown> = {
      organization_id: new mongoose.Types.ObjectId(access.organizationId),
      topic_id: access.topic._id,
      ...(classId
        ? { class_id: new mongoose.Types.ObjectId(classId) }
        : { student_id: new mongoose.Types.ObjectId(studentId) }),
    };

    const existing = await AssignedTopic.findOne(filter).lean<{ _id: mongoose.Types.ObjectId } | null>();
    if (existing) {
      const updated = await AssignedTopic.findByIdAndUpdate(
        existing._id,
        {
          $set: {
            due_date: dueDate,
            subject_id: access.subject._id,
            assigned_by: new mongoose.Types.ObjectId(access.userId),
          },
        },
        { new: true }
      ).lean();
      return successResponse(updated, 200);
    }

    const created = await AssignedTopic.create({
      organization_id: access.organizationId,
      class_id: classId ? classId : null,
      student_id: studentId ? studentId : null,
      subject_id: access.subject._id,
      topic_id: access.topic._id,
      assigned_by: access.userId,
      due_date: dueDate,
      status: 'assigned',
    });

    return successResponse(created.toObject ? created.toObject() : created, 201);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Exactly one of class_id')) {
      return errorResponse('Exactly one of class_id or student_id must be set', 400);
    }
    console.error('[POST /api/teacher/assign-topic]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
