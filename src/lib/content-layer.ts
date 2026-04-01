import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

// --- Videos ---
export type CreateVideoInput = {
  organization_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  grade?: string;
  board?: string;
  status?: 'draft' | 'processing' | 'ready' | 'archived';
  uploaded_by_teacher_id?: mongoose.Types.ObjectId;
  embedding_vector?: number[];
};

export async function createVideo(data: CreateVideoInput) {
  await connectToDB();
  const Video = (await import('@/models/Video')).default;
  return Video.create({
    organization_id: data.organization_id,
    topic_id: data.topic_id,
    title: data.title,
    description: data.description ?? '',
    video_url: data.video_url,
    thumbnail_url: data.thumbnail_url,
    duration_seconds: data.duration_seconds ?? 0,
    grade: data.grade,
    board: data.board,
    status: data.status ?? 'draft',
    uploaded_by_teacher_id: data.uploaded_by_teacher_id,
    embedding_vector: data.embedding_vector,
  });
}

export async function getVideosForTopic(
  topicId: string | mongoose.Types.ObjectId,
  options?: { status?: string; organizationId?: string | mongoose.Types.ObjectId }
) {
  await connectToDB();
  const Video = (await import('@/models/Video')).default;
  const query = Video.find({ topic_id: topicId });
  if (options?.status) query.where('status').equals(options.status);
  if (options?.organizationId) query.where('organization_id').equals(options.organizationId);
  return query.lean().exec();
}

// --- Video subtitles ---
export type CreateVideoSubtitleInput = {
  organization_id: mongoose.Types.ObjectId;
  video_id: mongoose.Types.ObjectId;
  start_time: number;
  end_time: number;
  text: string;
  chunk_index: number;
  embedding_vector?: number[];
};

export async function createVideoSubtitle(data: CreateVideoSubtitleInput) {
  await connectToDB();
  const VideoSubtitle = (await import('@/models/VideoSubtitle')).default;
  return VideoSubtitle.create(data);
}

export async function getSubtitlesForVideo(videoId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const VideoSubtitle = (await import('@/models/VideoSubtitle')).default;
  return VideoSubtitle.find({ video_id: videoId }).sort({ chunk_index: 1 }).lean().exec();
}

// --- Topic notes ---
export type CreateTopicNoteInput = {
  organization_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  grade?: string;
  board?: string;
  note_type?: 'summary' | 'key_points' | 'detailed' | 'revision';
  content_markdown: string;
  embedding_vector?: number[];
  content_version?: string;
  approved?: boolean;
  usage_count?: number;
};

export async function createTopicNote(data: CreateTopicNoteInput) {
  await connectToDB();
  const TopicNote = (await import('@/models/TopicNote')).default;
  return TopicNote.create({
    organization_id: data.organization_id,
    topic_id: data.topic_id,
    grade: data.grade,
    board: data.board,
    note_type: data.note_type ?? 'summary',
    content_markdown: data.content_markdown,
    embedding_vector: data.embedding_vector,
    content_version: data.content_version ?? '1.0',
    approved: data.approved ?? false,
    usage_count: data.usage_count ?? 0,
  });
}

export async function getTopicNotesForTopic(
  topicId: string | mongoose.Types.ObjectId,
  options?: { approvedOnly?: boolean; noteType?: string }
) {
  await connectToDB();
  const TopicNote = (await import('@/models/TopicNote')).default;
  const query = TopicNote.find({ topic_id: topicId });
  if (options?.approvedOnly !== false) query.where('approved').equals(true);
  if (options?.noteType) query.where('note_type').equals(options.noteType);
  return query.lean().exec();
}

// --- Student notes ---
export type CreateStudentNoteInput = {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  base_note_id?: mongoose.Types.ObjectId;
  personalized_highlights?: unknown;
  embedding_vector?: number[];
};

export async function createStudentNote(data: CreateStudentNoteInput) {
  await connectToDB();
  const StudentNote = (await import('@/models/StudentNote')).default;
  return StudentNote.create(data);
}

export async function getStudentNotesForTopic(
  topicId: string | mongoose.Types.ObjectId,
  studentId: string | mongoose.Types.ObjectId
) {
  await connectToDB();
  const StudentNote = (await import('@/models/StudentNote')).default;
  return StudentNote.find({ topic_id: topicId, student_id: studentId }).lean().exec();
}

export async function getStudentNotesForStudent(studentId: string | mongoose.Types.ObjectId) {
  await connectToDB();
  const StudentNote = (await import('@/models/StudentNote')).default;
  return StudentNote.find({ student_id: studentId }).lean().exec();
}

// --- Topic question bank ---
export type CreateTopicQuestionInput = {
  organization_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  embedding_vector?: number[];
  approved?: boolean;
  usage_count?: number;
};

export async function createTopicQuestion(data: CreateTopicQuestionInput) {
  await connectToDB();
  const TopicQuestionBank = (await import('@/models/TopicQuestionBank')).default;
  return TopicQuestionBank.create({
    organization_id: data.organization_id,
    topic_id: data.topic_id,
    difficulty_level: data.difficulty_level ?? 'beginner',
    question_text: data.question_text,
    options: data.options ?? [],
    correct_answer: data.correct_answer,
    explanation: data.explanation ?? '',
    embedding_vector: data.embedding_vector,
    approved: data.approved ?? false,
    usage_count: data.usage_count ?? 0,
  });
}

export async function getQuestionsForTopic(
  topicId: string | mongoose.Types.ObjectId,
  options?: { approvedOnly?: boolean; difficulty_level?: string }
) {
  await connectToDB();
  const TopicQuestionBank = (await import('@/models/TopicQuestionBank')).default;
  const query = TopicQuestionBank.find({ topic_id: topicId });
  if (options?.approvedOnly !== false) query.where('approved').equals(true);
  if (options?.difficulty_level) query.where('difficulty_level').equals(options.difficulty_level);
  return query.lean().exec();
}

// --- Assignments ---
export type CreateAssignmentInput = {
  organization_id: mongoose.Types.ObjectId;
  topic_id: mongoose.Types.ObjectId;
  teacher_id: mongoose.Types.ObjectId;
  assignment_type?: 'homework' | 'project' | 'quiz' | 'essay' | 'other';
  description?: string;
  rubric?: unknown;
  embedding_vector?: number[];
  due_days?: number;
  approved?: boolean;
};

export async function createAssignment(data: CreateAssignmentInput) {
  await connectToDB();
  const Assignment = (await import('@/models/Assignment')).default;
  return Assignment.create({
    organization_id: data.organization_id,
    topic_id: data.topic_id,
    teacher_id: data.teacher_id,
    assignment_type: data.assignment_type ?? 'homework',
    description: data.description ?? '',
    rubric: data.rubric,
    embedding_vector: data.embedding_vector,
    due_days: data.due_days ?? 7,
    approved: data.approved ?? false,
  });
}

export async function getAssignmentsForTopic(
  topicId: string | mongoose.Types.ObjectId,
  options?: { approvedOnly?: boolean }
) {
  await connectToDB();
  const Assignment = (await import('@/models/Assignment')).default;
  const query = Assignment.find({ topic_id: topicId });
  if (options?.approvedOnly !== false) query.where('approved').equals(true);
  return query.lean().exec();
}
