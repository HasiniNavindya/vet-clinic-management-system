'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';

export default function AdminReceptionistHubPage() {
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
        <h1 className="mt-4 text-gray-900">Receptionist management</h1>
        <p className="mt-2 text-gray-600">
          Receptionist accounts use the <code className="rounded bg-gray-200 px-1">receptionist</code> role.
          New applicants register online and must be approved before they can sign in.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-gray-900">Role & permissions</h3>
          <p className="mt-3 text-gray-700">
            Receptionists manage appointments, record payments, and support clinic operations. Access is
            enforced by role identity (admin · doctor · receptionist · pet owner) on each API route.
          </p>
          <p className="mt-4 text-gray-700">
            To deactivate a receptionist, suspend their account from user management.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/receptionist-applications"
            className="rounded-2xl border border-[#ec6d13]/30 bg-orange-50/80 p-6 font-semibold text-[#b6530f] shadow-sm transition-colors hover:bg-orange-100"
          >
            Review pending applications →
          </Link>
          <Link
            href="/dashboard/admin/users?role=receptionist"
            className="rounded-2xl border border-[#ec6d13]/30 bg-orange-50/80 p-6 font-semibold text-[#b6530f] shadow-sm transition-colors hover:bg-orange-100"
          >
            Open receptionist roster →
          </Link>
          <Link
            href="/dashboard/admin/users"
            className="rounded-2xl border border-gray-200 bg-white p-6 font-semibold text-gray-800 shadow-sm hover:border-gray-300 sm:col-span-2"
          >
            All users & roles →
          </Link>
        </div>
      </div>
    </div>
  );
}
