import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

export type GetSubjectsOptions = {
  grade?: string;
  board?: string;
};

/**
 * Get subjects for an organization. Optionally filter by grade and/or board.
 */
export async function getSubjectsForOrganization(
  organizationId: string | mongoose.Types.ObjectId,
  options: GetSubjectsOptions = {}
) {
  await connectToDB();
  const Subject = (await import('@/models/Subject')).default;
  const query: Record<string, unknown> = { organization_id: organizationId };
  if (options.grade != null && options.grade !== '') query.grade = options.grade;
  if (options.board != null && options.board !== '') query.board = options.board;
  return Subject.find(query).sort({ name: 1 }).lean().exec();
}

/**
 * Get all published/active subjects across all organizations (for public listing).
 */
export async function getAllPublishedSubjects(options: GetSubjectsOptions = {}) {
  await connectToDB();
  const Subject = (await import('@/models/Subject')).default;
  const query: Record<string, unknown> = { is_active: true };
  if (options.grade != null && options.grade !== '') query.grade = options.grade;
  if (options.board != null && options.board !== '') query.board = options.board;
  return Subject.find(query).sort({ name: 1 }).lean().exec();
}

/**
 * Get a single subject by id. Returns null if not found.
 */
export async function getSubjectById(id: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const Subject = (await import('@/models/Subject')).default;
  const doc = await Subject.findById(id).lean().exec();
  return doc;
}

export type GetTopicsOptions = {
  organizationId?: string | mongoose.Types.ObjectId;
  activeOnly?: boolean;
};

/**
 * Get topics for a subject. Optionally filter by organization_id.
 */
export async function getTopicsForSubject(
  subjectId: string | mongoose.Types.ObjectId,
  options: GetTopicsOptions = {}
) {
  await connectToDB();
  const Topic = (await import('@/models/Topic')).default;
  const query: Record<string, unknown> = { subject_id: subjectId };
  if (options.organizationId != null) query.organization_id = options.organizationId;
  if (options.activeOnly !== false) query.is_active = true;
  return Topic.find(query).sort({ topic_order: 1 }).lean().exec();
}

/**
 * Get a single topic by id. Returns null if not found.
 */
export async function getTopicById(id: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const Topic = (await import('@/models/Topic')).default;
  const doc = await Topic.findById(id).lean().exec();
  return doc;
}
