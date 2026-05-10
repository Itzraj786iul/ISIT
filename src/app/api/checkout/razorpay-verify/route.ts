import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay-verify';
import { completeCourseEnrollment } from '@/lib/marketplace-enroll';

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Please sign in to enroll.' }, { status: 401 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret) {
      return NextResponse.json({ error: 'Payment is not configured.' }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const courseId = typeof body?.courseId === 'string' ? body.courseId.trim() : '';
    const paymentId = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id.trim() : '';
    const orderId = typeof body?.razorpay_order_id === 'string' ? body.razorpay_order_id.trim() : '';
    const signature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature.trim() : '';

    if (!courseId || !paymentId || !orderId || !signature) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    const ok = verifyRazorpayPaymentSignature(orderId, paymentId, signature, secret);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
    }

    const { firstLessonId, alreadyEnrolled } = await completeCourseEnrollment(auth.userId, courseId);

    return NextResponse.json({
      success: true,
      message: alreadyEnrolled ? 'Already enrolled in this course.' : 'Payment successful.',
      alreadyEnrolled,
      orderId,
      firstLessonId,
    });
  } catch (error: unknown) {
    console.error('razorpay-verify', error);
    return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
  }
}
