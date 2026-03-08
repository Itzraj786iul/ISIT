import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
    await mongoose.connect(process.env.MONGO_URI);
  }
};

type LessonInput = { title: string; content?: string; order: number; videoUrl?: string };

export async function POST(req: Request) {
  try {
    await connectToDB();

    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;

    const body = await req.json();
    const {
      title,
      description,
      price = 3999,
      category,
      teacherId,
      image,
      lessons = [],
    } = body as {
      title: string;
      description: string;
      price?: number;
      category: string;
      teacherId: string;
      image?: string;
      lessons?: LessonInput[];
    };

    if (!title || !description || !category || !teacherId) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, category, teacherId' },
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
