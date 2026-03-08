import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAuthFromRequest } from '@/lib/auth';

dotenv.config();

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
  }
};

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const user = await User.findById(auth.userId).select('name email role _id').lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
