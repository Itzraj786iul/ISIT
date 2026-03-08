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
    const body = await request.json();

    // Required: courseId, userId (for enrollment), and billing
    const { courseId, userId, fullName, email } = body;

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'Missing courseId or userId. Please sign in to enroll.' },
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

    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
    const firstLesson = lessons[0];

    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Enroll user (add to enrolledStudents if not already)
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
