import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireTeacherOrganization } from '@/lib/teacher-org';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireTeacherOrganization(req);
    if (!gate.ok) return gate.response;

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid teacher id', 400);
    }

    if (id === gate.userId) {
      return errorResponse('You cannot delete your own account here', 400);
    }

    await connectToDB();
    const User = (await import('@/models/User')).default;
    const Teacher = (await import('@/models/Teacher')).default;
    const Course = (await import('@/models/Course')).default;

    const user = await User.findById(id).select('organization_id role').lean<{
      organization_id: mongoose.Types.ObjectId;
      role: string;
    } | null>();

    if (!user) return errorResponse('Teacher not found', 404);
    if (user.organization_id.toString() !== gate.organizationId) {
      return errorResponse('Forbidden', 403);
    }
    if (user.role !== 'Teacher') {
      return errorResponse('User is not a teacher', 400);
    }

    const courseCount = await Course.countDocuments({ teacherId: id });
    if (courseCount > 0) {
      return errorResponse(
        'This teacher has marketplace courses. Reassign or delete those courses first.',
        400
      );
    }

    await Teacher.deleteMany({ user_id: id });
    await User.findByIdAndDelete(id);

    return successResponse({ deleted: true }, 200);
  } catch (e) {
    console.error('[DELETE /api/teachers/[id]]', e);
    return errorResponse('Internal Server Error', 500);
  }
}
