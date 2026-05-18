'use client';

/**
 * @legacy MARKETPLACE_LMS — Mock checkout + POST /api/checkout. Replace with topic/org entitlements later.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Wallet, Landmark, CheckCircle } from 'lucide-react';
import { useT } from '@/lib/t';

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Razorpay checkout'));
    document.body.appendChild(s);
  });
}

type CourseType = {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  teacherId?: { name?: string } | string;
};

function CheckoutForm() {
  const tr = useT();
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
  const [emailBlocked, setEmailBlocked] = useState(false);

  // Require course id and auth
  useEffect(() => {
    if (!courseId) {
      router.replace('/courses');
      return;
    }
    const run = async () => {
      const meRes = await fetch(`/api/auth/me?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      });
      if (!meRes.ok) {
        const returnUrl = `/checkout?id=${courseId}`;
        window.location.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }
      try {
        const [courseRes, enrolledRes] = await Promise.all([
          fetch(`/api/course/${courseId}`),
          fetch('/api/student/enrolled-courses', { credentials: 'include' }),
        ]);
        if (!courseRes.ok) {
          setError(tr('courseNotFound'));
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
        setError(tr('catalogLoadError'));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [courseId, router, tr]);

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !course) return;
    setError('');

    if (!billing.fullName.trim() || !billing.email.trim()) {
      setError(tr('checkoutErrorNameEmail'));
      return;
    }

    setPaying(true);
    try {
      const orderRes = await fetch('/api/checkout/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      });
      const orderData = (await orderRes.json()) as {
        mock?: boolean;
        error?: string;
        key?: string;
        amount?: number;
        currency?: string;
        orderId?: string;
      };

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Could not start checkout');
      }

      if (orderData.mock) {
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
        setPaying(false);
        return;
      }

      await loadRazorpayScript();
      const Rzp = (
        window as unknown as {
          Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
        }
      ).Razorpay;

      const opts = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency ?? 'INR',
        order_id: orderData.orderId,
        name: 'ISIC',
        description: course.title,
        prefill: {
          name: billing.fullName.trim(),
          email: billing.email.trim(),
        },
        theme: { color: '#0ea5e9' },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const res = await fetch('/api/checkout/razorpay-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              courseId,
              fullName: billing.fullName.trim(),
              email: billing.email.trim(),
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || 'Payment verification failed');
            setPaying(false);
            return;
          }
          if (data.firstLessonId) {
            router.replace(`/lesson/${data.firstLessonId}`);
          } else {
            router.replace(`/course/${courseId}?enrolled=1`);
          }
          setPaying(false);
        },
      };

      const rzp = new Rzp(opts);
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="isit-cosmic-bg flex min-h-screen items-center justify-center">
        <p className="text-sm">{tr('checkoutLoading')}</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="isit-cosmic-bg relative flex min-h-screen flex-col items-center justify-center gap-4 px-4 ">
        <p className="text-center text-sm text-red-300">{error}</p>
        <Link href="/courses" className="font-medium text-sky-600 dark:text-cyan-300 hover:underline">
          {tr('checkoutBackToCatalog')}
        </Link>
      </div>
    );
  }

  if (!course) return null;

  const instructorName =
    typeof course.teacherId === 'object' && course.teacherId && 'name' in course.teacherId
      ? (course.teacherId as { name?: string }).name
      : tr('instructorFallback');
  const courseImage = course.image || '';

  return (
    <div className="isit-app-bg min-h-screen flex flex-col relative">
      <header className="border-b border-cyan-400/15 bg-slate-50 dark:bg-white dark:bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-slate-600 dark:text-cyan-200 font-bold text-xl no-underline hover:">
            ISIC
          </Link>
          <Link href="/courses" className="text-sm isit-body no-underline hover:isit-body">
            {tr('checkoutBackToCatalog')}
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{tr('checkoutTitle')}</h2>
              <p className="mt-2 text-gray-500">{tr('checkoutLead')}</p>
            </div>

            <form onSubmit={handleCompletePayment} className="space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{tr('checkoutBillingTitle')}</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-gray-700">{tr('checkoutLabelFullName')}</label>
                    <input
                      name="fullName"
                      required
                      value={billing.fullName}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder={tr('checkoutPlaceholderFullName')}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-700">{tr('checkoutLabelEmail')}</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={billing.email}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder={tr('checkoutPlaceholderEmail')}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-700">{tr('checkoutLabelCountry')}</label>
                    <select
                      name="country"
                      value={billing.country}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="India">{tr('checkoutCountryIndia')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-700">{tr('checkoutLabelState')}</label>
                    <input
                      name="state"
                      value={billing.state}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder={tr('checkoutPlaceholderState')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-gray-700">{tr('checkoutLabelZip')}</label>
                    <input
                      name="zip"
                      value={billing.zip}
                      onChange={handleBillingChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder={tr('checkoutPlaceholderZip')}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{tr('checkoutPaymentTitle')}</h3>
                <div className="space-y-4">
                  <Option
                    selected={paymentMethod === 'card'}
                    onClick={() => setPaymentMethod('card')}
                    icon={<CreditCard size={18} />}
                    label={tr('checkoutPayCard')}
                  />
                  <Option
                    selected={paymentMethod === 'upi'}
                    onClick={() => setPaymentMethod('upi')}
                    icon={<span className="text-lg font-bold">₹</span>}
                    label={tr('checkoutPayUpi')}
                  />
                  {paymentMethod === 'upi' && (
                    <input
                      placeholder={tr('checkoutPlaceholderUpi')}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  )}
                  <Option
                    selected={paymentMethod === 'wallet'}
                    onClick={() => setPaymentMethod('wallet')}
                    icon={<Wallet size={18} />}
                    label={tr('checkoutPayWallet')}
                  />
                  <Option
                    selected={paymentMethod === 'bank'}
                    onClick={() => setPaymentMethod('bank')}
                    icon={<Landmark size={18} />}
                    label={tr('checkoutPayBank')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-lg font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-600 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying ? tr('checkoutProcessing') : tr('checkoutCompletePayment')}
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
                <p className="mt-1 text-xs text-gray-400">{tr('checkoutByInstructor').replace(/\{name\}/g, instructorName ?? '')}</p>
                <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 text-sm">
                  <div className="flex justify-between text-xl font-bold">
                    <span>{tr('checkoutTotal')}</span>
                    <span className="text-sky-600">₹{course.price}</span>
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-sky-500" />
                    {tr('checkoutTrustSsl')}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-sky-500" />
                    {tr('checkoutTrustRefund')}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-sky-500" />
                    {tr('checkoutTrustLifetime')}
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

function CheckoutSuspenseFallback() {
  const tr = useT();
  return (
    <div className="isit-cosmic-bg flex min-h-screen items-center justify-center">
      <p className="text-sm">{tr('checkoutLoading')}</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSuspenseFallback />}>
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
