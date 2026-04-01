import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-sky-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-sky-600 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
