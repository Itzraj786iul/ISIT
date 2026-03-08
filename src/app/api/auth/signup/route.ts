import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
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

    const body = await req.json();
    const { name, email, password, role, grade, extra } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student',
      grade,
      extra,
    });

    const userId = newUser._id.toString();
    const token = await signToken({
      userId,
      role: newUser.role || 'Student',
      email: newUser.email,
    });

    const cookie = buildAuthCookie(token);
    const response = NextResponse.json({
      message: 'User created successfully',
      user: {
        _id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    }, { status: 201 });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error: unknown) {
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}