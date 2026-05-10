/**
 * AI-first execution layer — Sessions, session events, mastery, knowledge gaps, confusion logs.
 * Complements @legacy marketplace progress in StudentProfile.completedLessons (docs/AI_FIRST_MIGRATION.md).
 */
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

// --- Sessions ---
export type SessionMode = 'explorer' | 'revision' | 'exam';
export type CompletionStatus = 'in_progress' | 'completed' | 'abandoned';

export type SessionLearningMode = 'teacher_assigned' | 'free_learning';
export type SessionSource = 'assigned' | 'free';

export type CreateSessionInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  mode: SessionMode;
  session_mode?: SessionLearningMode;
  session_source?: SessionSource;
  ai_model_used?: string;
  start_time: Date;
  end_time?: Date;
  duration_seconds?: number;
  confusion_count?: number;
  teachback_score?: number;
  completion_status?: CompletionStatus;
};

export async function createSession(data: CreateSessionInput) {
  await connectToDB();
  const Session = (await import('@/models/Session')).default;
  return Session.create({
    organization_id: data.organization_id,
    student_id: data.student_id,
    topic_id: data.topic_id,
    subject_id: data.subject_id,
    mode: data.mode,
    session_mode: data.session_mode ?? 'free_learning',
    session_source: data.session_source ?? 'free',
    ai_model_used: data.ai_model_used,
    start_time: data.start_time,
    end_time: data.end_time,
    duration_seconds: data.duration_seconds ?? 0,
    confusion_count: data.confusion_count ?? 0,
    teachback_score: data.teachback_score,
    completion_status: data.completion_status ?? 'in_progress',
  });
}

export async function getSessionsForStudent(
  studentId: string | mongoose.Types.ObjectId,
  options?: { topicId?: mongoose.Types.ObjectId; completionStatus?: CompletionStatus }
) {
  await connectToDB();
  const Session = (await import('@/models/Session')).default;
  const query: Record<string, unknown> = { student_id: studentId };
  if (options?.topicId) query.topic_id = options.topicId;
  if (options?.completionStatus) query.completion_status = options.completionStatus;
  return Session.find(query).sort({ start_time: -1 }).lean().exec();
}

export async function getLastSessionForStudent(studentId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const Session = (await import('@/models/Session')).default;
  return Session.findOne({ student_id: studentId }).sort({ start_time: -1 }).lean().exec();
}

export async function getSessionsForTopic(topicId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const Session = (await import('@/models/Session')).default;
  return Session.find({ topic_id: topicId }).sort({ start_time: -1 }).lean().exec();
}

export async function getSessionById(sessionId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const Session = (await import('@/models/Session')).default;
  return Session.findById(sessionId).lean().exec();
}

/** Mutable session document (tutor state updates, teachback score, etc.). */
export async function getSessionDocumentById(sessionId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const Session = (await import('@/models/Session')).default;
  return Session.findById(sessionId).exec();
}

export async function endSession(sessionId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const Session = (await import('@/models/Session')).default;
  const session = await Session.findById(sessionId).exec();
  if (!session) return null;
  const endTime = new Date();
  const startTime = (session as { start_time?: Date }).start_time;
  const durationSeconds = startTime
    ? Math.round((endTime.getTime() - new Date(startTime).getTime()) / 1000)
    : 0;
  session.end_time = endTime;
  session.duration_seconds = durationSeconds;
  (session as { completion_status?: string }).completion_status = 'completed';
  await session.save();
  return session;
}

// --- Session events ---
export type SessionEventType =
  | 'question'
  | 'answer'
  | 'pause'
  | 'rewind'
  | 'play'
  | 'hint_request'
  | 'teachback'
  | 'teachback_attempt'
  | 'hint_given'
  | 'explanation_given'
  | 'difficulty_changed'
  | 'session_end'
  | 'start_learning_click';

export type CreateSessionEventInput = {
  organization_id: mongoose.Types.ObjectId;
  session_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  event_type: SessionEventType;
  content?: string;
  response_time_ms?: number;
  is_correct?: boolean;
  metadata?: unknown;
  timestamp?: Date;
};

export async function createSessionEvent(data: CreateSessionEventInput) {
  await connectToDB();
  const SessionEvent = (await import('@/models/SessionEvent')).default;
  return SessionEvent.create(data);
}

