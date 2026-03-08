import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Helper function to connect to DB (handles repeated connections)
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

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student', // Default to Student
      grade, // For students
      extra, // For extra fields like 'childName', 'subject', etc.
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}