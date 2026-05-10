import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { signToken, buildAuthCookie, resolveJwtMaxAgeSeconds } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { normalizeEmail, normalizeInviteCode, parsePassword, parseRememberMe } from '@/lib/validation';
import { log } from '@/lib/logger';
import { randomUrlToken } from '@/lib/tokens';
import { sendTransactionalEmail } from '@/lib/email';
import { absoluteSiteUrl } from '@/lib/site-url';
import { getSupportEmail } from '@/lib/support-email';

/** Public signup: Student or Parent only. Teachers are created by admins via POST /api/teachers. */
function normalizeRole(role: string): 'Student' | 'Parent' {
  const lower = (role || 'Student').toString().trim().toLowerCase();
  if (lower === 'parent') return 'Parent';
  return 'Student';
}

export async function POST(req: Request) {
  try {
    await connectToDB();

    const User = (await import('@/models/User')).default;
    const Organization = (await import('@/models/Organization')).default;
    const StudentProfile = (await import('@/models/StudentProfile')).default;
    const ParentProfile = (await import('@/models/ParentProfile')).default;

    const body = await req.json();
    const { name, role, grade, extra } = body;
    const email = normalizeEmail(body?.email);
    const password = parsePassword(body?.password);
    const rememberMe = parseRememberMe(body?.rememberMe);
    const inviteCode = normalizeInviteCode(body?.invite_code);

    if (!email || !password) {
      return NextResponse.json({ message: 'Valid email and password required' }, { status: 400 });
    }

    const rawRole = (role ?? 'Student').toString().trim().toLowerCase();
    if (rawRole === 'teacher') {
      return NextResponse.json({ message: 'Teachers must be created by an administrator' }, { status: 403 });
    }
    if (rawRole !== '' && rawRole !== 'student' && rawRole !== 'parent') {
      return NextResponse.json({ message: 'Signup is only available for students and parents' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
    }

    let organizationId: mongoose.Types.ObjectId;
    if (inviteCode) {
      const orgByCode = await Organization.findOne({ invite_code: inviteCode });
      if (!orgByCode) {
        return NextResponse.json({ message: 'Invalid school invite code' }, { status: 400 });
      }
      organizationId = orgByCode._id;
    } else {
      const existingOrg = await Organization.findOne().sort({ createdAt: 1 }).lean();
      if (existingOrg) {
        organizationId = (existingOrg as { _id: mongoose.Types.ObjectId })._id;
      } else {
        const created = await Organization.create({ name: 'Default Organization' });
        organizationId = created._id;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleValue = normalizeRole(rawRole || 'student');

    const emailVerifyToken = randomUrlToken();
    const emailVerifyExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const newUser = await User.create({
      organization_id: organizationId,
      email: email,
      password_hash: hashedPassword,
      role: roleValue,
      status: 'active',
      email_verified: false,
      name: name ?? '',
      email_verify_token: emailVerifyToken,
      email_verify_expires: emailVerifyExpires,
    });

    const userId = newUser._id.toString();

    if (roleValue === 'Student') {
      await StudentProfile.create({
        organization_id: organizationId,
        user_id: newUser._id,
        grade: grade ?? undefined,
        board: (extra as { board?: string })?.board,
        learning_preferences: (extra as { learning_preferences?: unknown })?.learning_preferences,
        completedLessons: [],
      });
    } else {
      await ParentProfile.create({
        organization_id: organizationId,
        user_id: newUser._id,
      });
    }

    const maxAge = resolveJwtMaxAgeSeconds(rememberMe);
    const token = await signToken(
      {
        userId,
        role: roleValue,
        email: newUser.email,
      },
      maxAge
    );

    const cookie = buildAuthCookie(token, maxAge);

    const verifyUrl = absoluteSiteUrl(`/verify-email?token=${encodeURIComponent(emailVerifyToken)}`);
    try {
      await sendTransactionalEmail({
        to: email,
        subject: 'Verify your ISIC email',
        text: `Hello,\n\nThanks for signing up. Confirm your email:\n${verifyUrl}\n\nThis link expires in 48 hours.\n\n— ${getSupportEmail()}`,
      });
    } catch (e) {
      log.apiError('POST /api/auth/signup verification email', e);
    }

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        token,
        verificationEmailSent: true,
        user: {
          _id: userId,
          name: newUser.name || name || '',
          email: newUser.email,
          role: newUser.role,
          organization_id: organizationId.toString(),
          email_verified: false,
        },
      },
      { status: 201 }
    );
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error: unknown) {
    log.apiError('POST /api/auth/signup', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
