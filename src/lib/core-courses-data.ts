export const CORE_COURSE_SLUGS = [
  'brain-lab',
  'learning-intelligence-lab',
  'creative-thinking-lab',
  'action-exploration-lab',
] as const;

export type CoreCourseSlug = (typeof CORE_COURSE_SLUGS)[number];

export const CORE_COURSE_GRADIENTS: Record<CoreCourseSlug, string> = {
  'brain-lab': 'linear-gradient(155deg, #8b5cf6 0%, #7c3aed 38%, #5b21b6 72%, #3b0764 100%)',
  'learning-intelligence-lab': 'linear-gradient(155deg, #60a5fa 0%, #3b82f6 38%, #2563eb 72%, #1e3a8a 100%)',
  'creative-thinking-lab': 'linear-gradient(155deg, #fbbf24 0%, #f59e0b 28%, #ec4899 68%, #be185d 100%)',
  'action-exploration-lab': 'linear-gradient(155deg, #4ade80 0%, #22c55e 32%, #14b8a6 68%, #0891b2 100%)',
};

export const CORE_COURSE_BORDER_COLORS: Record<CoreCourseSlug, string> = {
  'brain-lab': 'rgba(167, 139, 250, 0.35)',
  'learning-intelligence-lab': 'rgba(96, 165, 250, 0.35)',
  'creative-thinking-lab': 'rgba(251, 191, 36, 0.35)',
  'action-exploration-lab': 'rgba(74, 222, 128, 0.35)',
};

export const CORE_COURSE_VISUALS: ReadonlyArray<{
  slug: CoreCourseSlug;
  headerClass: string;
  detailPrefix: 'Brain' | 'Learning' | 'Creative' | 'Action';
}> = [
  { slug: 'brain-lab', headerClass: 'isit-core-course-header--purple', detailPrefix: 'Brain' },
  { slug: 'learning-intelligence-lab', headerClass: 'isit-core-course-header--blue', detailPrefix: 'Learning' },
  { slug: 'creative-thinking-lab', headerClass: 'isit-core-course-header--warm', detailPrefix: 'Creative' },
  { slug: 'action-exploration-lab', headerClass: 'isit-core-course-header--green', detailPrefix: 'Action' },
];

export function isCoreCourseSlug(value: string): value is CoreCourseSlug {
  return (CORE_COURSE_SLUGS as readonly string[]).includes(value);
}

export function getCoreCourseVisual(slug: CoreCourseSlug) {
  return CORE_COURSE_VISUALS.find((v) => v.slug === slug);
}

export function coreCourseHref(slug: CoreCourseSlug) {
  return `/courses/core/${slug}`;
}
