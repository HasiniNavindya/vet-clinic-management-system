'use client';

import Link from 'next/link';

export default function DoctorApplicationPendingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full rounded-2xl bg-white p-8 sm:p-10 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Application submitted</h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Thank you for applying to join our clinic. An administrator will verify your license and
          qualifications. You will receive access to log in once your application is approved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login?role=doctor"
            className="rounded-lg bg-[#ec6d13] px-6 py-3 font-semibold text-white hover:bg-[#d65e0f]"
          >
            Go to login
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
