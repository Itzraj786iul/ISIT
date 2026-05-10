import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/db';
import { parsePassword } from '@/lib/validation';
import { log } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token =
      typeof body?.token === 'string' ? body.token.trim() : '';
    const password = parsePassword(body?.password);
    if (!token || !password) {
      return NextResponse.json({ message: 'Invalid token or password.' }, { status: 400 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const user = await User.findOne({
      password_reset_token: token,
      password_reset_expires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Reset link is invalid or expired.' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, {
      password_hash,
      password_reset_token: null,
      password_reset_expires: null,
    });

    return NextResponse.json({ message: 'Password updated. You can sign in now.' }, { status: 200 });
  } catch (error: unknown) {
    log.apiError('POST /api/auth/reset-password', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
