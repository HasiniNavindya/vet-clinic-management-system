'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';

export default function AdminStaffManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-10 pt-28">
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Staff management</h1>
        <p className="mt-2 text-gray-600">
          Staff accounts are clinic teammates with the{' '}
          <code className="rounded bg-gray-200 px-1">staff</code> role. Create them via registration (requires an
          administrator) or elevate an existing pet-owner account carefully from user management.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Role & permissions</h2>
          <p className="mt-3 text-gray-700">
            In this codebase, granular permissions inside the clinic app are enforced by{' '}
            <strong>role identity</strong> (admin · doctor · staff · pet owner) on each API route, not custom
            ACL rows. To elevate or downgrade someone, promote them to{' '}
            <strong>doctor</strong> or <strong>admin</strong> from user management once you approve their onboarding
            path.
          </p>
          <p className="mt-4 text-gray-700">
            To deactivate a teammate, suspend their login from the user sheet — inactive accounts cannot authenticate.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/users?role=staff"
            className="rounded-2xl border border-[#ec6d13]/30 bg-orange-50/80 p-6 font-semibold text-[#b6530f] shadow-sm transition-colors hover:bg-orange-100"
          >
            Open staff roster (user list preset to staff →)
          </Link>
          <Link
            href="/dashboard/admin/users"
            className="rounded-2xl border border-gray-200 bg-white p-6 font-semibold text-gray-800 shadow-sm hover:border-gray-300"
          >
            All users & roles →
          </Link>
        </div>
      </div>
    </div>
  );
}
