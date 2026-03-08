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

// params is a Promise in Next.js 16
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Connect
    await connectToDB();

    // 2. Dynamic Imports (ALL models must be imported before use)
    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;
    const User = (await import('@/models/User')).default; // <--- ADDED THIS

    // 3. AWAIT PARAMS
    const { id } = await params;

    // 4. Fetch Course (Populate needs User model)
    const course = await Course.findById(id).populate('teacherId', 'name');

    // 5. Fetch Lessons
    const lessons = await Lesson.find({ courseId: id }).sort({ order: 1 });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course, lessons }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDB();

    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;

    const { id } = await params;

    await Lesson.deleteMany({ courseId: id });
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Course deleted' }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}