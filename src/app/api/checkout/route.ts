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

export async function POST(request: Request) {
  try {
    const { getAuthFromRequest } = await import('@/lib/auth');
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Please sign in to enroll.' }, { status: 401 });
    }
    const userId = auth.userId;

    const body = await request.json();
    const { courseId, fullName, email } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing courseId.' },
        { status: 400 }
      );
    }
    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Missing billing information (fullName, email)' },
        { status: 400 }
      );
    }

    await connectToDB();

    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const alreadyEnrolled = course.enrolledStudents?.some(
      (id: unknown) => id?.toString() === userId
    );
    if (alreadyEnrolled) {
      const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
      const firstLesson = lessons[0];
      return NextResponse.json({
        success: true,
        message: 'Already enrolled in this course.',
        alreadyEnrolled: true,
        orderId: null,
        firstLessonId: firstLesson?._id?.toString() ?? null,
      }, { status: 200 });
    }

    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
    const firstLesson = lessons[0];

    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: new mongoose.Types.ObjectId(userId) },
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      orderId: `ORD-${Date.now()}`,
      firstLessonId: firstLesson?._id?.toString() ?? null,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
