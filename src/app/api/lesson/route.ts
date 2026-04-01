/**
 * @legacy MARKETPLACE_LMS — Create `Lesson` under a `Course`.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role.toLowerCase() !== 'teacher') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectToDB();
    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;

    const body = await req.json();
    const { courseId, title, content, order, videoUrl } = body;
    if (!courseId || !title || typeof order !== 'number') {
      return NextResponse.json(
        { message: 'Missing required fields: courseId, title, order' },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    if (course.teacherId?.toString() !== auth.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const lesson = await Lesson.create({
      title: title.trim(),
      content: typeof content === 'string' && content.trim() ? content.trim() : 'Content for this lesson.',
      courseId,
      order,
      ...(videoUrl && { videoUrl }),
    });
    return NextResponse.json(lesson, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
