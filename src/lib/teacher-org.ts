import type { Types } from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { errorResponse } from '@/lib/api-response';

export type TeacherOrgOk = { ok: true; userId: string; organizationId: string; role: string };
export type TeacherOrgFail = { ok: false; response: ReturnType<typeof errorResponse> };

export async function requireTeacherOrganization(req: Request): Promise<TeacherOrgOk | TeacherOrgFail> {
  const auth = await getAuthFromRequest(req);
  if (!auth) return { ok: false, response: errorResponse('Unauthorized', 401) };
  const r = auth.role.toLowerCase();
  if (r !== 'teacher' && r !== 'admin') return { ok: false, response: errorResponse('Forbidden', 403) };

  await connectToDB();
  const User = (await import('@/models/User')).default;
  const user = await User.findById(auth.userId).select('organization_id').lean<{
    organization_id?: Types.ObjectId;
  } | null>();
  const oid = user?.organization_id?.toString();
  if (!oid) return { ok: false, response: errorResponse('No organization', 400) };

  return { ok: true, userId: auth.userId, organizationId: oid, role: r };
}

/** Mutations (create/delete classes, teachers, enroll students) — admin only. */
export async function requireAdminOrganization(req: Request): Promise<TeacherOrgOk | TeacherOrgFail> {
  const gate = await requireTeacherOrganization(req);
  if (!gate.ok) return gate;
  if (gate.role !== 'admin') {
    return { ok: false, response: errorResponse('Only organization administrators can perform this action', 403) };
  }
  return gate;
}
