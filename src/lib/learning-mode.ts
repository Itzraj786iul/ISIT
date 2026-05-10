import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

export type LearningMode = 'teacher_learning' | 'free_learning';

/** Client-safe: derive mode from `/api/auth/me` payload (or any user object with `learning_mode`). */
export function getLearningMode(
  user: { role?: string; learning_mode?: LearningMode } | null | undefined
): LearningMode {
  if (!user) return 'free_learning';
  if ((user.role || '').toLowerCase() !== 'student') return 'free_learning';
  return user.learning_mode === 'teacher_learning' ? 'teacher_learning' : 'free_learning';
}

export function studentAssignedTopicsBaseFilter(
  studentUserId: string,
  organizationId: string,
  classId: string | null | undefined
): Record<string, unknown> {
  const uid = new mongoose.Types.ObjectId(studentUserId);
  const oid = new mongoose.Types.ObjectId(organizationId);
  const or: Record<string, unknown>[] = [{ student_id: uid }];
  if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    or.push({ class_id: new mongoose.Types.ObjectId(classId) });
  }
  return { organization_id: oid, $or: or };
}

export async function resolveLearningModeForStudent(
  studentUserId: string,
  organizationId: string,
  classId: string | null | undefined
): Promise<LearningMode> {
  await connectToDB();
  const AssignedTopic = (await import('@/models/AssignedTopic')).default;
  const one = await AssignedTopic.findOne(
    studentAssignedTopicsBaseFilter(studentUserId, organizationId, classId)
  )
    .select('_id')
    .lean();
  return one ? 'teacher_learning' : 'free_learning';
}
