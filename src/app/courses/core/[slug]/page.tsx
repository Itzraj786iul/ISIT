import type { Metadata } from 'next';
import { CORE_COURSE_SLUGS } from '@/lib/core-courses-data';
import { coreCoursesDetailEn } from '@/lib/i18n/core-courses-detail';
import { landingEn } from '@/lib/i18n/landing';
import CoreCourseDetailView from '@/components/core-courses/CoreCourseDetailView';

const SLUG_META: Record<
  (typeof CORE_COURSE_SLUGS)[number],
  { titleKey: keyof typeof landingEn; leadKey: keyof typeof coreCoursesDetailEn }
> = {
  'brain-lab': { titleKey: 'landingCourse1Title', leadKey: 'coreCourseDetailBrainLead' },
  'learning-intelligence-lab': { titleKey: 'landingCourse2Title', leadKey: 'coreCourseDetailLearningLead' },
  'creative-thinking-lab': { titleKey: 'landingCourse3Title', leadKey: 'coreCourseDetailCreativeLead' },
  'action-exploration-lab': { titleKey: 'landingCourse4Title', leadKey: 'coreCourseDetailActionLead' },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CORE_COURSE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = SLUG_META[slug as (typeof CORE_COURSE_SLUGS)[number]];
  if (!meta) {
    return { title: 'Core course' };
  }
  return {
    title: landingEn[meta.titleKey],
    description: coreCoursesDetailEn[meta.leadKey],
  };
}

export default function CoreCourseDetailPage() {
  return <CoreCourseDetailView />;
}
