import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI!);
  }
};

export async function POST(req: Request) {
  try {
    // 1. Connect to DB
    await connectToDB();
    
    const { email, password } = await req.json();

    // 2. Dynamic Import (Ensures User model is loaded correctly)
    const User = (await import('@/models/User')).default;

    // 3. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    // 4. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 5. Return Success + User Data (for frontend localStorage)
    return NextResponse.json({ 
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}