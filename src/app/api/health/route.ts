import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';

/** Load balancer / uptime checks — no auth. */
export async function GET() {
  try {
    await connectToDB();
    return NextResponse.json({
      ok: true,
      db: 'connected',
      ts: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, db: 'error', ts: new Date().toISOString() },
      { status: 503 }
    );
  }
}
