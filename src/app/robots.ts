import type { MetadataRoute } from 'next';
import { getPublicSiteOrigin } from '@/lib/public-site-url';

const base = getPublicSiteOrigin();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/organization'],
    },
    sitemap: `${base.replace(/\/$/, '')}/sitemap.xml`,
    host: base.replace(/\/$/, ''),
  };
}
