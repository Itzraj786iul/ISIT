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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const user = await User.findById(userId).select('completedLessons').lean() as { completedLessons?: unknown[] } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const completedLessonIds = (user.completedLessons ?? []).map((id) => String(id));
    return NextResponse.json({ completedLessonIds });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