export async function createSessionEventsBatch(events: CreateSessionEventInput[]) {
  if (events.length === 0) return [];
  await connectToDB();
  const SessionEvent = (await import('@/models/SessionEvent')).default;
  const docs = await SessionEvent.insertMany(events);
  return docs;
}

export async function getEventsForSession(sessionId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const SessionEvent = (await import('@/models/SessionEvent')).default;
  return SessionEvent.find({ session_id: sessionId }).sort({ timestamp: 1 }).lean().exec();
}

/**
 * After a session ends: roll up `answer` events (with is_correct) into the student's mastery record.
 * Idempotent per session if only called once from endSession API (session is then completed).
 */
export async function applyMasteryFromSessionAnswerEvents(
  sessionId: string | mongoose.Types.ObjectId,
  studentId: string
) {
  const session = await getSessionById(sessionId);
  if (!session) return null;
  const s = session as {
    student_id?: unknown;
    topic_id?: unknown;
    organization_id?: unknown;
  };
  if (String(s.student_id) !== studentId) return null;

  const events = await getEventsForSession(sessionId);
  const answers: { is_correct: boolean }[] = [];
  for (const raw of events) {
    const e = raw as { event_type?: string; is_correct?: unknown };
    if (e.event_type === 'answer' && typeof e.is_correct === 'boolean') {
      answers.push({ is_correct: e.is_correct });
    }
  }

  if (answers.length === 0) return null;

  const sessionAttempts = answers.length;
  const sessionCorrect = answers.filter((a) => a.is_correct).length;

  const topicOid = new mongoose.Types.ObjectId(String(s.topic_id));
  const orgOid = new mongoose.Types.ObjectId(String(s.organization_id));

  const existing = await getMasteryRecord(studentId, topicOid, orgOid);
  const prevAttempt = (existing as { attempt_count?: number } | null)?.attempt_count ?? 0;
  const prevCorrect = (existing as { correct_answers?: number } | null)?.correct_answers ?? 0;

  const newAttempt = prevAttempt + sessionAttempts;
  const newCorrect = prevCorrect + sessionCorrect;
  let masteryScore = newAttempt > 0 ? Math.round((newCorrect / newAttempt) * 100) : 0;

  const teachback = (session as { teachback_score?: number }).teachback_score;
  if (typeof teachback === 'number' && teachback >= 60) {
    const bump = teachback >= 85 ? 6 : teachback >= 75 ? 4 : 2;
    masteryScore = Math.min(100, masteryScore + bump);
  }

  return createOrUpdateMasteryRecord({
    organization_id: orgOid,
    student_id: new mongoose.Types.ObjectId(studentId),
    topic_id: topicOid,
    attempt_count: newAttempt,
    correct_answers: newCorrect,
    mastery_score: masteryScore,
    confidence_score: masteryScore,
    revision_needed: masteryScore < 40,
    last_session_id: new mongoose.Types.ObjectId(String(sessionId)),
    last_updated: new Date(),
  });
}

// --- Mastery records ---
export type CreateMasteryRecordInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  mastery_score?: number;
  confidence_score?: number;
  correct_answers?: number;
  teachback_average?: number;
  engagement_score?: number;
  revision_needed?: boolean;
  attempt_count?: number;
  last_session_id?: mongoose.Types.ObjectId;
  last_updated?: Date;
};

export async function createOrUpdateMasteryRecord(data: CreateMasteryRecordInput) {
  await connectToDB();
  const MasteryRecord = (await import('@/models/MasteryRecord')).default;
  const filter = {
    organization_id: data.organization_id,
    student_id: data.student_id,
    topic_id: data.topic_id,
  };
  let doc = await MasteryRecord.findOne(filter).exec();
  const now = data.last_updated ?? new Date();
  if (doc) {
    if (data.mastery_score !== undefined) doc.mastery_score = data.mastery_score;
    if (data.confidence_score !== undefined) doc.confidence_score = data.confidence_score;
    if (data.correct_answers !== undefined) (doc as { correct_answers?: number }).correct_answers = data.correct_answers;
    if (data.teachback_average !== undefined) doc.teachback_average = data.teachback_average;
    if (data.engagement_score !== undefined) doc.engagement_score = data.engagement_score;
    if (data.revision_needed !== undefined) doc.revision_needed = data.revision_needed;
    if (data.attempt_count !== undefined) doc.attempt_count = data.attempt_count;
    if (data.last_session_id !== undefined) doc.last_session_id = data.last_session_id;
    doc.last_updated = now;
    await doc.save();
    return doc;
  }
  doc = await MasteryRecord.create({
    ...filter,
    mastery_score: data.mastery_score ?? 0,
    confidence_score: data.confidence_score ?? 0,
    correct_answers: data.correct_answers ?? 0,
    teachback_average: data.teachback_average,
    engagement_score: data.engagement_score,
    revision_needed: data.revision_needed ?? false,
    attempt_count: data.attempt_count ?? 0,
    last_session_id: data.last_session_id,
    last_updated: now,
  });
  return doc;
}

