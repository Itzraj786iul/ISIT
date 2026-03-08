import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAuthFromRequest } from '@/lib/auth';

dotenv.config();

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
    await mongoose.connect(process.env.MONGO_URI);
  }
};

async function ensureTeacherOwnsLesson(req: Request, lessonId: string) {
  const auth = await getAuthFromRequest(req);
  if (!auth || auth.role.toLowerCase() !== 'teacher') return null;
  await connectToDB();
  const Lesson = (await import('@/models/Lesson')).default;
  const Course = (await import('@/models/Course')).default;
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return null;
  const course = await Course.findById(lesson.courseId);
  if (!course || course.teacherId?.toString() !== auth.userId) return null;
  return { lesson, auth };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDB();
    const { id } = await params;
    const Lesson = (await import('@/models/Lesson')).default;
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json(lesson, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await ensureTeacherOwnsLesson(req, id);
    if (!result) {
      return NextResponse.json({ message: 'Forbidden or not found' }, { status: 403 });
    }
    const Lesson = (await import('@/models/Lesson')).default;
    const body = await req.json();
    const { title, content, order, videoUrl } = body;
    const update: Record<string, unknown> = {};
    if (typeof title === 'string' && title.trim()) update.title = title.trim();
    if (typeof content === 'string') update.content = content;
    if (typeof order === 'number') update.order = order;
    if (videoUrl !== undefined) update.videoUrl = videoUrl === '' ? undefined : videoUrl;
    const updated = await Lesson.findByIdAndUpdate(id, { $set: update }, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await ensureTeacherOwnsLesson(req, id);
    if (!result) {
      return NextResponse.json({ message: 'Forbidden or not found' }, { status: 403 });
    }
    const Lesson = (await import('@/models/Lesson')).default;
    await Lesson.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Lesson deleted' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}