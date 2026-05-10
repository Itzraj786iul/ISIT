/**
 * Creates a Razorpay order when keys are configured; otherwise signals mock checkout.
 */
import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Please sign in to enroll.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const courseId = typeof body?.courseId === 'string' ? body.courseId.trim() : '';
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId.' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const pubKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();

    if (!keyId || !keySecret || !pubKey) {
      return NextResponse.json({ mock: true as const }, { status: 200 });
    }

    await connectToDB();
    const Course = (await import('@/models/Course')).default;
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const c = course as unknown as { price?: number };
    const price = typeof c.price === 'number' ? c.price : 0;
    const amountPaise = Math.max(100, Math.round(price * 100));

    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `c_${courseId.slice(-12)}_${Date.now()}`,
    });

    return NextResponse.json({
      mock: false as const,
      key: pubKey,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency ?? 'INR',
      courseId,
    });
  } catch (error: unknown) {
    console.error('razorpay-order', error);
    return NextResponse.json({ error: 'Could not start payment' }, { status: 500 });
  }
}
