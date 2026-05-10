import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'ISIC builds AI-powered learning for schools and families — adaptive tutoring, curriculum alignment, and future-ready skills.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
