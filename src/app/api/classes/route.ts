import { connectToDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAdminOrganization, requireTeacherOrganization } from '@/lib/teacher-org';

export async function GET(req: Request) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    await connectToDB();
    const ClassModel = (await import('@/models/Class')).default;
    const list = await ClassModel.find({ organization_id: gate.organizationId })
      .sort({ name: 1 })
      .lean()
      .exec();

    return successResponse(list, 200);
  } catch (e) {
    console.error('[GET /api/classes]', e);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdminOrganization(req);
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) return errorResponse('name is required', 400);

    await connectToDB();
    const ClassModel = (await import('@/models/Class')).default;

    try {
      const created = await ClassModel.create({
        name,
        organization_id: gate.organizationId,
      });
      return successResponse(created.toObject(), 201);
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: number }).code : undefined;
      if (code === 11000) return errorResponse('A class with this name already exists in your organization', 409);
      throw err;
    }
  } catch (e) {
    console.error('[POST /api/classes]', e);
    return errorResponse('Internal Server Error', 500);
  }
}
