/** Filters for anonymous / marketing views of the curriculum catalog. */

export const PUBLIC_SUBJECT_QUERY = {
  is_active: true,
  status: 'published' as const,
} as const;

export function isSubjectPubliclyVisible(subject: {
  is_active?: boolean;
  status?: string;
} | null | undefined): boolean {
  if (!subject) return false;
  return subject.is_active === true && subject.status === 'published';
}
