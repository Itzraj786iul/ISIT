import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { log } from '@/lib/logger';
import { resolveLearningModeForStudent } from '@/lib/learning-mode';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const baseSelect = 'name email role _id organization_id email_verified';
    const roleLower = (auth.role || '').toLowerCase();
    const userDoc =
      roleLower === 'teacher'
        ? await User.findById(auth.userId)
            .select(`${baseSelect} assigned_classes assigned_subjects`)
            .populate([
              { path: 'assigned_classes', select: 'name' },
              { path: 'assigned_subjects', select: 'name' },
            ])
            .lean()
        : roleLower === 'student'
          ? await User.findById(auth.userId).select(`${baseSelect} class_id`).lean()
          : await User.findById(auth.userId).select(baseSelect).lean();

    if (!userDoc) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }
    const user = userDoc as unknown as {
      _id: unknown;
      name: string;
      email: string;
      role: string;
      organization_id?: unknown;
      assigned_classes?: unknown;
      assigned_subjects?: unknown;
      class_id?: unknown;
    };

    const payload: Record<string, unknown> = {
      _id: user._id?.toString?.() ?? String(user._id),
      name: user.name ?? '',
      email: user.email,
      role: user.role,
      organization_id: user.organization_id?.toString?.() ?? (user.organization_id != null ? String(user.organization_id) : undefined),
      email_verified: Boolean((user as { email_verified?: boolean }).email_verified),
    };
    if ((user.role || '').toLowerCase() === 'teacher') {
      payload.assigned_classes = user.assigned_classes ?? [];
      payload.assigned_subjects = user.assigned_subjects ?? [];
    }
    if ((user.role || '').toLowerCase() === 'student') {
      const orgStr =
        user.organization_id?.toString?.() ?? (user.organization_id != null ? String(user.organization_id) : '');
      const classStr =
        user.class_id?.toString?.() ?? (user.class_id != null ? String(user.class_id) : undefined);
      if (classStr) payload.class_id = classStr;
      if (orgStr) {
        try {
          payload.learning_mode = await resolveLearningModeForStudent(
            auth.userId,
            orgStr,
            classStr ?? null
          );
        } catch {
          payload.learning_mode = 'free_learning';
        }
      } else {
        payload.learning_mode = 'free_learning';
      }
    }

    return NextResponse.json({ user: payload }, { status: 200 });
  } catch (error) {
    log.apiError('GET /api/auth/me', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
