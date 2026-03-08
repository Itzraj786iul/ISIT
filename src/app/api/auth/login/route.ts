import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { signToken, buildAuthCookie } from '@/lib/auth';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI!);
  }
};

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { email, password } = await req.json();

    const User = (await import('@/models/User')).default;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const userId = user._id.toString();
    const token = await signToken({
      userId,
      role: user.role || 'Student',
      email: user.email,
    });

    const cookie = buildAuthCookie(token);
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 200 });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error: unknown) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}