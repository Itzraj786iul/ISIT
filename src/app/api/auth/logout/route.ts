import { NextResponse } from 'next/server';
import { getCookieName } from '@/lib/auth';

export async function POST() {
  const cookieName = getCookieName();
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  response.headers.set('Set-Cookie', `${cookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return response;
}
