'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Wallet, Landmark, CheckCircle } from 'lucide-react';

type CourseType = {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  teacherId?: { name?: string } | string;
};

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('id');

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'bank'>('upi');
  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState({
    fullName: '',
    email: '',
    country: 'India',
    state: '',
    zip: '',
  });

  // Require course id and auth
  useEffect(() => {
    if (!courseId) {
      router.replace('/courses');
      return;
    }
    const run = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        const returnUrl = `/checkout?id=${courseId}`;
        router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }
      try {
        const [courseRes, enrolledRes] = await Promise.all([
          fetch(`/api/course/${courseId}`),
          fetch('/api/student/enrolled-courses', { credentials: 'include' }),
        ]);
        if (!courseRes.ok) {
          setError('Course not found');
          setLoading(false);
          return;
        }
        const data = await courseRes.json();
        setCourse(data.course || data);
        if (enrolledRes.ok) {
          const enrolled: { course: { _id: string }; nextLessonId?: string | null }[] = await enrolledRes.json();
          const alreadyEnrolled = enrolled.find((e) => e.course._id === courseId);
          if (alreadyEnrolled) {
            if (alreadyEnrolled.nextLessonId) {
              router.replace(`/lesson/${alreadyEnrolled.nextLessonId}`);
            } else {
              router.replace(`/course/${courseId}`);
            }
            return;
          }
        }
      } catch {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [courseId, router]);

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !course) return;
    setError('');

    if (!billing.fullName.trim() || !billing.email.trim()) {
      setError('Please enter your full name and email.');
      return;
    }

    setPaying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          fullName: billing.fullName.trim(),
          email: billing.email.trim(),
          country: billing.country,
          state: billing.state,
          zip: billing.zip,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      if (data.firstLessonId) {
        router.replace(`/lesson/${data.firstLessonId}`);
      } else {
        router.replace(`/course/${courseId}?enrolled=1`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <Link href="/courses" className="text-sky-600 font-medium hover:underline">
          Browse courses
        </Link>
      </div>
    );
  }

  if (!course) return null;

  const instructorName =
    typeof course.teacherId === 'object' && course.teacherId && 'name' in course.teacherId
      ? (course.teacherId as { name?: string }).name
      : 'Instructor';
  const courseImage = course.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80';

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sky-500 font-bold text-xl">
            ISIT
          </Link>
          <Link href="/courses" className="text-sm text-gray-600 hover:text-sky-600">
            Back to Courses
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
              <p className="text-gray-500 mt-2">Complete your purchase securely</p>
            </div>

            <form onSubmit={handleCompletePayment} className="space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Billing Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-700 block mb-2">Full Name *</label>
                    <input
                      name="fullName"
                      required
                      value={billing.fullName}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-2">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={billing.email}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-2">Country</label>
                    <select
                      name="country"
                      value={billing.country}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option>India</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-2">State/Province</label>
                    <input
                      name="state"
                      value={billing.state}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      placeholder="e.g. Noida"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700 block mb-2">ZIP / Postal Code</label>
                    <input
                      name="zip"
                      value={billing.zip}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      placeholder="e.g. 201304"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Payment Method
                </h3>
                <div className="space-y-4">
                  <Option
                    selected={paymentMethod === 'card'}
                    onClick={() => setPaymentMethod('card')}
                    icon={<CreditCard size={18} />}
                    label="Credit / Debit Card"
                  />
                  <Option
                    selected={paymentMethod === 'upi'}
                    onClick={() => setPaymentMethod('upi')}
                    icon={<span className="text-lg font-bold">₹</span>}
                    label="UPI"
                  />
                  {paymentMethod === 'upi' && (
                    <input
                      placeholder="UPI ID (e.g. 7827016924@paytm)"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  )}
                  <Option
                    selected={paymentMethod === 'wallet'}
                    onClick={() => setPaymentMethod('wallet')}
                    icon={<Wallet size={18} />}
                    label="Digital Wallet"
                  />
                  <Option
                    selected={paymentMethod === 'bank'}
                    onClick={() => setPaymentMethod('bank')}
                    icon={<Landmark size={18} />}
                    label="Net Banking"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full h-14 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? 'Processing...' : 'Complete Payment'}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-8 overflow-hidden">
              <div className="relative h-44 w-full">
                <Image
                  src={courseImage}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.description}</p>
                <p className="text-xs text-gray-400 mt-1">by {instructorName}</p>
                <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 text-sm">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-sky-600">₹{course.price}</span>
                  </div>
                </div>
                <div className="mt-6 text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-sky-500" />
                    Secured by 256-bit SSL Encryption
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-sky-500" />
                    30-day money-back guarantee
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-sky-500" />
                    Lifetime access to course materials
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}

function Option({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition ${
        selected ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      {selected && <CheckCircle size={20} className="text-sky-600" />}
    </div>
  );
}
