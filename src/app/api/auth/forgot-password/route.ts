import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { normalizeEmail } from '@/lib/validation';
import { randomUrlToken } from '@/lib/tokens';
import { sendTransactionalEmail } from '@/lib/email';
import { absoluteSiteUrl } from '@/lib/site-url';
import { log } from '@/lib/logger';
import { getSupportEmail } from '@/lib/support-email';

export async function POST(req: Request) {
  const generic =
    'If an account exists for that email, we sent password reset instructions.';
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    if (!email) {
      return NextResponse.json({ message: generic }, { status: 200 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: generic }, { status: 200 });
    }

    const token = randomUrlToken(24);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      password_reset_token: token,
      password_reset_expires: expires,
    });

    const resetUrl = absoluteSiteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
    try {
      await sendTransactionalEmail({
        to: email,
        subject: 'Reset your ISIC password',
        text: `Hello,\n\nReset your password by opening this link (valid 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.\n\n— ${getSupportEmail()}`,
      });
    } catch (e) {
      log.apiError('POST /api/auth/forgot-password email', e);
    }

    return NextResponse.json({ message: generic }, { status: 200 });
  } catch (error: unknown) {
    log.apiError('POST /api/auth/forgot-password', error);
    return NextResponse.json({ message: generic }, { status: 200 });
  }
}
