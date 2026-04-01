import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/db';

/**
 * Dev-only endpoint to set password for users missing password_hash (e.g. from seeds).
 * Only available when NODE_ENV=development.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ message: 'Not available' }, { status: 404 });
  }

  try {
    await connectToDB();

    const { email, password } = await req.json();
    if (!email || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { message: 'email and password (min 6 chars) required' },
        { status: 400 }
      );
    }

    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password_hash });

    return NextResponse.json({ message: 'Password set successfully' }, { status: 200 });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
