import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { randomUrlToken } from '@/lib/tokens';
import { sendTransactionalEmail } from '@/lib/email';
import { absoluteSiteUrl } from '@/lib/site-url';
import { rateLimitOr429 } from '@/lib/rate-limit';
import { getSupportEmail } from '@/lib/support-email';
import { log } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const limited = rateLimitOr429(req, `resend-verify:${auth.userId}`, {
      windowMs: Number(process.env.RATE_LIMIT_RESEND_VERIFY_WINDOW_MS) || 3_600_000,
      max: Number(process.env.RATE_LIMIT_RESEND_VERIFY_MAX) || 5,
    });
    if (limited) return limited;

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (user.email_verified) {
      return NextResponse.json({ message: 'Email is already verified.' }, { status: 200 });
    }

    const token = randomUrlToken();
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      email_verify_token: token,
      email_verify_expires: expires,
    });

    const verifyUrl = absoluteSiteUrl(`/verify-email?token=${encodeURIComponent(token)}`);
    try {
      await sendTransactionalEmail({
        to: user.email,
        subject: 'Verify your ISIC email',
        text: `Hello,\n\nConfirm your email by opening:\n${verifyUrl}\n\n— ${getSupportEmail()}`,
      });
    } catch (e) {
      log.apiError('POST /api/auth/resend-verification email', e);
      return NextResponse.json({ message: 'Could not send email. Try again later.' }, { status: 503 });
    }

    return NextResponse.json({ message: 'Verification email sent.' }, { status: 200 });
  } catch (error: unknown) {
    log.apiError('POST /api/auth/resend-verification', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
