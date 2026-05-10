/**
 * @legacy MARKETPLACE_LMS — Mock checkout; pushes student onto `Course.enrolledStudents`.
 * Use Razorpay when configured (see /api/checkout/razorpay-order + razorpay-verify).
 */
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

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
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
    const firstLesson = lessons[0];
    const firstLessonId = firstLesson?._id?.toString() ?? null;

    if (alreadyEnrolled) {
      return NextResponse.json({
        success: true,
        message: 'Already enrolled in this course.',
        alreadyEnrolled: true,
        orderId: null,
        firstLessonId,
      }, { status: 200 });
    }

    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: new mongoose.Types.ObjectId(userId) },
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      alreadyEnrolled: false,
      orderId: `ORD-${Date.now()}`,
      firstLessonId,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
