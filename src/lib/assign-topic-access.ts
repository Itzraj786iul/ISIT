import type { Types } from 'mongoose';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';
import { errorResponse } from '@/lib/api-response';
import { requireTeacherOrganization, type TeacherOrgOk, type TeacherOrgFail } from '@/lib/teacher-org';
import { requireTeacherScope, subjectAllowedForTeacherScope } from '@/lib/teacher-scope';

type Err = { ok: false; response: ReturnType<typeof errorResponse> };

export async function assertTeacherCanAssignTopic(
  req: Request,
  topicId: string
): Promise<
  | ({ ok: true } & TeacherOrgOk & {
      topic: { _id: Types.ObjectId; organization_id: Types.ObjectId; subject_id: Types.ObjectId };
      subject: { _id: Types.ObjectId; class_id?: Types.ObjectId | null; organization_id: Types.ObjectId };
    })
  | Err
  | TeacherOrgFail
> {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return { ok: false, response: errorResponse('Invalid topic_id', 400) };
  }

  const gate = await requireTeacherOrganization(req);
  if (!gate.ok) return gate;

  await connectToDB();
  const Topic = (await import('@/models/Topic')).default;
  const Subject = (await import('@/models/Subject')).default;

  const topic = await Topic.findById(topicId).lean<{
    _id: Types.ObjectId;
    organization_id: Types.ObjectId;
    subject_id: Types.ObjectId;
  } | null>();
  if (!topic) return { ok: false, response: errorResponse('Topic not found', 404) };
  if (topic.organization_id.toString() !== gate.organizationId) {
    return { ok: false, response: errorResponse('Forbidden', 403) };
  }

  const subject = await Subject.findById(topic.subject_id).lean<{
    _id: Types.ObjectId;
    class_id?: Types.ObjectId | null;
    organization_id: Types.ObjectId;
  } | null>();
  if (!subject) return { ok: false, response: errorResponse('Subject not found', 404) };
  if (subject.organization_id.toString() !== gate.organizationId) {
    return { ok: false, response: errorResponse('Forbidden', 403) };
  }

  const scope = await requireTeacherScope(req);
  if (scope.kind === 'teacher' && !subjectAllowedForTeacherScope(scope, subject)) {
    return { ok: false, response: errorResponse('Forbidden', 403) };
  }

  return { ok: true, userId: gate.userId, organizationId: gate.organizationId, topic, subject };
}

export async function assertTeacherCanTargetClass(
  req: Request,
  organizationId: string,
  classId: string
): Promise<{ ok: true } | Err> {
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return { ok: false, response: errorResponse('Invalid class_id', 400) };
  }
  await connectToDB();
  const ClassModel = (await import('@/models/Class')).default;
  const cls = await ClassModel.findById(classId).lean<{ organization_id: Types.ObjectId } | null>();
  if (!cls) return { ok: false, response: errorResponse('Class not found', 404) };
  if (cls.organization_id.toString() !== organizationId) {
    return { ok: false, response: errorResponse('Class is not in your organization', 403) };
  }
  const scope = await requireTeacherScope(req);
  if (scope.kind === 'teacher' && !scope.assignedClassIds.includes(classId)) {
    return { ok: false, response: errorResponse('Forbidden', 403) };
  }
  return { ok: true };
}

export async function assertTeacherCanTargetStudent(
  organizationId: string,
  studentId: string
): Promise<{ ok: true } | Err> {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return { ok: false, response: errorResponse('Invalid student_id', 400) };
  }
  await connectToDB();
  const User = (await import('@/models/User')).default;
  const student = await User.findById(studentId)
    .select('organization_id role')
    .lean<{ organization_id?: Types.ObjectId; role?: string } | null>();
  if (!student) return { ok: false, response: errorResponse('Student not found', 404) };
  if ((student.role || '').toLowerCase() !== 'student') {
    return { ok: false, response: errorResponse('Target user is not a student', 400) };
  }
  if (student.organization_id?.toString() !== organizationId) {
    return { ok: false, response: errorResponse('Student is not in your organization', 403) };
  }
  return { ok: true };
}
