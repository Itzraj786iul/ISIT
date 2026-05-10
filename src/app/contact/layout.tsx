import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach ISIC for admissions, partnerships, and support. Email, phone, and office details.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
