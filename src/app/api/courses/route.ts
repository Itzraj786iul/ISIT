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

export async function GET() {
  try {
    // 1. Connect to DB first
    await connectToDB();

    // 2. Dynamic Imports (Fixes Schema registration error)
    // This ensures User and Course are loaded AFTER connection
    const Course = (await import('@/models/Course')).default;
    const User = (await import('@/models/User')).default;

    // 3. Fetch all courses (Populate 'teacherId' requires User model to be known)
    const courses = await Course.find().populate('teacherId', 'name');
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}