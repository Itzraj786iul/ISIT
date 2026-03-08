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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDB();
    const { id } = await params;

    const Lesson = (await import('@/models/Lesson')).default;
    
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(lesson, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}