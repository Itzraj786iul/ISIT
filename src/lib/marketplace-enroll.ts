/**
 * @legacy MARKETPLACE_LMS — shared enrollment used by mock checkout and Razorpay verify.
 */
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

export async function completeCourseEnrollment(userId: string, courseId: string): Promise<{
  firstLessonId: string | null;
  alreadyEnrolled: boolean;
}> {
  await connectToDB();
  const Course = (await import('@/models/Course')).default;
  const Lesson = (await import('@/models/Lesson')).default;

  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw new Error('Course not found');
  }

  const lessons = await Lesson.find({ courseId }).sort({ order: 1 }).lean();
  const firstLesson = lessons[0];
  const firstLessonId = firstLesson?._id?.toString() ?? null;

  const enrolled = (course as { enrolledStudents?: unknown[] }).enrolledStudents ?? [];
  const alreadyEnrolled = enrolled.some((id: unknown) => id?.toString() === userId);
  if (alreadyEnrolled) {
    return { firstLessonId, alreadyEnrolled: true };
  }

  await Course.findByIdAndUpdate(courseId, {
    $addToSet: { enrolledStudents: new mongoose.Types.ObjectId(userId) },
  });

  return { firstLessonId, alreadyEnrolled: false };
}
