'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DoctorShell from '@/components/doctor/DoctorShell';
import { fetchDoctorDashboard } from '@/lib/doctorApplications';
import { statusLabel } from '@/lib/appointments';

interface DashboardData {
  profile: { specialization: string; availableDays: string[] };
  stats: { pendingRequests: number; upcomingCount: number };
  upcomingAppointments: Array<{
    id: number;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    petName?: string;
    ownerName?: string;
  }>;
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, hasRole, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?role=doctor');
      return;
    }
    if (!isLoading && user && !hasRole('doctor')) {
      router.replace(user.dashboardPath || '/dashboard');
    }
  }, [isLoading, isAuthenticated, user, hasRole, router]);

  useEffect(() => {
    if (!token || !hasRole('doctor')) return;
    fetchDoctorDashboard(token)
      .then((d) => setData(d as DashboardData))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load';
        if (msg.includes('pending') || msg.includes('approval')) {
          logout();
          router.replace('/register/doctor/pending');
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [token, hasRole, logout, router]);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <DoctorShell>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : data ? (
        <div className="space-y-8">
          <div>
            <h1 className="text-gray-900">
              Welcome, {user?.fullName?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-gray-600">{data.profile.specialization}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Pending requests"
              value={data.stats.pendingRequests}
              href="/dashboard/appointments/manage"
            />
            <StatCard label="Upcoming visits" value={data.stats.upcomingCount} />
          </div>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-gray-900">Upcoming appointments</h3>
              <Link
                href="/dashboard/appointments/manage"
                className="text-sm font-semibold text-[#ec6d13] hover:underline"
              >
                Manage all
              </Link>
            </div>
            {data.upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming appointments scheduled.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.upcomingAppointments.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {a.petName || 'Pet'} — {a.ownerName || 'Owner'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {a.appointmentDate} at {String(a.appointmentTime).slice(0, 5)}
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {statusLabel(a.status as never)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-sm text-gray-500">
            Available days: {data.profile.availableDays?.join(', ') || 'Not set'}
          </p>
        </div>
      ) : null}
    </DoctorShell>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition-shadow hover:shadow-md">
        {inner}
      </Link>
    );
  }
  return inner;
}
