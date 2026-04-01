import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

// --- Learning plans ---
export type CreateLearningPlanInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  week_start_date: Date;
  weekly_roadmap?: unknown;
  daily_plan?: unknown;
  revision_schedule?: unknown;
  generated_by?: string;
  plan_version?: string;
};

export async function createLearningPlan(data: CreateLearningPlanInput) {
  await connectToDB();
  const LearningPlan = (await import('@/models/LearningPlan')).default;
  return LearningPlan.create({
    organization_id: data.organization_id,
    student_id: data.student_id,
    week_start_date: data.week_start_date,
    weekly_roadmap: data.weekly_roadmap,
    daily_plan: data.daily_plan,
    revision_schedule: data.revision_schedule,
    generated_by: data.generated_by,
    plan_version: data.plan_version ?? '1.0',
  });
}

export async function getLearningPlansForStudent(
  studentId: string | mongoose.Types.ObjectId,
  options?: { weekStartFrom?: Date; weekStartTo?: Date }
) {
  await connectToDB();
  const LearningPlan = (await import('@/models/LearningPlan')).default;
  const query: Record<string, unknown> = { student_id: studentId };
  if (options?.weekStartFrom != null || options?.weekStartTo != null) {
    query.week_start_date = {};
    if (options.weekStartFrom != null) (query.week_start_date as Record<string, Date>).$gte = options.weekStartFrom;
    if (options.weekStartTo != null) (query.week_start_date as Record<string, Date>).$lte = options.weekStartTo;
  }
  return LearningPlan.find(query).sort({ week_start_date: -1 }).lean().exec();
}

export async function getLearningPlanByWeek(
  studentId: string | mongoose.Types.ObjectId,
  weekStartDate: Date,
  organizationId: string | mongoose.Types.ObjectId
) {
  await connectToDB();
  const LearningPlan = (await import('@/models/LearningPlan')).default;
  return LearningPlan.findOne({
    organization_id: organizationId,
    student_id: studentId,
    week_start_date: weekStartDate,
  })
    .lean()
    .exec();
}

// --- Student goal profiles ---
export type CreateStudentGoalProfileInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  goal_type?: string;
  target_exam_date?: Date;
  target_mastery_score?: number;
  preferred_study_minutes_per_day?: number;
};

export async function createStudentGoalProfile(data: CreateStudentGoalProfileInput) {
  await connectToDB();
  const StudentGoalProfile = (await import('@/models/StudentGoalProfile')).default;
  return StudentGoalProfile.create(data);
}

export async function getStudentGoalProfile(
  studentId: string | mongoose.Types.ObjectId,
  organizationId: string | mongoose.Types.ObjectId
) {
  await connectToDB();
  const StudentGoalProfile = (await import('@/models/StudentGoalProfile')).default;
  return StudentGoalProfile.findOne({
    organization_id: organizationId,
    student_id: studentId,
  })
    .lean()
    .exec();
}

// --- Performance metrics ---
export type CreateOrUpdatePerformanceMetricsInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  month: string;
  avg_mastery?: number;
  learning_time_minutes?: number;
  retention_score?: number;
  improvement_rate?: number;
  topics_completed?: number;
  confusion_frequency?: number;
};

export async function createOrUpdatePerformanceMetrics(data: CreateOrUpdatePerformanceMetricsInput) {
  await connectToDB();
  const PerformanceMetrics = (await import('@/models/PerformanceMetrics')).default;
  const now = new Date();
  const setPayload: Record<string, unknown> = { updated_at: now };
  if (data.avg_mastery !== undefined) setPayload.avg_mastery = data.avg_mastery;
  if (data.learning_time_minutes !== undefined) setPayload.learning_time_minutes = data.learning_time_minutes;
  if (data.retention_score !== undefined) setPayload.retention_score = data.retention_score;
  if (data.improvement_rate !== undefined) setPayload.improvement_rate = data.improvement_rate;
  if (data.topics_completed !== undefined) setPayload.topics_completed = data.topics_completed;
  if (data.confusion_frequency !== undefined) setPayload.confusion_frequency = data.confusion_frequency;
  const doc = await PerformanceMetrics.findOneAndUpdate(
    {
      organization_id: data.organization_id,
      student_id: data.student_id,
      month: data.month,
    },
    {
      $set: setPayload,
      $setOnInsert: {
        avg_mastery: data.avg_mastery ?? 0,
        learning_time_minutes: data.learning_time_minutes ?? 0,
        topics_completed: data.topics_completed ?? 0,
        confusion_frequency: data.confusion_frequency ?? 0,
      },
    },
    { new: true, upsert: true }
  );
  return doc;
}

