/**
 * @legacy MARKETPLACE_LMS — List marketplace `Course` documents. AI catalog: GET /api/subjects.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

export async function GET(req: Request) {
  try {
    await connectToDB();

    const Course = (await import('@/models/Course')).default;
    await import('@/models/User'); // Required for populate('teacherId')

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');

    if (teacherId) {
      const { getAuthFromRequest } = await import('@/lib/auth');
      const auth = await getAuthFromRequest(req);
      if (!auth || auth.userId !== teacherId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const filter: Record<string, unknown> = teacherId ? { teacherId } : {};

    if (!teacherId) {
      const categories = searchParams.get('categories');
      if (categories) {
        const arr = categories
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (arr.length) filter.category = { $in: arr };
      }
      const maxPrice = searchParams.get('maxPrice');
      if (maxPrice != null && maxPrice !== '') {
        const n = Number(maxPrice);
        if (!Number.isNaN(n) && n >= 0) filter.price = { $lte: n };
      }
      const level = searchParams.get('level');
      if (level && ['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
        filter.level = level;
      }
    }

    const Lesson = (await import('@/models/Lesson')).default;
    const courses = await Course.find(filter).populate('teacherId', 'name').lean();
    const courseIds = courses.map((c) => c._id);
    const lessonAgg =
      courseIds.length === 0
        ? []
        : await Lesson.aggregate<{ _id: unknown; n: number }>([
            { $match: { courseId: { $in: courseIds } } },
            { $group: { _id: '$courseId', n: { $sum: 1 } } },
          ]);
    const countMap = new Map(lessonAgg.map((row) => [String(row._id), row.n]));

    const payload = courses.map((c) => ({
      ...c,
      lessonCount: countMap.get(String(c._id)) ?? 0,
    }));

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}