import mongoose from 'mongoose';
import { successResponse, errorResponse } from '@/lib/api-response';
import { connectToDB } from '@/lib/db';
import { assertTeacherCanAssignTopic } from '@/lib/assign-topic-access';
import { requireTeacherScope } from '@/lib/teacher-scope';
import { getTopicById } from '@/lib/curriculum-api';
import { isAssignmentStatus, type AssignmentLifecycleStatus } from '@/lib/assignment-lifecycle';
import type {
  AssignmentProgressPayload,
  AssignmentProgressStudentRow,
} from '@/lib/teacher-assignment-progress-types';

type Edge = { assignId: mongoose.Types.ObjectId; kind: 'direct' | 'class' };

function pickWinningAssignId(edges: Edge[]): mongoose.Types.ObjectId | null {
  if (edges.length === 0) return null;
  const direct = edges.find((e) => e.kind === 'direct');
  return (direct ?? edges[0]).assignId;
}

function normalizeProgressStatus(s: string | undefined): AssignmentLifecycleStatus {
  if (s && isAssignmentStatus(s)) return s;
  return 'assigned';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topic_id') ?? searchParams.get('topicId') ?? '';
    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return errorResponse('topic_id is required', 400);
    }

    const access = await assertTeacherCanAssignTopic(req, topicId);
    if (!access.ok) return access.response;

    await connectToDB();
    const AssignedTopic = (await import('@/models/AssignedTopic')).default;
    const User = (await import('@/models/User')).default;
    const AssignedTopicProgress = (await import('@/models/AssignedTopicProgress')).default;
    const MasteryRecord = (await import('@/models/MasteryRecord')).default;

    const scope = await requireTeacherScope(req);
    const orgOid = new mongoose.Types.ObjectId(access.organizationId);
    const topicOid = new mongoose.Types.ObjectId(topicId);

    const assignFilter: Record<string, unknown> = {
      organization_id: orgOid,
      topic_id: topicOid,
    };
    if (scope.kind === 'teacher') {
      assignFilter.assigned_by = new mongoose.Types.ObjectId(access.userId);
    }

    const assigns = await AssignedTopic.find(assignFilter)
      .select('_id student_id class_id')
      .lean<{ _id: mongoose.Types.ObjectId; student_id?: mongoose.Types.ObjectId | null; class_id?: mongoose.Types.ObjectId | null }[]>();

    const topicDoc = (await getTopicById(topicId)) as {
      topic_name?: string;
      subject_id?: unknown;
    } | null;
    const topicName = typeof topicDoc?.topic_name === 'string' ? topicDoc.topic_name : 'Topic';

    const Subject = (await import('@/models/Subject')).default;
    const subId = topicDoc?.subject_id ?? access.topic.subject_id;
    const subjectLean = await Subject.findById(subId).select('name').lean<{ name?: string } | null>();
    const subjectName = subjectLean?.name ?? 'Subject';

    const studentToEdges = new Map<string, Edge[]>();

    const classIdSet = new Set<string>();
    for (const a of assigns) {
      if (a.class_id) classIdSet.add(a.class_id.toString());
    }
    const classOids = [...classIdSet].map((id) => new mongoose.Types.ObjectId(id));

    const classStudentsByClassId = new Map<string, { _id: mongoose.Types.ObjectId; name?: string }[]>();
    if (classOids.length > 0) {
      const classStudents = await User.find({
        organization_id: orgOid,
        role: 'Student',
        class_id: { $in: classOids },
      })
        .select('_id name class_id')
        .lean<{ _id: mongoose.Types.ObjectId; name?: string; class_id?: mongoose.Types.ObjectId | null }[]>();

      for (const u of classStudents) {
        const cid = u.class_id?.toString();
        if (!cid) continue;
        const bucket = classStudentsByClassId.get(cid) ?? [];
        bucket.push(u);
        classStudentsByClassId.set(cid, bucket);
      }
    }

    for (const a of assigns) {
      if (a.student_id) {
        const sid = a.student_id.toString();
        const list = studentToEdges.get(sid) ?? [];
        list.push({ assignId: a._id, kind: 'direct' });
        studentToEdges.set(sid, list);
      }
      if (a.class_id) {
        const roster = classStudentsByClassId.get(a.class_id.toString()) ?? [];
        for (const u of roster) {
          const sid = u._id.toString();
          const list = studentToEdges.get(sid) ?? [];
          list.push({ assignId: a._id, kind: 'class' });
          studentToEdges.set(sid, list);
        }
      }
    }

    const studentIds = [...studentToEdges.keys()];
    const assignIds = assigns.map((a) => a._id);

    const studentOids = studentIds.map((id) => new mongoose.Types.ObjectId(id));

    const progressRows =
      studentOids.length > 0 && assignIds.length > 0
        ? await AssignedTopicProgress.find({
            assigned_topic_id: { $in: assignIds },
            student_id: { $in: studentOids },
          })
            .select('assigned_topic_id student_id status started_at completed_at')
            .lean<
              {
                assigned_topic_id: mongoose.Types.ObjectId;
                student_id: mongoose.Types.ObjectId;
                status?: string;
                started_at?: Date | null;
                completed_at?: Date | null;
              }[]
            >()
        : [];

    const progressKey = (aid: string, sid: string) => `${aid}:${sid}`;
    const progressMap = new Map<string, (typeof progressRows)[number]>();
    for (const p of progressRows) {
      progressMap.set(progressKey(p.assigned_topic_id.toString(), p.student_id.toString()), p);
    }

    const masteryRows =
      studentOids.length > 0
        ? await MasteryRecord.find({
            organization_id: orgOid,
            student_id: { $in: studentOids },
            topic_id: topicOid,
          })
            .select('student_id mastery_score')
            .lean<{ student_id: mongoose.Types.ObjectId; mastery_score?: number }[]>()
        : [];
    const masteryByStudent = new Map<string, number>();
    for (const m of masteryRows) {
      masteryByStudent.set(m.student_id.toString(), m.mastery_score ?? 0);
    }

    const studentMeta = await User.find({ _id: { $in: studentOids } })
      .select('name')
      .lean<{ _id: mongoose.Types.ObjectId; name?: string }[]>();

    const nameByStudent = new Map<string, string>();
    for (const u of studentMeta) {
      nameByStudent.set(u._id.toString(), u.name?.trim() || 'Student');
    }

    const students: AssignmentProgressStudentRow[] = [];

    for (const sid of studentIds) {
      const edges = studentToEdges.get(sid) ?? [];
      const winningId = pickWinningAssignId(edges);
      if (!winningId) continue;

      const prog = progressMap.get(progressKey(winningId.toString(), sid));
      const status = normalizeProgressStatus(prog?.status);

      students.push({
        student_id: sid,
        name: nameByStudent.get(sid) ?? 'Student',
        status,
        mastery_score: masteryByStudent.has(sid) ? masteryByStudent.get(sid)! : null,
        started_at: prog?.started_at ? new Date(prog.started_at).toISOString() : null,
        completed_at: prog?.completed_at ? new Date(prog.completed_at).toISOString() : null,
      });
    }

    const rank = (s: AssignmentLifecycleStatus) => (s === 'completed' ? 2 : s === 'in_progress' ? 1 : 0);
    students.sort((a, b) => {
      const d = rank(a.status) - rank(b.status);
      if (d !== 0) return d;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    let not_started = 0;
    let in_progress = 0;
    let completed = 0;
    for (const s of students) {
      if (s.status === 'completed') completed += 1;
      else if (s.status === 'in_progress') in_progress += 1;
      else not_started += 1;
    }

    const payload: AssignmentProgressPayload = {
      topic_name: topicName,
      subject_name: subjectName,
      total_students: students.length,
      not_started,
      in_progress,
      completed,
      students,
    };

    return successResponse(payload, 200);
  } catch (error) {
    console.error('[GET /api/teacher/assignment-progress]', error);
    return errorResponse('Internal Server Error', 500);
  }
}
