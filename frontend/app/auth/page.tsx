'use client';

import Link from 'next/link';
import { useRoles } from '@/hooks/useRoles';

export default function AuthPortalPage() {
  const { registerableRoles, loading } = useRoles();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Sign in or register</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Choose your account type to continue. Each role has its own login and registration flow.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-10 w-10 border-4 border-[#ec6d13] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {registerableRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">{role.label}</h2>
                <p className="text-sm text-gray-600 mb-6 flex-1">
                  {role.requiresPetInfo
                    ? 'For pet parents booking care and managing pets.'
                    : role.requiresDoctorApplication
                      ? 'Apply with license and qualifications; admin approval required before login.'
                      : `Clinic ${role.label.toLowerCase()} account.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/login?role=${role.id}`}
                    className="flex-1 text-center bg-[#ec6d13] text-white py-2.5 rounded-lg font-semibold hover:bg-[#d65e0f] transition-colors text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href={`/register?role=${role.id}`}
                    className="flex-1 text-center bg-white border-2 border-[#ec6d13] text-[#ec6d13] py-2.5 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-sm"
                  >
                    Register
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
