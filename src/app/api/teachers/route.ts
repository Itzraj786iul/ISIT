import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireTeacherOrganization } from '@/lib/teacher-org';
import { normalizeEmail, parsePassword } from '@/lib/validation';

function parseObjectIdArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === 'string' && mongoose.Types.ObjectId.isValid(x)) out.push(x);
  }
  return [...new Set(out)];
}

export async function GET(req: Request) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    await connectToDB();
    const User = (await import('@/models/User')).default;

    const list = await User.find({
      organization_id: gate.organizationId,
      role: 'Teacher',
    })
      .select('email name assigned_classes assigned_subjects')
      .populate([{ path: 'assigned_classes', select: 'name' }, { path: 'assigned_subjects', select: 'name' }])
      .sort({ email: 1 })
      .lean()
      .exec();

    return successResponse(list, 200);
  } catch (e) {
    console.error('[GET /api/teachers]', e);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const password = parsePassword(body?.password);
    if (!email || !password) {
      return errorResponse('Valid email and password required', 400);
    }

    const classIds = parseObjectIdArray(body?.class_ids);
    const subjectIds = parseObjectIdArray(body?.subject_ids);
    const orgOid = new mongoose.Types.ObjectId(gate.organizationId);

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const ClassModel = (await import('@/models/Class')).default;
    const Subject = (await import('@/models/Subject')).default;
    const Teacher = (await import('@/models/Teacher')).default;

    if (await User.findOne({ email })) {
      return errorResponse('A user with this email already exists', 409);
    }

    if (classIds.length > 0) {
      const n = await ClassModel.countDocuments({
        _id: { $in: classIds.map((id) => new mongoose.Types.ObjectId(id)) },
        organization_id: orgOid,
      });
      if (n !== classIds.length) {
        return errorResponse('One or more classes are invalid or not in your organization', 400);
      }
    }

    if (subjectIds.length > 0) {
      const n = await Subject.countDocuments({
        _id: { $in: subjectIds.map((id) => new mongoose.Types.ObjectId(id)) },
        organization_id: orgOid,
      });
      if (n !== subjectIds.length) {
        return errorResponse('One or more subjects are invalid or not in your organization', 400);
      }
    }

    const displayName =
      typeof body?.name === 'string' && body.name.trim()
        ? body.name.trim()
        : email.split('@')[0] || 'Teacher';

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedClasses = classIds.map((id) => new mongoose.Types.ObjectId(id));
    const assignedSubjects = subjectIds.map((id) => new mongoose.Types.ObjectId(id));

    const newUser = await User.create({
      organization_id: orgOid,
      email,
      password_hash: hashedPassword,
      role: 'Teacher',
      status: 'active',
      email_verified: false,
      name: displayName,
      assigned_classes: assignedClasses,
      assigned_subjects: assignedSubjects,
    });

    await Teacher.create({
      organization_id: orgOid,
      user_id: newUser._id,
    });

    const created = await User.findById(newUser._id)
      .select('email name assigned_classes assigned_subjects')
      .populate([{ path: 'assigned_classes', select: 'name' }, { path: 'assigned_subjects', select: 'name' }])
      .lean();

    return successResponse(created, 201);
  } catch (e) {
    console.error('[POST /api/teachers]', e);
    return errorResponse('Internal Server Error', 500);
  }
}
