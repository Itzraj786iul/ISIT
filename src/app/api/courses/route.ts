import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    if (!MONGO_URI) throw new Error('MONGO_URI is missing');
    await mongoose.connect(MONGO_URI);
  }
};

export async function GET(req: Request) {
  try {
    await connectToDB();

    const Course = (await import('@/models/Course')).default;
    const User = (await import('@/models/User')).default;

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');

    const filter = teacherId ? { teacherId } : {};
    const courses = await Course.find(filter).populate('teacherId', 'name');
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}