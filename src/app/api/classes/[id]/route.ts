import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAdminOrganization } from '@/lib/teacher-org';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireAdminOrganization(req);
    if (!gate.ok) return gate.response;

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid class id', 400);
    }

    await connectToDB();
    const ClassModel = (await import('@/models/Class')).default;
    const Subject = (await import('@/models/Subject')).default;

    const cls = await ClassModel.findById(id).lean<{ organization_id: mongoose.Types.ObjectId } | null>();
    if (!cls) return errorResponse('Class not found', 404);
    if (cls.organization_id.toString() !== gate.organizationId) {
      return errorResponse('Forbidden', 403);
    }

    const subjectCount = await Subject.countDocuments({ class_id: id });
    if (subjectCount > 0) {
      return errorResponse('Remove all subjects from this class before deleting it', 400);
    }

    await ClassModel.findByIdAndDelete(id);
    return successResponse({ deleted: true }, 200);
  } catch (e) {
    console.error('[DELETE /api/classes/[id]]', e);
    return errorResponse('Internal Server Error', 500);
  }
}
