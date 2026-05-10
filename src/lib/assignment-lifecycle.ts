import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

export type AssignmentLifecycleStatus = 'assigned' | 'in_progress' | 'completed';

export function isAssignmentStatus(s: string): s is AssignmentLifecycleStatus {
  return s === 'assigned' || s === 'in_progress' || s === 'completed';
}

/** Parent `AssignedTopic` row: direct match for student, else class match. */
export async function findApplicableAssignedTopicParent(
  studentId: string,
  topicId: string
): Promise<{ _id: mongoose.Types.ObjectId; organization_id: mongoose.Types.ObjectId } | null> {
  if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(topicId)) {
    return null;
  }

  await connectToDB();
  const User = (await import('@/models/User')).default;
  const AssignedTopic = (await import('@/models/AssignedTopic')).default;

  const student = await User.findById(studentId)
    .select('organization_id class_id')
    .lean<{ organization_id?: mongoose.Types.ObjectId; class_id?: mongoose.Types.ObjectId | null } | null>();
  if (!student?.organization_id) return null;

  const orgId = student.organization_id;
  const topicOid = new mongoose.Types.ObjectId(topicId);

  type LeanAssign = {
    _id: mongoose.Types.ObjectId;
    organization_id: mongoose.Types.ObjectId;
  };

  const direct = await AssignedTopic.findOne({
    organization_id: orgId,
    topic_id: topicOid,
    student_id: new mongoose.Types.ObjectId(studentId),
  }).lean<LeanAssign | null>();

  if (direct) return { _id: direct._id, organization_id: direct.organization_id };

  if (student.class_id) {
    const viaClass = await AssignedTopic.findOne({
      organization_id: orgId,
      topic_id: topicOid,
      class_id: student.class_id,
    }).lean<LeanAssign | null>();
    if (viaClass) return { _id: viaClass._id, organization_id: viaClass.organization_id };
  }

  return null;
}

/**
 * Updates per-student progress (`AssignedTopicProgress`) for the applicable assignment.
 * Class-scoped assignments share one `AssignedTopic`; each student has their own progress row.
 *
 * - `in_progress` only from `assigned`.
 * - `completed` only from `assigned` or `in_progress`.
 * - Never downgrades. No-op if already at target status.
 */
export async function updateAssignmentStatus(
  studentId: string,
  topicId: string,
  status: AssignmentLifecycleStatus
): Promise<{ updated: boolean; assignmentId?: string }> {
  if (status === 'assigned') return { updated: false };

  const parent = await findApplicableAssignedTopicParent(studentId, topicId);
  if (!parent) return { updated: false };

  await connectToDB();
  const AssignedTopicProgress = (await import('@/models/AssignedTopicProgress')).default;

  const studentOid = new mongoose.Types.ObjectId(studentId);
  const existing = await AssignedTopicProgress.findOne({
    assigned_topic_id: parent._id,
    student_id: studentOid,
  }).lean<{
    _id: mongoose.Types.ObjectId;
    status?: string;
    started_at?: Date | null;
  } | null>();

  const current: AssignmentLifecycleStatus =
    existing?.status && isAssignmentStatus(existing.status) ? existing.status : 'assigned';

  if (current === status) return { updated: false };

  if (status === 'in_progress' && current !== 'assigned') {
    return { updated: false };
  }

  if (status === 'completed') {
    if (current === 'completed') return { updated: false };
    if (current !== 'assigned' && current !== 'in_progress') {
      return { updated: false };
    }
  }

  const now = new Date();

  if (!existing) {
    if (status === 'in_progress') {
      await AssignedTopicProgress.create({
        organization_id: parent.organization_id,
        assigned_topic_id: parent._id,
        student_id: studentOid,
        status: 'in_progress',
        started_at: now,
      });
      return { updated: true, assignmentId: parent._id.toString() };
    }
    if (status === 'completed') {
      await AssignedTopicProgress.create({
        organization_id: parent.organization_id,
        assigned_topic_id: parent._id,
        student_id: studentOid,
        status: 'completed',
        started_at: now,
        completed_at: now,
      });
      return { updated: true, assignmentId: parent._id.toString() };
    }
    return { updated: false };
  }

  const $set: Record<string, unknown> = { status };

  if (status === 'in_progress') {
    if (!existing.started_at) $set.started_at = now;
  }

  if (status === 'completed') {
    $set.completed_at = now;
    if (!existing.started_at) $set.started_at = now;
  }

  const res = await AssignedTopicProgress.updateOne(
    { _id: existing._id, status: current },
    { $set }
  );

  if (res.modifiedCount === 0) {
    return { updated: false };
  }

  return { updated: true, assignmentId: parent._id.toString() };
}

export async function syncAssignmentProgressAfterSessionEnd(
  studentId: string,
  topicId: string,
  masteryScore: number,
  threshold: number = 70
): Promise<{ updated: boolean }> {
  if (masteryScore < threshold) return { updated: false };
  const r = await updateAssignmentStatus(studentId, topicId, 'completed');
  return { updated: r.updated };
}
