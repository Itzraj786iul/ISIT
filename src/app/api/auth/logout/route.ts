import { NextResponse } from 'next/server';
import { buildClearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  response.headers.set('Set-Cookie', buildClearAuthCookie());
  return response;
}