function getCurrentMonthString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Increment learning_time_minutes and topics_completed for the current month (upsert). */
export async function incrementLearningTimeAndTopics(
  organizationId: mongoose.Types.ObjectId,
  studentId: string | mongoose.Types.ObjectId,
  timeSpentMinutes: number
) {
  if (timeSpentMinutes <= 0) return null;
  await connectToDB();
  const PerformanceMetrics = (await import('@/models/PerformanceMetrics')).default;
  const month = getCurrentMonthString();
  const doc = await PerformanceMetrics.findOneAndUpdate(
    { organization_id: organizationId, student_id: studentId, month },
    {
      $inc: { learning_time_minutes: timeSpentMinutes, topics_completed: 1 },
      $set: { updated_at: new Date() },
      $setOnInsert: { avg_mastery: 0, confusion_frequency: 0 },
    },
    { new: true, upsert: true }
  );
  return doc;
}

export async function getPerformanceMetricsForStudent(
  studentId: string | mongoose.Types.ObjectId,
  options?: { month?: string; fromMonth?: string; toMonth?: string }
) {
  await connectToDB();
  const PerformanceMetrics = (await import('@/models/PerformanceMetrics')).default;
  const query: Record<string, unknown> = { student_id: studentId };
  if (options?.month) query.month = options.month;
  if (options?.fromMonth != null || options?.toMonth != null) {
    query.month = {};
    if (options.fromMonth != null) (query.month as Record<string, string>).$gte = options.fromMonth;
    if (options.toMonth != null) (query.month as Record<string, string>).$lte = options.toMonth;
  }
  return PerformanceMetrics.find(query).sort({ month: -1 }).lean().exec();
}

// --- Recommendation feedback ---
export type CreateRecommendationFeedbackInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  recommendation_id: string;
  feedback_type?: string;
  feedback_reason?: string;
};

export async function createRecommendationFeedback(data: CreateRecommendationFeedbackInput) {
  await connectToDB();
  const RecommendationFeedback = (await import('@/models/RecommendationFeedback')).default;
  return RecommendationFeedback.create(data);
}

export async function getRecommendationFeedbackForStudent(studentId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const RecommendationFeedback = (await import('@/models/RecommendationFeedback')).default;
  return RecommendationFeedback.find({ student_id: studentId }).sort({ createdAt: -1 }).lean().exec();
}

// --- AI generation logs ---
export type CreateAIGenerationLogInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id?: mongoose.Types.ObjectId;
  topic_id?: mongoose.Types.ObjectId;
  session_id?: mongoose.Types.ObjectId;
  model_used: string;
  task_type?: string;
  tokens_used?: number;
  estimated_cost?: number;
  response_time_ms?: number;
};

export async function createAIGenerationLog(data: CreateAIGenerationLogInput) {
  await connectToDB();
  const AIGenerationLog = (await import('@/models/AIGenerationLog')).default;
  return AIGenerationLog.create(data);
}

export async function getAIGenerationLogsForStudent(
  studentId: string | mongoose.Types.ObjectId,
  options?: { modelUsed?: string; limit?: number }
) {
  await connectToDB();
  const AIGenerationLog = (await import('@/models/AIGenerationLog')).default;
  const query: Record<string, unknown> = { student_id: studentId };
  if (options?.modelUsed) query.model_used = options.modelUsed;
  let q = AIGenerationLog.find(query).sort({ createdAt: -1 });
  if (options?.limit) q = q.limit(options.limit);
  return q.lean().exec();
}

export async function getAIGenerationLogsByOrganization(
  organizationId: string | mongoose.Types.ObjectId,
  options?: { modelUsed?: string; limit?: number }
) {
  await connectToDB();
  const AIGenerationLog = (await import('@/models/AIGenerationLog')).default;
  const query: Record<string, unknown> = { organization_id: organizationId };
  if (options?.modelUsed) query.model_used = options.modelUsed;
  let q = AIGenerationLog.find(query).sort({ createdAt: -1 });
  if (options?.limit) q = q.limit(options.limit);
  return q.lean().exec();
}
