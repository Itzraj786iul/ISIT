import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { signToken, buildAuthCookie, resolveJwtMaxAgeSeconds } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { normalizeEmail, parsePassword, parseRememberMe } from '@/lib/validation';
import { log } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    await connectToDB();

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const password = parsePassword(body?.password);
    const rememberMe = parseRememberMe(body?.rememberMe);

    if (!email || !password) {
      return NextResponse.json({ message: 'Valid email and password required' }, { status: 400 });
    }

    const User = (await import('@/models/User')).default;

    const user = await User.findOne({ email: email });
    const isDev = process.env.NODE_ENV !== 'production';
    if (!user) {
      if (isDev) console.log('[Login] No user found for email:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    if (typeof user.password_hash !== 'string' || user.password_hash.length === 0) {
      if (isDev) console.log('[Login] User found but password_hash is missing/empty for:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      if (isDev) console.log('[Login] Password mismatch for:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    await User.findByIdAndUpdate(user._id, { last_login: new Date() });

    const userId = user._id.toString();
    const maxAge = resolveJwtMaxAgeSeconds(rememberMe);
    const token = await signToken(
      {
        userId,
        role: user.role || 'Student',
        email: user.email,
      },
      maxAge
    );

    const cookie = buildAuthCookie(token, maxAge);
    const response = NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          _id: userId,
          name: user.name ?? '',
          email: user.email,
          role: user.role,
          organization_id: user.organization_id?.toString?.() ?? user.organization_id,
        },
      },
      { status: 200 }
    );
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error: unknown) {
    log.apiError('POST /api/auth/login', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
