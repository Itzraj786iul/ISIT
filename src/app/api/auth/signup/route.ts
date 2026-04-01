import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { signToken, buildAuthCookie, resolveJwtMaxAgeSeconds } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { normalizeEmail, parsePassword, parseRememberMe } from '@/lib/validation';
import { log } from '@/lib/logger';

function normalizeRole(role: string): 'Student' | 'Teacher' | 'Parent' {
  const r = (role || 'Student').toString().trim();
  const lower = r.toLowerCase();
  if (lower === 'teacher') return 'Teacher';
  if (lower === 'parent') return 'Parent';
  return 'Student';
}

export async function POST(req: Request) {
  try {
    await connectToDB();

    const User = (await import('@/models/User')).default;
    const Organization = (await import('@/models/Organization')).default;
    const Teacher = (await import('@/models/Teacher')).default;
    const StudentProfile = (await import('@/models/StudentProfile')).default;
    const ParentProfile = (await import('@/models/ParentProfile')).default;

    const body = await req.json();
    const { name, role, grade, extra } = body;
    const email = normalizeEmail(body?.email);
    const password = parsePassword(body?.password);
    const rememberMe = parseRememberMe(body?.rememberMe);

    if (!email || !password) {
      return NextResponse.json({ message: 'Valid email and password required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
    }

    let organizationId: mongoose.Types.ObjectId;
    const existingOrg = await Organization.findOne().lean();
    if (existingOrg) {
      organizationId = (existingOrg as { _id: mongoose.Types.ObjectId })._id;
    } else {
      const created = await Organization.create({ name: 'Default Organization' });
      organizationId = created._id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleValue = normalizeRole(role || 'Student');

    const newUser = await User.create({
      organization_id: organizationId,
      email: email,
      password_hash: hashedPassword,
      role: roleValue,
      status: 'active',
      email_verified: false,
      name: name ?? '',
    });

    const userId = newUser._id.toString();

    if (roleValue === 'Teacher') {
      await Teacher.create({
        organization_id: organizationId,
        user_id: newUser._id,
      });
    } else if (roleValue === 'Student') {
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
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        token,
        user: {
          _id: userId,
          name: newUser.name || name || '',
          email: newUser.email,
          role: newUser.role,
          organization_id: organizationId.toString(),
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
