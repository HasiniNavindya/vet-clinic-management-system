'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import { getDashboardPath } from '@/lib/roles';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasRole, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?role=admin');
      return;
    }
    if (!isLoading && isAuthenticated && !hasRole('admin')) {
      const path = user?.dashboardPath || getDashboardPath([], user?.role);
      router.replace(path);
    }
  }, [isLoading, isAuthenticated, hasRole, router, user]);

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
      <div className="container mx-auto max-w-5xl px-4 py-12 pt-28">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            <p className="mt-1 text-gray-600">
              Signed in as <span className="font-semibold">{user?.fullName}</span>. Choose a management
              area below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login?role=admin');
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/users"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#ec6d13]">User management</h2>
            <p className="mt-2 text-sm text-gray-600">
              View all accounts, suspend users, assign roles, and review activity for pet owners, vets, and
              staff.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Open user management →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/doctor-applications"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#ec6d13]">
              Doctor applications
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Review veterinarian credential submissions and approve or decline new clinic doctors.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Open vet applications →
            </span>
          </Link>

          <Link
            href="/dashboard/calendar"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#ec6d13]">Clinic calendar</h2>
            <p className="mt-2 text-sm text-gray-600">
              View schedules and booking availability like staff dashboards.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open calendar →</span>
          </Link>

          <Link
            href="/dashboard/appointments/manage"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#ec6d13]">Appointment queue</h2>
            <p className="mt-2 text-sm text-gray-600">Respond to booking requests from pet owners.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Manage appointments →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
