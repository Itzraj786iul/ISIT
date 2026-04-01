import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import {
  INSIGHTS_RECENT_DAYS,
  confusionScoreFromCount,
  engagementScoreFromCounts,
  isStrugglingForOverview,
  needsAttention,
} from '@/lib/teacher-student-insights';

const WEAK_MASTERY_THRESHOLD = 50;
const STRUGGLE_ALERT_MIN_STUDENTS = 2;
const HIGH_CONFUSION_MIN_LOGS = 4;

type LeanDoc = { _id: mongoose.Types.ObjectId };

function isTeacher(role: string | undefined): boolean {
  return (role || '').toLowerCase() === 'teacher';
}

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!isTeacher(auth.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectToDB();

    const User = (await import('@/models/User')).default;
    const Subject = (await import('@/models/Subject')).default;
    const Topic = (await import('@/models/Topic')).default;
    const MasteryRecord = (await import('@/models/MasteryRecord')).default;
    const Session = (await import('@/models/Session')).default;
    const ConfusionLog = (await import('@/models/ConfusionLog')).default;
    const SessionEvent = (await import('@/models/SessionEvent')).default;
    const KnowledgeGap = (await import('@/models/KnowledgeGap')).default;

    const teacher = await User.findById(auth.userId).lean<{ organization_id?: mongoose.Types.ObjectId } | null>();
    if (!teacher?.organization_id) {
      return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 400 });
    }

    const orgId = teacher.organization_id as mongoose.Types.ObjectId;
    const url = new URL(req.url);
    const gradeParam = url.searchParams.get('grade')?.trim() || '';
    const subjectIdParam = url.searchParams.get('subjectId')?.trim() || '';

    let subjectObjectIds: mongoose.Types.ObjectId[] = [];

    if (subjectIdParam) {
      if (!mongoose.Types.ObjectId.isValid(subjectIdParam)) {
        return NextResponse.json({ success: false, error: 'Invalid subjectId' }, { status: 400 });
      }
      const sub = (await Subject.findOne({
        _id: new mongoose.Types.ObjectId(subjectIdParam),
        organization_id: orgId,
      })
        .lean()
        .exec()) as LeanDoc | null;
      if (!sub) {
        return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
      }
      subjectObjectIds = [sub._id];
    } else if (gradeParam) {
      const subs = (await Subject.find({ organization_id: orgId, grade: gradeParam }).lean().exec()) as LeanDoc[];
      subjectObjectIds = subs.map((s) => s._id);
    }

    const topicQuery: Record<string, unknown> = { organization_id: orgId, is_active: true };
    if (subjectObjectIds.length > 0) {
      topicQuery.subject_id = { $in: subjectObjectIds };
    }

    const topics = (await Topic.find(topicQuery).select('_id topic_name subject_id').lean().exec()) as (LeanDoc & {
      topic_name?: string;
    })[];
    const allowedTopicIds = topics.map((t) => t._id);
    const topicNameById = new Map<string, string>(
      topics.map((t) => [String(t._id), t.topic_name || 'Topic'])
    );

    const since = new Date();
    since.setDate(since.getDate() - INSIGHTS_RECENT_DAYS);

    const students = (await User.find({
      organization_id: orgId,
      role: 'Student',
      status: 'active',
    })
      .select('_id name')
      .lean()
      .exec()) as (LeanDoc & { name?: string })[];

    const studentIds = students.map((s) => s._id);
    const studentIdStrs = studentIds.map((id) => String(id));

    if (studentIds.length === 0 || allowedTopicIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          filters: { grade: gradeParam || null, subjectId: subjectIdParam || null },
          overview: {
            avg_mastery_pct: 0,
            total_students: students.length,
            students_struggling: 0,
          },
          students: [],
          alerts: [] as string[],
        },
      });
    }

    const masteryMatch: Record<string, unknown> = {
      organization_id: orgId,
      student_id: { $in: studentIds },
      topic_id: { $in: allowedTopicIds },
    };

    const masteryRows = await MasteryRecord.find(masteryMatch).lean().exec();

    const masteryByStudent = new Map<string, { sum: number; n: number; weak: { topic_id: string; topic_name: string; mastery_score: number }[] }>();
    for (const sid of studentIdStrs) {
      masteryByStudent.set(sid, { sum: 0, n: 0, weak: [] });
    }

    for (const row of masteryRows) {
      const sid = String(row.student_id);
      if (!masteryByStudent.has(sid)) continue;
      const bucket = masteryByStudent.get(sid)!;
      const score = typeof row.mastery_score === 'number' ? row.mastery_score : 0;
      bucket.sum += score;
      bucket.n += 1;
      if (score < WEAK_MASTERY_THRESHOLD) {
        const tid = String(row.topic_id);
        bucket.weak.push({
          topic_id: tid,
          topic_name: topicNameById.get(tid) || 'Topic',
          mastery_score: score,
        });
      }
    }

    const gapRows = await KnowledgeGap.find({
      organization_id: orgId,
      student_id: { $in: studentIds },
      topic_id: { $in: allowedTopicIds },
      resolved: false,
    })
      .lean()
      .exec();

    const gapsByStudent = new Map<string, Set<string>>();
    for (const g of gapRows) {
      const sid = String(g.student_id);
      const tid = String(g.topic_id);
      if (!gapsByStudent.has(sid)) gapsByStudent.set(sid, new Set());
      gapsByStudent.get(sid)!.add(tid);
    }

    const sessionMatch: Record<string, unknown> = {
      organization_id: orgId,
      student_id: { $in: studentIds },
      start_time: { $gte: since },
      topic_id: { $in: allowedTopicIds },
    };

    const sessionCounts = await Session.aggregate<{ _id: mongoose.Types.ObjectId; c: number }>([
      { $match: sessionMatch },
      { $group: { _id: '$student_id', c: { $sum: 1 } } },
    ]).exec();

    const sessionCountByStudent = new Map<string, number>(
      sessionCounts.map((x) => [String(x._id), x.c])
    );

    const confusionCounts = await ConfusionLog.aggregate<{ _id: mongoose.Types.ObjectId; c: number }>([
      {
        $match: {
          organization_id: orgId,
          student_id: { $in: studentIds },
          timestamp: { $gte: since },
          topic_id: { $in: allowedTopicIds },
        },
      },
      { $group: { _id: '$student_id', c: { $sum: 1 } } },
    ]).exec();

    const confusionCountByStudent = new Map<string, number>(
      confusionCounts.map((x) => [String(x._id), x.c])
    );

    const eventCounts = await SessionEvent.aggregate<{ _id: mongoose.Types.ObjectId; n: number }>([
      {
        $match: {
          organization_id: orgId,
          student_id: { $in: studentIds },
          timestamp: { $gte: since },
        },
      },
      {
        $lookup: {
          from: 'sessions',
          localField: 'session_id',
          foreignField: '_id',
          as: 'sess',
        },
      },
      { $unwind: '$sess' },
      {
        $match: {
          'sess.topic_id': { $in: allowedTopicIds },
        },
      },
      { $group: { _id: '$student_id', n: { $sum: 1 } } },
    ]).exec();

    const eventCountByStudent = new Map<string, number>(eventCounts.map((x) => [String(x._id), x.n]));

    const topicStruggleCount = new Map<string, { name: string; count: number }>();

    const studentPayload = students.map((s) => {
      const sid = String(s._id);
      const m = masteryByStudent.get(sid)!;
      const avgMastery = m.n > 0 ? Math.round(m.sum / m.n) : 0;

      const weakSorted = [...m.weak].sort((a, b) => a.mastery_score - b.mastery_score);
      const seen = new Set<string>();
      const weak_topics: { topic_id: string; topic_name: string; mastery_score: number }[] = [];
      for (const w of weakSorted) {
        if (seen.has(w.topic_id)) continue;
        seen.add(w.topic_id);
        weak_topics.push(w);
        if (weak_topics.length >= 3) break;
      }

      const gapSet = gapsByStudent.get(sid);
      if (gapSet && weak_topics.length < 3) {
        for (const tid of gapSet) {
          if (seen.has(tid)) continue;
          seen.add(tid);
          weak_topics.push({
            topic_id: tid,
            topic_name: topicNameById.get(tid) || 'Topic',
            mastery_score: 0,
          });
          if (weak_topics.length >= 3) break;
        }
      }

      for (const w of weak_topics) {
        const prev = topicStruggleCount.get(w.topic_id);
        topicStruggleCount.set(w.topic_id, {
          name: w.topic_name,
          count: (prev?.count ?? 0) + 1,
        });
      }

      const recent_sessions_count = sessionCountByStudent.get(sid) ?? 0;
      const confusionN = confusionCountByStudent.get(sid) ?? 0;
      const eventN = eventCountByStudent.get(sid) ?? 0;
      const confusion_score = confusionScoreFromCount(confusionN);
      const engagement_score = engagementScoreFromCounts(recent_sessions_count, eventN);

      return {
        student_id: sid,
        name: s.name || 'Student',
        avg_mastery: avgMastery,
        weak_topics,
        recent_sessions_count,
        confusion_score,
        engagement_score,
        needs_attention: needsAttention(avgMastery, weak_topics.length, confusion_score),
      };
    });

    let masterySumForAvg = 0;
    let masteryCountForAvg = 0;
    let struggling = 0;
    for (const row of studentPayload) {
      masterySumForAvg += row.avg_mastery;
      masteryCountForAvg += 1;
      if (isStrugglingForOverview(row.avg_mastery, row.weak_topics.length)) struggling += 1;
    }

    const avg_mastery_pct =
      masteryCountForAvg > 0 ? Math.round(masterySumForAvg / masteryCountForAvg) : 0;

    const alerts: string[] = [];
    for (const [, v] of topicStruggleCount) {
      if (v.count >= STRUGGLE_ALERT_MIN_STUDENTS) {
        alerts.push(`${v.count} students struggling in ${v.name}`);
      }
    }

    const confusionByTopic = await ConfusionLog.aggregate<{ _id: mongoose.Types.ObjectId; c: number }>([
      {
        $match: {
          organization_id: orgId,
          timestamp: { $gte: since },
          topic_id: { $in: allowedTopicIds },
        },
      },
      { $group: { _id: '$topic_id', c: { $sum: 1 } } },
      { $sort: { c: -1 } },
      { $limit: 8 },
    ]).exec();

    for (const row of confusionByTopic) {
      if (row.c < HIGH_CONFUSION_MIN_LOGS) break;
      const name = topicNameById.get(String(row._id)) || 'this topic';
      alerts.push(`High confusion in ${name}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        filters: { grade: gradeParam || null, subjectId: subjectIdParam || null },
        overview: {
          avg_mastery_pct,
          total_students: students.length,
          students_struggling: struggling,
        },
        students: studentPayload,
        alerts,
      },
    });
  } catch (e) {
    console.error('[teacher/student-insights]', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
