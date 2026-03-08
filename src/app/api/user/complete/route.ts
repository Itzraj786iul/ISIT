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

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.userId;

    const body = await req.json();
    const { lessonId } = body;
    if (!lessonId) {
      return NextResponse.json({ message: 'Missing lessonId' }, { status: 400 });
    }

    await connectToDB();

    const User = (await import('@/models/User')).default;
    const Lesson = (await import('@/models/Lesson')).default;
    const Course = (await import('@/models/Course')).default;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const isEnrolled = course.enrolledStudents?.some(
      (id: unknown) => id?.toString() === userId
    );
    if (!isEnrolled) {
      return NextResponse.json(
        { message: 'You must be enrolled in this course to mark lessons complete' },
        { status: 403 }
      );
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { completedLessons: lessonId },
    });

    return NextResponse.json({ message: 'Progress saved!' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}