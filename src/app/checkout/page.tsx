'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Wallet, Landmark, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'bank'>('upi');

  const course = {
    title: "Full Stack Web Development Bootcamp",
    subtitle: "Master modern web development with React, Node.js, and MongoDB",
    instructor: "Dr. Sarah Johnson",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80",
    originalPrice: 3999,
    discount: 1000,
  };

  const finalPrice = course.originalPrice - course.discount;

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-sky-500 font-bold text-xl">ISIT</h1>
          <Link href="/" className="text-sm text-gray-600 hover:text-sky-600">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">

            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
              <p className="text-gray-500 mt-2">Complete your purchase securely</p>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Billing Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-700 block mb-2">Full Name *</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Rohit"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-2">Email Address *</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="123@gmail.com"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-2">Country</label>
                  <select className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                    <option>India</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-2">State/Province</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Noida"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-700 block mb-2">ZIP / Postal Code</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="201304"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
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
                    placeholder="7827016924@paytm"
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

            {/* Complete Button */}
            <button className="w-full h-14 rounded-2xl text-white font-semibold text-lg 
                               bg-gradient-to-r from-sky-500 to-sky-600 
                               hover:from-sky-600 hover:to-sky-700 
                               shadow-lg shadow-sky-500/30 transition">
              Complete Payment
            </button>

          </div>

          {/* RIGHT SIDE */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-8 overflow-hidden">

              {/* Course Image */}
              <div className="relative h-44 w-full">
                <Image
                  src={course.image}
                  alt="Course"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  ₹1000 OFF
                </div>
              </div>

              <div className="p-6">

                <h3 className="font-semibold text-gray-900 text-lg">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  {course.subtitle}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  by {course.instructor}
                </p>

                <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Original Price</span>
                    <span className="text-gray-900">₹{course.originalPrice}.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600">-₹{course.discount}.00</span>
                  </div>

                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-sky-600">₹{finalPrice}.00</span>
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

/* Payment Option Component */

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
      className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition
      ${selected
        ? 'border-sky-500 bg-sky-50'
        : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>

      {selected && (
        <CheckCircle size={20} className="text-sky-600" />
      )}
    </div>
  );
}
