import type { MetadataRoute } from 'next';
import { getPublicSiteOrigin } from '@/lib/public-site-url';

const base = getPublicSiteOrigin().replace(/\/$/, '');

const publicPaths = [
  '',
  '/courses',
  '/how-it-works',
  '/stories',
  '/blog',
  '/about-us',
  '/contact',
  '/terms',
  '/privacy',
  '/refund',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return publicPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
