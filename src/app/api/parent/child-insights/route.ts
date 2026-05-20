import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import {
  PARENT_ACTIVITY_DAYS,
  buildActionSuggestions,
  buildFallbackAiSummary,
  generateParentInsightParagraph,
  improvementTrendFromSessions,
  parentEngagementScore,
} from '@/lib/parent-child-insights';
import { fetchStudentAssignedTopicItems, sortAssignedTopicsCopy } from '@/lib/student-assigned-topics-data';

function isParent(role: string | undefined): boolean {
  return (role || '').toLowerCase() === 'parent';
}

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!isParent(auth.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId')?.trim() || '';
    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      return NextResponse.json({ success: false, error: 'childId is required' }, { status: 400 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const ParentProfile = (await import('@/models/ParentProfile')).default;
    const MasteryRecord = (await import('@/models/MasteryRecord')).default;
    const Session = (await import('@/models/Session')).default;
    const SessionEvent = (await import('@/models/SessionEvent')).default;
    const Topic = (await import('@/models/Topic')).default;
    const Subject = (await import('@/models/Subject')).default;

    const parentUser = await User.findById(auth.userId)
      .select('role organization_id')
      .lean() as { role?: string; organization_id?: mongoose.Types.ObjectId } | null;
    if (!parentUser?.organization_id) {
      return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 400 });
    }

    const orgId = parentUser.organization_id;
    const profile = await ParentProfile.findOne({ user_id: auth.userId }).lean() as {
      children?: { _id: mongoose.Types.ObjectId; name: string; email: string }[];
    } | null;

    const childEntry = profile?.children?.find((c) => String(c._id) === childId);
    if (!childEntry) {
      return NextResponse.json({ success: false, error: 'Child not found' }, { status: 404 });
    }

    const childName = childEntry.name?.trim() || 'Your child';
    const emailLower = childEntry.email.trim().toLowerCase();

    const student = await User.findOne({
      email: emailLower,
      role: 'Student',
      organization_id: orgId,
      status: 'active',
    })
      .select('_id')
      .lean() as { _id: mongoose.Types.ObjectId } | null;

    const linkedAccount = !!student;
    const studentId = student?._id;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - PARENT_ACTIVITY_DAYS);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - PARENT_ACTIVITY_DAYS);

    let avg_mastery = 0;
    let strong_topics: string[] = [];
    let weak_topics: string[] = [];
    let recent_activity = 0;
    let sessions_prior_week = 0;
    let engagement_score = 0;
    let improvement_trend: 'up' | 'down' | 'steady' = 'steady';

    if (linkedAccount && studentId) {
      const masteryRows = (await MasteryRecord.find({
        organization_id: orgId,
        student_id: studentId,
      }).lean()
        .exec()) as unknown as {
        topic_id: mongoose.Types.ObjectId;
        mastery_score?: number;
        attempt_count?: number;
      }[];

      const topicIds = [...new Set(masteryRows.map((r) => String(r.topic_id)))].map((id) => new mongoose.Types.ObjectId(id));
      const topics = (await Topic.find({ _id: { $in: topicIds } }).select('topic_name subject_id').lean()) as {
        _id: mongoose.Types.ObjectId;
        topic_name?: string;
        subject_id?: mongoose.Types.ObjectId;
      }[];
      const subIds = [...new Set(topics.map((t) => String(t.subject_id)).filter(Boolean))].map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const subjects = (await Subject.find({ _id: { $in: subIds } }).select('name').lean()) as {
        _id: mongoose.Types.ObjectId;
        name?: string;
      }[];
      const subName = new Map(subjects.map((s) => [String(s._id), s.name || 'Subject']));
      const topicLabel = new Map<string, string>();
      for (const t of topics) {
        const sn = subName.get(String(t.subject_id)) || '';
        const tn = t.topic_name || 'Topic';
        topicLabel.set(String(t._id), sn ? `${tn} · ${sn}` : tn);
      }

      if (masteryRows.length > 0) {
        let sum = 0;
        for (const r of masteryRows) {
          sum += typeof r.mastery_score === 'number' ? r.mastery_score : 0;
        }
        avg_mastery = Math.round(sum / masteryRows.length);
      }

      const pool = masteryRows.filter((r) => (r.attempt_count ?? 0) > 0);
      const rowsForTopics = pool.length > 0 ? pool : masteryRows;
      const byTopic = new Map<string, { label: string; score: number }>();
      for (const r of rowsForTopics) {
        const id = String(r.topic_id);
        const label = topicLabel.get(id) || 'Topic';
        const score = typeof r.mastery_score === 'number' ? r.mastery_score : 0;
        byTopic.set(id, { label, score });
      }
      const arr = [...byTopic.values()];
      const desc = [...arr].sort((a, b) => b.score - a.score);
      const asc = [...arr].sort((a, b) => a.score - b.score);
      strong_topics = desc.slice(0, 3).map((x) => x.label);
      weak_topics = asc.slice(0, 3).map((x) => x.label);

      recent_activity = await Session.countDocuments({
        organization_id: orgId,
        student_id: studentId,
        start_time: { $gte: weekStart },
      });

      sessions_prior_week = await Session.countDocuments({
        organization_id: orgId,
        student_id: studentId,
        start_time: { $gte: prevWeekStart, $lt: weekStart },
      });

      improvement_trend = improvementTrendFromSessions(recent_activity, sessions_prior_week);

      const sessionIds = (
        await Session.find({
          organization_id: orgId,
          student_id: studentId,
          start_time: { $gte: weekStart },
        })
          .select('_id')
          .lean()
      ).map((s) => s._id as mongoose.Types.ObjectId);

      let eventCount = 0;
      if (sessionIds.length > 0) {
        eventCount = await SessionEvent.countDocuments({
          organization_id: orgId,
          student_id: studentId,
          session_id: { $in: sessionIds },
          timestamp: { $gte: weekStart },
        });
      }

      engagement_score = parentEngagementScore(recent_activity, eventCount);
    }

    const strongForAi = strong_topics;
    const weakForAi = weak_topics;

    let assigned_topics: {
      topic_id: string;
      topic_name: string;
      subject_name: string;
      status: string;
      mastery_score: number | null;
      started_at: string | null;
      completed_at: string | null;
    }[] = [];

    if (linkedAccount && studentId) {
      const studentDoc = await User.findById(studentId)
        .select('class_id')
        .lean() as { class_id?: mongoose.Types.ObjectId | null } | null;
      const childClassId = studentDoc?.class_id?.toString() ?? null;
      const items = sortAssignedTopicsCopy(
        await fetchStudentAssignedTopicItems(
          studentId.toString(),
          orgId.toString(),
          childClassId
        )
      );
      assigned_topics = items.map((row) => ({
        topic_id: row.topic_id,
        topic_name: row.topic_name,
        subject_name: row.subject_name,
        status: row.status,
        mastery_score: row.mastery_score,
        started_at: row.started_at ?? null,
        completed_at: row.completed_at ?? null,
      }));
    }

    const assignedTotal = assigned_topics.length;
    const assignedIncomplete = assigned_topics.filter((t) => t.status !== 'completed').length;
    const assignedCompleted = assigned_topics.filter((t) => t.status === 'completed').length;
    const assignedForSuggestions = assigned_topics.map((t) => ({
      status: t.status,
      topic_name: t.topic_name,
    }));

    const ai_summary =
      (await generateParentInsightParagraph({
        childName,
        avgMastery: avg_mastery,
        strongTopicLabels: strongForAi,
        weakTopicLabels: weakForAi,
        recentActivity: recent_activity,
        trend: improvement_trend,
        linkedAccount,
        teacherAssigned:
          linkedAccount && assignedTotal > 0
            ? {
                totalTopics: assignedTotal,
                notStartedOrInProgress: assignedIncomplete,
                completed: assignedCompleted,
              }
            : undefined,
      })) ??
      buildFallbackAiSummary({
        childName,
        avgMastery: avg_mastery,
        strongLabels: strongForAi,
        weakLabels: weakForAi,
        recentActivity: recent_activity,
        trend: improvement_trend,
        linkedAccount,
        assignedTotal: linkedAccount ? assignedTotal : 0,
        assignedIncomplete: linkedAccount ? assignedIncomplete : 0,
        assignedCompleted: linkedAccount ? assignedCompleted : 0,
      });

    const action_suggestions = buildActionSuggestions({
      weakLabels: weak_topics,
      strongLabels: strong_topics,
      recentActivity: recent_activity,
      trend: improvement_trend,
      linkedAccount,
      assignedTopics: linkedAccount ? assignedForSuggestions : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        child_name: childName,
        avg_mastery,
        recent_activity,
        strong_topics,
        weak_topics,
        improvement_trend,
        engagement_score,
        ai_summary,
        action_suggestions,
        linked_account: linkedAccount,
        assigned_topics,
      },
    });
  } catch (e) {
    console.error('[GET /api/parent/child-insights]', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
