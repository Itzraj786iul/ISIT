'use client';

import { BarChart3, Brain, Target, Zap, type LucideIcon } from 'lucide-react';
import type { I18nKey } from '@/lib/t';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import LandingAiTutorMock from '@/components/home/LandingAiTutorMock';

type Tr = (key: I18nKey) => string;

type TutorFeature = {
  title: string;
  desc: string;
};

type Props = {
  tr: Tr;
  tutorFeatures: readonly [TutorFeature, TutorFeature, TutorFeature, TutorFeature];
};

const FEATURE_ICONS: LucideIcon[] = [Brain, Zap, BarChart3, Target];

export default function LandingAiTutorSection({ tr, tutorFeatures }: Props) {
  return (
    <section className="isit-landing-tutor-section relative py-16 sm:py-24">
      <RevealOnView className="isit-landing-tutor-section__inner relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="isit-landing-tutor-section__mock-col">
          <LandingAiTutorMock />
        </div>

        <div className="isit-landing-tutor-section__content-col">
          <p className="isit-landing-tutor-section__eyebrow">{tr('landingTutorEyebrow')}</p>
          <h2 className="isit-landing-tutor-section__heading">
            {tr('landingTutorHeading')}
            <br />
            {tr('landingTutorHeadingLine2')}{' '}
            <span className="isit-landing-tutor-section__heading-accent">{tr('landingTutorHeadingAccent')}</span>
          </h2>
          <p className="isit-landing-tutor-section__lead">{tr('landingTutorLead')}</p>

          <RevealStagger className="isit-landing-tutor-section__features">
            {tutorFeatures.map((feature, index) => {
              const Icon = FEATURE_ICONS[index];
              return (
                <div key={feature.title} className="isit-landing-tutor-section__feature">
                  <div className="isit-landing-tutor-section__feature-icon" aria-hidden>
                    <Icon className="h-5 w-5 text-sky-400" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="isit-landing-tutor-section__feature-title">{feature.title}</h3>
                    <p className="isit-landing-tutor-section__feature-desc">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </RevealStagger>
        </div>
      </RevealOnView>
    </section>
  );
}
