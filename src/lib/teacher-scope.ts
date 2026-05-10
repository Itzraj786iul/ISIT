import type { Types } from 'mongoose';
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { getSubjectById, getTopicById } from '@/lib/curriculum-api';
import { errorResponse } from '@/lib/api-response';

export type TeacherScope =
  | { kind: 'admin'; userId: string; organizationId: string }
  | {
      kind: 'teacher';
      userId: string;
      organizationId: string;
      assignedClassIds: string[];
      assignedSubjectIds: string[];
    }
  | { kind: 'other' };

/**
 * Curriculum access scope: Admin = full org; Teacher = assigned classes/subjects only;
 * other (student/parent/guest) = not teacher-scoped (list endpoints use normal org/public rules).
 */
export async function requireTeacherScope(req: Request): Promise<TeacherScope> {
  const auth = await getAuthFromRequest(req);
  if (!auth) return { kind: 'other' };

  await connectToDB();
  const User = (await import('@/models/User')).default;
  const user = await User.findById(auth.userId)
    .select('role organization_id assigned_classes assigned_subjects')
    .lean<{
      role?: string;
      organization_id?: Types.ObjectId;
      assigned_classes?: Types.ObjectId[];
      assigned_subjects?: Types.ObjectId[];
    } | null>();

  if (!user?.organization_id) return { kind: 'other' };

  const organizationId = user.organization_id.toString();
  const r = (user.role || '').toLowerCase();

  if (r === 'admin') {
    return { kind: 'admin', userId: auth.userId, organizationId };
  }

  if (r === 'teacher') {
    return {
      kind: 'teacher',
      userId: auth.userId,
      organizationId,
      assignedClassIds: (user.assigned_classes ?? []).map((id) => id.toString()),
      assignedSubjectIds: (user.assigned_subjects ?? []).map((id) => id.toString()),
    };
  }

  return { kind: 'other' };
}

/** Teacher may access this subject; admin/other callers should not use this for denial (returns true for non-teacher). */
export function subjectAllowedForTeacherScope(
  scope: TeacherScope,
  subject: { _id: string | Types.ObjectId; class_id?: string | Types.ObjectId | null }
): boolean {
  if (scope.kind !== 'teacher') return true;
  const sid = subject._id.toString();
  const cid = subject.class_id != null ? subject.class_id.toString() : '';
  if (!cid) return false;
  return scope.assignedSubjectIds.includes(sid) && scope.assignedClassIds.includes(cid);
}

export function subjectQueryFilterForTeacher(scope: TeacherScope): Record<string, unknown> | null {
  if (scope.kind !== 'teacher') return null;
  if (scope.assignedSubjectIds.length === 0 || scope.assignedClassIds.length === 0) {
    return { _id: { $in: [] } };
  }
  return {
    _id: { $in: scope.assignedSubjectIds.map((id) => new mongoose.Types.ObjectId(id)) },
    class_id: { $in: scope.assignedClassIds.map((id) => new mongoose.Types.ObjectId(id)) },
  };
}

type Err = { ok: false; response: ReturnType<typeof errorResponse> };

/** GET subject by id — 403 for teacher outside assignment. */
export async function enforceSubjectReadForScope(
  req: Request,
  subjectId: string
): Promise<{ ok: true; subject: NonNullable<Awaited<ReturnType<typeof getSubjectById>>> } | Err> {
  const subject = await getSubjectById(subjectId);
  if (!subject) return { ok: false, response: errorResponse('Subject not found', 404) };
  const scope = await requireTeacherScope(req);
  if (scope.kind === 'teacher' && !subjectAllowedForTeacherScope(scope, subject as { _id: Types.ObjectId; class_id?: Types.ObjectId | null })) {
    return { ok: false, response: errorResponse('Forbidden', 403) };
  }
  return { ok: true, subject };
}

/** Topic-backed reads — 403 for teacher outside assignment. */
export async function enforceTopicReadForScope(req: Request, topicId: string): Promise<{ ok: true } | Err> {
  const topic = await getTopicById(topicId);
  if (!topic) return { ok: false, response: errorResponse('Topic not found', 404) };
  const scope = await requireTeacherScope(req);
  if (scope.kind !== 'teacher') return { ok: true };

  await connectToDB();
  const Subject = (await import('@/models/Subject')).default;
  const sub = await Subject.findById(
    (topic as { subject_id?: Types.ObjectId }).subject_id
  ).lean<{ _id: Types.ObjectId; class_id?: Types.ObjectId | null } | null>();
  if (!sub) return { ok: false, response: errorResponse('Topic not found', 404) };
  if (!subjectAllowedForTeacherScope(scope, sub)) {
    return { ok: false, response: errorResponse('Forbidden', 403) };
  }
  return { ok: true };
}
