import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.userId;

    await connectToDB();
    const StudentProfile = (await import('@/models/StudentProfile')).default;

    const profile = await StudentProfile.findOne({ user_id: userId }).select('completedLessons').lean() as { completedLessons?: unknown[] } | null;
    const completedLessonIds = (profile?.completedLessons ?? []).map((id) => String(id));
    return NextResponse.json({ completedLessonIds });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
