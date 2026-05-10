import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { log } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ message: 'Verification token required.' }, { status: 400 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const user = await User.findOne({
      email_verify_token: token,
      email_verify_expires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Link is invalid or expired.' }, { status: 400 });
    }

    await User.findByIdAndUpdate(user._id, {
      email_verified: true,
      email_verify_token: null,
      email_verify_expires: null,
    });

    return NextResponse.json({ message: 'Email verified successfully.' }, { status: 200 });
  } catch (error: unknown) {
    log.apiError('POST /api/auth/verify-email', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
