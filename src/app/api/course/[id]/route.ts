/**
 * @legacy MARKETPLACE_LMS — Read/update/delete paid course + lessons.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';

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
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role.toLowerCase() !== 'teacher') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectToDB();

    const Course = (await import('@/models/Course')).default;
    const Lesson = (await import('@/models/Lesson')).default;

    const { id } = await params;
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    if (course.teacherId?.toString() !== auth.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Lesson.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Course deleted' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role.toLowerCase() !== 'teacher') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectToDB();
    const Course = (await import('@/models/Course')).default;
    const { id } = await params;
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    if (course.teacherId?.toString() !== auth.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, category, image } = body;
    const update: Record<string, unknown> = {};
    if (typeof title === 'string' && title.trim()) update.title = title.trim();
    if (typeof description === 'string') update.description = description;
    if (typeof price === 'number') update.price = price;
    if (typeof price === 'string' && price !== '') update.price = Number(price);
    if (typeof category === 'string' && category.trim()) update.category = category.trim();
    if (typeof image === 'string') update.image = image;

    const updated = await Course.findByIdAndUpdate(id, { $set: update }, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating course:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}