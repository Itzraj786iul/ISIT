/**
 * NEXT_PUBLIC_SITE_URL must be a valid absolute URL for `metadataBase` / links.
 * If the protocol is omitted (e.g. "localhost:3000"), we assume http:// so `new URL()` never throws.
 */
export function getPublicSiteUrl(): URL {
  const fallback = new URL('http://localhost:3000');
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  try {
    return new URL(withProtocol);
  } catch {
    return fallback;
  }
}

/** Origin string without trailing slash, e.g. https://example.com */
export function getPublicSiteOrigin(): string {
  return getPublicSiteUrl().origin;
}