export async function getMasteryRecord(
  studentId: string | mongoose.Types.ObjectId,
  topicId: string | mongoose.Types.ObjectId,
  organizationId: string | mongoose.Types.ObjectId
) {
  await connectToDB();
  const MasteryRecord = (await import('@/models/MasteryRecord')).default;
  return MasteryRecord.findOne({
    organization_id: organizationId,
    student_id: studentId,
    topic_id: topicId,
  })
    .lean()
    .exec();
}

export async function getMasteryRecordsForStudent(studentId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const MasteryRecord = (await import('@/models/MasteryRecord')).default;
  return MasteryRecord.find({ student_id: studentId }).lean().exec();
}

// --- Knowledge gaps ---
export type CreateKnowledgeGapInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  root_cause_topic_id?: mongoose.Types.ObjectId;
  severity_score?: number;
  detected_reason?: string;
  resolved?: boolean;
};

export async function createKnowledgeGap(data: CreateKnowledgeGapInput) {
  await connectToDB();
  const KnowledgeGap = (await import('@/models/KnowledgeGap')).default;
  return KnowledgeGap.create({
    organization_id: data.organization_id,
    student_id: data.student_id,
    topic_id: data.topic_id,
    root_cause_topic_id: data.root_cause_topic_id,
    severity_score: data.severity_score ?? 0,
    detected_reason: data.detected_reason,
    resolved: data.resolved ?? false,
  });
}

export async function getKnowledgeGapsForStudent(
  studentId: string | mongoose.Types.ObjectId,
  options?: { resolved?: boolean; topicId?: mongoose.Types.ObjectId }
) {
  await connectToDB();
  const KnowledgeGap = (await import('@/models/KnowledgeGap')).default;
  const query: Record<string, unknown> = { student_id: studentId };
  if (options?.resolved !== undefined) query.resolved = options.resolved;
  if (options?.topicId) query.topic_id = options.topicId;
  return KnowledgeGap.find(query).sort({ createdAt: -1 }).lean().exec();
}

export async function getKnowledgeGapsForTopic(topicId: string | mongoose.Types.ObjectId, options?: { resolved?: boolean }) {
  await connectToDB();
  const KnowledgeGap = (await import('@/models/KnowledgeGap')).default;
  const query: Record<string, unknown> = { topic_id: topicId };
  if (options?.resolved !== undefined) query.resolved = options.resolved;
  return KnowledgeGap.find(query).lean().exec();
}

// --- Confusion logs ---
export type CreateConfusionLogInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  session_id?: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  trigger_type?: string;
  trigger_reason?: string;
  timestamp?: Date;
};

export async function createConfusionLog(data: CreateConfusionLogInput) {
  await connectToDB();
  const ConfusionLog = (await import('@/models/ConfusionLog')).default;
  return ConfusionLog.create(data);
}

export async function getConfusionLogsForStudent(
  studentId: string | mongoose.Types.ObjectId,
  options?: { topicId?: mongoose.Types.ObjectId; sessionId?: mongoose.Types.ObjectId }
) {
  await connectToDB();
  const ConfusionLog = (await import('@/models/ConfusionLog')).default;
  const query: Record<string, unknown> = { student_id: studentId };
  if (options?.topicId) query.topic_id = options.topicId;
  if (options?.sessionId) query.session_id = options.sessionId;
  return ConfusionLog.find(query).sort({ timestamp: -1 }).lean().exec();
}

export async function getConfusionLogsForTopic(topicId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const ConfusionLog = (await import('@/models/ConfusionLog')).default;
  return ConfusionLog.find({ topic_id: topicId }).sort({ timestamp: -1 }).lean().exec();
}
