import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { log } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const userDoc = await User.findById(auth.userId).select('name email role _id organization_id').lean();
    if (!userDoc) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }
    const user = userDoc as unknown as { _id: unknown; name: string; email: string; role: string; organization_id?: unknown };

    return NextResponse.json({
      user: {
        _id: user._id?.toString?.() ?? String(user._id),
        name: user.name ?? '',
        email: user.email,
        role: user.role,
        organization_id: user.organization_id?.toString?.() ?? (user.organization_id != null ? String(user.organization_id) : undefined),
      },
    }, { status: 200 });
  } catch (error) {
    log.apiError('GET /api/auth/me', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
