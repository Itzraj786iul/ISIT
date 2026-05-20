import type { I18nKey } from '@/lib/t';

export type Tr = (key: I18nKey) => string;

export const PARTNER_NAMES = ['Atal Innovation', 'MIT Media Lab', 'NCERT', 'STEM India', 'UNESCO MGIEP', 'CBSE Board'] as const;

export function buildStatsConfig(tr: Tr) {
  return [
    { key: 'students', end: 10, format: (n: number) => `${n}K+`, label: tr('landingStatStudents'), gradient: false },
    { key: 'schools', end: 200, format: (n: number) => `${n}+`, label: tr('landingStatSchools'), gradient: false },
    { key: 'mentors', end: 50, format: (n: number) => `${n}+`, label: tr('landingStatMentors'), gradient: false },
    { key: 'projects', end: 1, format: (n: number) => `${n}K+`, label: tr('landingStatProjects'), gradient: false },
    { key: 'support', end: 24, format: (n: number) => `${n}/7`, label: tr('landingStatSupport'), gradient: true },
  ] as const;
}

export function buildTestimonials(tr: Tr) {
  return [
    {
      quote: tr('landingTestimonial1Quote'),
      name: tr('landingTestimonial1Name'),
      meta: tr('landingTestimonial1Meta'),
      initial: 'A',
      color: 'from-violet-600 to-purple-500',
    },
    {
      quote: tr('landingTestimonial2Quote'),
      name: tr('landingTestimonial2Name'),
      meta: tr('landingTestimonial2Meta'),
      initial: 'P',
      color: 'from-orange-500 to-pink-500',
    },
    {
      quote: tr('landingTestimonial3Quote'),
      name: tr('landingTestimonial3Name'),
      meta: tr('landingTestimonial3Meta'),
      initial: 'R',
      color: 'from-blue-600 to-cyan-500',
    },
  ] as const;
}

export function buildFeatureBar(tr: Tr) {
  return [
    { label: tr('landingFeatureNeuro') },
    { label: tr('landingFeatureCbse') },
    { label: tr('landingFeatureProjects') },
    { label: tr('landingFeatureCoding') },
    { label: tr('landingFeatureCuriosity') },
  ] as const;
}

export function buildTutorFeatures(tr: Tr) {
  return [
    { title: tr('landingTutorFeat1Title'), desc: tr('landingTutorFeat1Desc') },
    { title: tr('landingTutorFeat2Title'), desc: tr('landingTutorFeat2Desc') },
    { title: tr('landingTutorFeat3Title'), desc: tr('landingTutorFeat3Desc') },
    { title: tr('landingTutorFeat4Title'), desc: tr('landingTutorFeat4Desc') },
  ] as const;
}

export function buildProgramsRow1(tr: Tr) {
  return [
    { tag: tr('landingProg1Tag'), title: tr('landingProg1Title'), desc: tr('landingProg1Desc') },
    { tag: tr('landingProg2Tag'), title: tr('landingProg2Title'), desc: tr('landingProg2Desc') },
    { tag: tr('landingProg3Tag'), title: tr('landingProg3Title'), desc: tr('landingProg3Desc') },
  ] as const;
}

export function buildProgramsRow2(tr: Tr) {
  return [
    { tag: tr('landingCore1Tag'), title: tr('landingCore1Title'), desc: tr('landingCore1Desc'), glow: false },
    { tag: tr('landingCore2Tag'), title: tr('landingCore2Title'), desc: tr('landingCore2Desc'), glow: true },
    { tag: tr('landingCore3Tag'), title: tr('landingCore3Title'), desc: tr('landingCore3Desc'), glow: false },
  ] as const;
}

export function buildCoreCourses(tr: Tr) {
  return [
    { n: '01', lab: tr('landingCourse1Lab'), title: tr('landingCourse1Title'), desc: tr('landingCourse1Desc') },
    { n: '02', lab: tr('landingCourse2Lab'), title: tr('landingCourse2Title'), desc: tr('landingCourse2Desc') },
    { n: '03', lab: tr('landingCourse3Lab'), title: tr('landingCourse3Title'), desc: tr('landingCourse3Desc') },
    { n: '04', lab: tr('landingCourse4Lab'), title: tr('landingCourse4Title'), desc: tr('landingCourse4Desc') },
  ] as const;
}

export function buildJourneySteps(tr: Tr) {
  return [
    { step: 1, title: tr('landingJourney1Title'), desc: tr('landingJourney1Desc') },
    { step: 2, title: tr('landingJourney2Title'), desc: tr('landingJourney2Desc') },
    { step: 3, title: tr('landingJourney3Title'), desc: tr('landingJourney3Desc') },
    { step: 4, title: tr('landingJourney4Title'), desc: tr('landingJourney4Desc') },
    { step: 5, title: tr('landingJourney5Title'), desc: tr('landingJourney5Desc') },
  ] as const;
}

export function buildFaq(tr: Tr) {
  return [
    { q: tr('landingFaq1Q'), a: tr('landingFaq1A') },
    { q: tr('landingFaq2Q'), a: tr('landingFaq2A') },
    { q: tr('landingFaq3Q'), a: tr('landingFaq3A') },
    { q: tr('landingFaq4Q'), a: tr('landingFaq4A') },
  ] as const;
}

export function buildFinalTrust(tr: Tr) {
  return [tr('landingFinalTrust1'), tr('landingFinalTrust2'), tr('landingFinalTrust3')] as const;
}
