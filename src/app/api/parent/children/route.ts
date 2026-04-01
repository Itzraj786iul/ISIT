import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const ParentProfile = (await import('@/models/ParentProfile')).default;

    const user = await User.findById(auth.userId).select('role organization_id').lean() as { role?: string; organization_id?: unknown } | null;
    if (!user || user.role?.toLowerCase() !== 'parent') {
      return NextResponse.json({ message: 'Not a parent account' }, { status: 403 });
    }

    let profile = await ParentProfile.findOne({ user_id: auth.userId }).lean() as { children?: { _id: unknown; name: string; email: string; added_at: Date }[] } | null;
    if (!profile && user.organization_id) {
      const created = await ParentProfile.create({ user_id: auth.userId, organization_id: user.organization_id, children: [] });
      profile = created.toObject() as typeof profile;
    }

    const children = (profile?.children ?? []).map((c: { _id: unknown; name: string; email: string; added_at: Date }) => ({
      id: String(c._id),
      name: c.name,
      email: c.email,
      addedAt: c.added_at,
    }));

    return NextResponse.json({ children }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/parent/children]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const ParentProfile = (await import('@/models/ParentProfile')).default;

    const user = await User.findById(auth.userId).select('role organization_id').lean() as { role?: string; organization_id?: unknown } | null;
    if (!user || user.role?.toLowerCase() !== 'parent') {
      return NextResponse.json({ message: 'Not a parent account' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email } = body;
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    let profile = await ParentProfile.findOne({ user_id: auth.userId });
    if (!profile) {
      profile = await ParentProfile.create({
        user_id: auth.userId,
        organization_id: user.organization_id || new mongoose.Types.ObjectId(),
        children: [],
      });
    }

    profile.children.push({ name: name.trim(), email: email.trim().toLowerCase() });
    await profile.save();

    const newChild = profile.children[profile.children.length - 1];
    return NextResponse.json({
      child: {
        id: String(newChild._id),
        name: newChild.name,
        email: newChild.email,
        addedAt: newChild.added_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/parent/children]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const ParentProfile = (await import('@/models/ParentProfile')).default;

    const user = await User.findById(auth.userId).select('role').lean() as { role?: string } | null;
    if (!user || user.role?.toLowerCase() !== 'parent') {
      return NextResponse.json({ message: 'Not a parent account' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');
    if (!childId) return NextResponse.json({ message: 'childId is required' }, { status: 400 });

    await ParentProfile.updateOne(
      { user_id: auth.userId },
      { $pull: { children: { _id: new mongoose.Types.ObjectId(childId) } } }
    );

    return NextResponse.json({ message: 'Child removed' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/parent/children]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
