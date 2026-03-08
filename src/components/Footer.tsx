'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-black text-gray-300 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
        <div>
          <h3 className="text-white text-lg sm:text-xl font-semibold">
            Indian School of Innovation and Thinking
          </h3>
          <p className="mt-3 sm:mt-4 text-sm text-gray-400 max-w-md">
            Empowering the next generation of thinkers and innovators.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 sm:gap-10 text-sm">
          <div>
            <p className="text-white font-medium mb-3 sm:mb-4">Quick Links</p>
            <ul className="space-y-2 sm:space-y-2.5">
              <li><Link href="/" className="text-gray-400 hover:text-white transition py-1 inline-block min-h-[2.25rem] flex items-center">Home</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition py-1 inline-block min-h-[2.25rem] flex items-center">Courses</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition py-1 inline-block min-h-[2.25rem] flex items-center">How it Works</Link></li>
              <li><Link href="/stories" className="text-gray-400 hover:text-white transition py-1 inline-block min-h-[2.25rem] flex items-center">Stories</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition py-1 inline-block min-h-[2.25rem] flex items-center">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-medium mb-3 sm:mb-4">Legal</p>
            <ul className="space-y-2 sm:space-y-2.5">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition py-1 inline-block min-h-[2.25rem] flex items-center">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition py-1 inline-block min-h-[2.25rem] flex items-center">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-10 sm:mt-12 px-4">
        © 2026 Indian School of Innovation and Thinking. All rights reserved.
      </div>
    </footer>
  );
}
