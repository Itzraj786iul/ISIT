import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'auth_token';

async function getPayload(req: NextRequest): Promise<{ userId: string; role: string } | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = payload.userId as string;
    const role = ((payload.role as string) || 'Student').toLowerCase();
    if (!userId) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

function redirectToLogin(req: NextRequest) {
  const url = new URL('/login', req.url);
  url.searchParams.set('returnUrl', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // --- Teacher pages: must be authenticated + teacher role ---
  if (pathname.startsWith('/teacher')) {
    const payload = await getPayload(req);
    if (!payload) return redirectToLogin(req);
    if (payload.role !== 'teacher') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // --- Parent pages: must be authenticated + parent role ---
  if (pathname.startsWith('/parent')) {
    const payload = await getPayload(req);
    if (!payload) return redirectToLogin(req);
    if (payload.role !== 'parent') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // --- Protected student pages ---
  const protectedPages = [
    '/dashboard', '/analytics', '/schedule', '/achievements',
    '/settings', '/help', '/my-courses', '/learning-path',
    '/certificate', '/live', '/lesson', '/checkout',
    '/subjects', '/subject', '/topic',
  ];
  for (const prefix of protectedPages) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      const payload = await getPayload(req);
      if (!payload) return redirectToLogin(req);
      return NextResponse.next();
    }
  }

  // --- Teacher-only API routes ---
  if (
    (pathname === '/api/course' && method === 'POST') ||
    (pathname.match(/^\/api\/course\/[^/]+$/) && (method === 'DELETE' || method === 'PATCH')) ||
    (pathname === '/api/lesson' && method === 'POST') ||
    (pathname.startsWith('/api/lesson/') && (method === 'PATCH' || method === 'DELETE'))
  ) {
    const payload = await getPayload(req);
    if (!payload) return unauthorized();
    if (payload.role !== 'teacher') return forbidden();
    return NextResponse.next();
  }

  // --- Authenticated API routes (any logged-in user) ---
  const authedApiPrefixes = [
    '/api/user', '/api/student', '/api/checkout',
    '/api/upload', '/api/sessions', '/api/session-events',
    '/api/mastery', '/api/performance', '/api/assignments',
    '/api/last-session', '/api/parent',
    '/api/ai/tutor', '/api/ai/generate-quiz',
    '/api/questions', '/api/videos', '/api/topic-notes',
  ];
  for (const prefix of authedApiPrefixes) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      const payload = await getPayload(req);
      if (!payload) return unauthorized();
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/teacher/:path*',
    '/parent/:path*',
    '/dashboard',
    '/analytics',
    '/schedule',
    '/achievements',
    '/settings',
    '/help',
    '/my-courses',
    '/learning-path',
    '/certificate/:path*',
    '/live/:path*',
    '/lesson/:path*',
    '/checkout',
    '/subjects',
    '/subject/:path*',
    '/topic/:path*',
    '/api/course',
    '/api/course/:path*',
    '/api/lesson',
    '/api/lesson/:path*',
    '/api/user/:path*',
    '/api/student/:path*',
    '/api/checkout',
    '/api/upload',
    '/api/sessions/:path*',
    '/api/session-events/:path*',
    '/api/mastery',
    '/api/performance',
    '/api/assignments',
    '/api/last-session',
    '/api/parent/:path*',
    '/api/ai/tutor',
    '/api/ai/generate-quiz',
    '/api/questions',
    '/api/videos',
    '/api/topic-notes',
  ],
};
