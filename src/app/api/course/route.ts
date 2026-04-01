import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';

type LessonInput = { title: string; content?: string; order: number; videoUrl?: string };

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (auth.role.toLowerCase() !== 'teacher') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectToDB();

    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;

    const body = await req.json();
    const {
      title,
      description,
      price = 3999,
      category,
      image,
      lessons = [],
    } = body as {
      title: string;
      description: string;
      price?: number;
      category: string;
      image?: string;
      lessons?: LessonInput[];
    };

    const teacherId = auth.userId;

    if (!title || !description || !category) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, category' },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title,
      description,
      price: Number(price) || 0,
      category,
      teacherId,
      enrolledStudents: [],
      ...(image && { image }),
    });

    const lessonDocs = (lessons as LessonInput[])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((l, i) => ({
        title: l.title || `Lesson ${i + 1}`,
        content: l.content || 'Content for this lesson.',
        courseId: course._id,
        order: l.order ?? i,
        ...(l.videoUrl && { videoUrl: l.videoUrl }),
      }));

    if (lessonDocs.length > 0) {
      await Lesson.insertMany(lessonDocs);
    }

    return NextResponse.json({ course, message: 'Course created' }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
