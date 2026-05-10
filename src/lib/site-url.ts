import { getPublicSiteOrigin } from '@/lib/public-site-url';

/** Absolute URL for emails and redirects (set NEXT_PUBLIC_SITE_URL in production). */
export function absoluteSiteUrl(path: string): string {
  const base = getPublicSiteOrigin().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
