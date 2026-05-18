import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAdminOrganization, requireTeacherOrganization } from '@/lib/teacher-org';
import { normalizeEmail, parsePassword } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const list = await User.find({
      organization_id: gate.organizationId,
      role: 'Student',
    })
      .select('email name class_id status email_verified createdAt')
      .populate({ path: 'class_id', select: 'name' })
      .sort({ name: 1, email: 1 })
      .lean()
      .exec();

    return successResponse(list, 200);
  } catch (e) {
    console.error('[GET /api/students]', e);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdminOrganization(req);
    if (!gate.ok) return gate.response;

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const classId =
      typeof body?.class_id === 'string'
        ? body.class_id.trim()
        : typeof body?.classId === 'string'
          ? body.classId.trim()
          : '';
    const grade = typeof body?.grade === 'string' ? body.grade.trim() : '';
    const password = body?.password ? parsePassword(body.password) : null;

    if (!email) return errorResponse('Valid email is required', 400);
    if (!name) return errorResponse('Student name is required', 400);

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const StudentProfile = (await import('@/models/StudentProfile')).default;
    const ClassModel = (await import('@/models/Class')).default;
    const orgOid = new mongoose.Types.ObjectId(gate.organizationId);

    if (await User.findOne({ email })) {
      return errorResponse('A user with this email already exists', 409);
    }

    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return errorResponse('Invalid class_id', 400);
      }
      const cls = await ClassModel.findOne({ _id: classId, organization_id: orgOid }).lean();
      if (!cls) return errorResponse('Class not found in your organization', 400);
    }

    const tempPassword = password || `Isic${Math.random().toString(36).slice(2, 10)}!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      organization_id: orgOid,
      email,
      password_hash: hashedPassword,
      role: 'Student',
      status: 'active',
      email_verified: false,
      name,
      class_id: classId ? new mongoose.Types.ObjectId(classId) : null,
    });

    await StudentProfile.create({
      organization_id: orgOid,
      user_id: newUser._id,
      grade: grade || undefined,
    });

    const created = await User.findById(newUser._id)
      .select('email name class_id status email_verified')
      .populate({ path: 'class_id', select: 'name' })
      .lean();

    return successResponse(
      {
        user: created,
        temporaryPassword: password ? undefined : tempPassword,
      },
      201
    );
  } catch (e) {
    console.error('[POST /api/students]', e);
    return errorResponse('Internal Server Error', 500);
  }
}
