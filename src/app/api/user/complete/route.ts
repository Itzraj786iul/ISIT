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

export async function POST(req: Request) {
  try {
    await connectToDB();
    
    const { userId, lessonId } = await req.json();
    
    if (!userId || !lessonId) {
      return NextResponse.json({ message: 'Missing data' }, { status: 400 });
    }

    const User = (await import('@/models/User')).default;
    const Lesson = (await import('@/models/Lesson')).default;

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    // Add lesson to user's completed list (avoid duplicates)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { completedLessons: lessonId }
    });

    return NextResponse.json({ message: 'Progress saved!' }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving progress:", error);
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}