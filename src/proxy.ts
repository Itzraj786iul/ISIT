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

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Protect teacher pages: must be authenticated and role Teacher
  if (pathname.startsWith('/teacher')) {
    const payload = await getPayload(req);
    if (!payload) {
      const url = new URL('/login', req.url);
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
    if (payload.role !== 'teacher') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect API: POST /api/course, DELETE /api/course/[id], /api/user/*
  if (pathname === '/api/course' && method === 'POST') {
    const payload = await getPayload(req);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (payload.role !== 'teacher') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname.match(/^\/api\/course\/[^/]+$/) && method === 'DELETE') {
    const payload = await getPayload(req);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (payload.role !== 'teacher') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname === '/api/lesson' && method === 'POST') {
    const payload = await getPayload(req);
    if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (payload.role !== 'teacher') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/lesson/') && (method === 'PATCH' || method === 'DELETE')) {
    const payload = await getPayload(req);
    if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (payload.role !== 'teacher') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/user') || pathname.startsWith('/api/student') || pathname === '/api/checkout') {
    const payload = await getPayload(req);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Require login for lesson player (prevents accessing lessons without signing in)
  if (pathname.startsWith('/lesson')) {
    const payload = await getPayload(req);
    if (!payload) {
      const url = new URL('/login', req.url);
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Require login for checkout page (redirect to login before seeing checkout form)
  if (pathname === '/checkout') {
    const payload = await getPayload(req);
    if (!payload) {
      const url = new URL('/login', req.url);
      url.searchParams.set('returnUrl', pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/teacher/:path*',
    '/lesson/:path*',
    '/checkout',
    '/api/course',
    '/api/course/:path*',
    '/api/lesson',
    '/api/lesson/:path*',
    '/api/user/:path*',
    '/api/student/:path*',
    '/api/checkout',
  ],
};
