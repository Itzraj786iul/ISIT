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

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.userId;

    await connectToDB();
    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;
    const User = (await import('@/models/User')).default;

    const user = await User.findById(userId).select('completedLessons').lean() as { completedLessons?: unknown[] } | null;
    const completedLessonIds = new Set((user?.completedLessons ?? []).map(String));

    const courses = await Course.find({
      enrolledStudents: new mongoose.Types.ObjectId(userId),
    })
      .populate('teacherId', 'name')
      .lean();

    const lessonsByCourse = await Lesson.find({
      courseId: { $in: courses.map((c: { _id: unknown }) => c._id) },
    })
      .sort({ order: 1 })
      .lean();

    const lessonListByCourse = new Map<string, { _id: string; title: string; order: number }[]>();
    for (const l of lessonsByCourse as unknown as { _id: unknown; courseId: unknown; title: string; order: number }[]) {
      const cid = String(l.courseId);
      if (!lessonListByCourse.has(cid)) lessonListByCourse.set(cid, []);
      lessonListByCourse.get(cid)!.push({ _id: String(l._id), title: l.title, order: l.order });
    }

    type CourseLean = { _id: unknown; title: string; description?: string; teacherId?: { name?: string }; image?: string };
    const result = (courses as unknown as CourseLean[]).map((course) => {
      const cid = String(course._id);
      const lessons = lessonListByCourse.get(cid) ?? [];
      const lessonCount = lessons.length;
      const completedCount = lessons.filter((l) => completedLessonIds.has(l._id)).length;
      const progressPercent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
      const nextLesson = lessons.find((l) => !completedLessonIds.has(l._id));

      return {
        course: {
          _id: cid,
          title: course.title,
          description: course.description,
          teacherId: course.teacherId,
          image: course.image,
        },
        lessonCount,
        completedCount,
        progressPercent,
        nextLessonId: nextLesson?._id ?? null,
        nextLessonTitle: nextLesson?.title ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Enrolled courses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
