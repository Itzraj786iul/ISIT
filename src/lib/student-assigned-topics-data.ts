import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';
import { studentAssignedTopicsBaseFilter } from '@/lib/learning-mode';
import type { AssignedTopicListItem } from '@/lib/assigned-topic-types';

/**
 * Loads assigned topics for a student (direct + class), deduped by topic_id (direct wins).
 * Used by GET /api/student/assigned-topics and parent child-insights.
 */
export async function fetchStudentAssignedTopicItems(
  studentId: string,
  organizationId: string,
  classId: string | null | undefined,
  options?: { topicId?: string | null }
): Promise<AssignedTopicListItem[]> {
  await connectToDB();
  const User = (await import('@/models/User')).default;
  const AssignedTopic = (await import('@/models/AssignedTopic')).default;
  const MasteryRecord = (await import('@/models/MasteryRecord')).default;

  const student = await User.findById(studentId)
    .select('organization_id class_id')
    .lean<{ organization_id?: mongoose.Types.ObjectId; class_id?: mongoose.Types.ObjectId | null } | null>();
  if (!student?.organization_id || student.organization_id.toString() !== organizationId) {
    return [];
  }

  const orgId = organizationId;
  const effectiveClassId = classId ?? student.class_id?.toString() ?? null;

  const base = studentAssignedTopicsBaseFilter(studentId, orgId, effectiveClassId);
  const query: Record<string, unknown> = { ...base };
  const topicIdFilter = options?.topicId;
  if (topicIdFilter && mongoose.Types.ObjectId.isValid(topicIdFilter)) {
    query.topic_id = new mongoose.Types.ObjectId(topicIdFilter);
  }

  const rows = await AssignedTopic.find(query)
    .populate('topic_id', 'topic_name')
    .populate('subject_id', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const studentOid = new mongoose.Types.ObjectId(studentId);
  const assignmentIds = rows.map((r) => r._id as mongoose.Types.ObjectId);
  const AssignedTopicProgress = (await import('@/models/AssignedTopicProgress')).default;
  const progressRows =
    assignmentIds.length > 0
      ? await AssignedTopicProgress.find({
          assigned_topic_id: { $in: assignmentIds },
          student_id: studentOid,
        })
          .select('assigned_topic_id status started_at completed_at')
          .lean<
            {
              assigned_topic_id: mongoose.Types.ObjectId;
              status?: string;
              started_at?: Date | null;
              completed_at?: Date | null;
            }[]
          >()
      : [];
  const progressByAssignmentId = new Map<
    string,
    { status: string; started_at: string | null; completed_at: string | null }
  >();
  for (const p of progressRows) {
    const aid = p.assigned_topic_id.toString();
    progressByAssignmentId.set(aid, {
      status: p.status ?? 'assigned',
      started_at: p.started_at ? new Date(p.started_at).toISOString() : null,
      completed_at: p.completed_at ? new Date(p.completed_at).toISOString() : null,
    });
  }

  const topicOids: mongoose.Types.ObjectId[] = [];
  for (const r of rows) {
    const t = r.topic_id;
    if (t && typeof t === 'object' && '_id' in t) {
      topicOids.push((t as { _id: mongoose.Types.ObjectId })._id);
    } else if (t != null && mongoose.Types.ObjectId.isValid(String(t))) {
      topicOids.push(new mongoose.Types.ObjectId(String(t)));
    }
  }
  const masteryRows =
    topicOids.length > 0
      ? await MasteryRecord.find({
          student_id: studentOid,
          topic_id: { $in: topicOids },
        })
          .select('topic_id mastery_score')
          .lean<{ topic_id: mongoose.Types.ObjectId; mastery_score?: number }[]>()
      : [];
  const masteryByTopic = new Map<string, number>();
  for (const m of masteryRows) {
    masteryByTopic.set(m.topic_id.toString(), m.mastery_score ?? 0);
  }

  const rawItems: AssignedTopicListItem[] = rows.map((r) => {
    const aid = (r._id as mongoose.Types.ObjectId).toString();
    const prog = progressByAssignmentId.get(aid);
    const tid =
      r.topic_id && typeof r.topic_id === 'object' && '_id' in r.topic_id
        ? (r.topic_id as { _id: mongoose.Types.ObjectId; topic_name?: string })._id.toString()
        : String(r.topic_id);
    const topicName =
      r.topic_id && typeof r.topic_id === 'object' && 'topic_name' in r.topic_id
        ? String((r.topic_id as { topic_name?: string }).topic_name ?? 'Topic')
        : 'Topic';
    const sid =
      r.subject_id && typeof r.subject_id === 'object' && '_id' in r.subject_id
        ? (r.subject_id as { _id: mongoose.Types.ObjectId; name?: string })._id.toString()
        : String(r.subject_id);
    const subjectName =
      r.subject_id && typeof r.subject_id === 'object' && 'name' in r.subject_id
        ? String((r.subject_id as { name?: string }).name ?? 'Subject')
        : 'Subject';
    const direct = r.student_id != null && studentOid.equals(r.student_id as mongoose.Types.ObjectId);
    const parentStatus = typeof r.status === 'string' ? r.status : 'assigned';
    return {
      assignment_id: aid,
      topic_id: tid,
      topic_name: topicName,
      subject_id: sid,
      subject_name: subjectName,
      status: prog?.status ?? parentStatus,
      due_date: r.due_date ? new Date(r.due_date).toISOString() : null,
      mastery_score: masteryByTopic.has(tid) ? masteryByTopic.get(tid)! : null,
      source: direct ? 'direct' : 'class',
      started_at: prog?.started_at ?? null,
      completed_at: prog?.completed_at ?? null,
    };
  });

  const byTopic = new Map<string, AssignedTopicListItem>();
  for (const item of rawItems) {
    const prev = byTopic.get(item.topic_id);
    if (!prev || item.source === 'direct') byTopic.set(item.topic_id, item);
  }
  return Array.from(byTopic.values());
}

/** True if this topic is part of the student's assigned work (direct or class), using the same rules as the assigned-topics API. */
export async function isTopicAssignedToStudent(
  studentId: string,
  organizationId: string,
  classId: string | null | undefined,
  topicId: string
): Promise<boolean> {
  const items = await fetchStudentAssignedTopicItems(studentId, organizationId, classId, { topicId });
  return items.length > 0;
}

export function sortAssignedTopicsCopy<T extends { status: string; topic_name: string }>(items: T[]): T[] {
  const rank = (s: string) => (s === 'completed' ? 2 : s === 'in_progress' ? 1 : 0);
  return [...items].sort((a, b) => {
    const d = rank(a.status) - rank(b.status);
    if (d !== 0) return d;
    return a.topic_name.localeCompare(b.topic_name, undefined, { sensitivity: 'base' });
  });
}
