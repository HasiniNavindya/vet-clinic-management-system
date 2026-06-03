'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DoctorShell from '@/components/doctor/DoctorShell';
import DoctorPageHeader from '@/components/doctor/DoctorPageHeader';
import DoctorVisitCard from '@/components/doctor/DoctorVisitCard';
import { fetchDoctorDashboard } from '@/lib/doctorApplications';
import {
  Appointment,
  canDoctorAddConsultation,
  isDoctorVisibleAppointment,
} from '@/lib/appointments';
import { resolveUserDashboardPath } from '@/lib/roles';

interface DashboardData {
  profile: { specialization: string; availableDays: string[] };
  stats: { confirmedUpcoming: number; todayCount: number; upcomingCount: number };
  upcomingAppointments: Appointment[];
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
      router.replace(resolveUserDashboardPath(user));
    }
  }, [isLoading, isAuthenticated, user, hasRole, router]);

  useEffect(() => {
    if (!token || !hasRole('doctor')) return;
    fetchDoctorDashboard(token)
      .then((d) => {
        const raw = d as DashboardData;
        const visits = (raw.upcomingAppointments || []).filter((a) =>
          isDoctorVisibleAppointment(a.status)
        );
        const today = new Date().toISOString().slice(0, 10);
        const needsRecords = visits.filter((a) =>
          canDoctorAddConsultation(a.status, a.hasMedicalRecord)
        );
        const todayVisits = needsRecords.filter(
          (a) => String(a.appointmentDate).slice(0, 10) === today
        );

        setData({
          ...raw,
          upcomingAppointments: needsRecords,
          stats: {
            confirmedUpcoming: needsRecords.length,
            todayCount: todayVisits.length,
            upcomingCount: needsRecords.length,
          },
        });
      })
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

  const firstName = user?.fullName?.split(' ')[0] || 'Doctor';

  if (isLoading || loading) {
    return (
      <DoctorShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      </DoctorShell>
    );
  }

  return (
    <DoctorShell>
      {error ? (
        <p className="font-sans text-sm text-red-600">{error}</p>
      ) : data ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-gradient-to-br from-orange-50/80 to-white p-5 shadow-sm md:p-6">
            <p className="font-sans text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="mt-1 font-sans text-2xl font-semibold tracking-tight text-gray-900 md:text-[1.85rem]">
              Welcome, {firstName}
            </p>
            <p className="mt-2 font-sans text-sm text-gray-600">
              {data.profile.specialization || 'Veterinarian'} — add consultation records, then
              reception handles billing.
            </p>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Upcoming visits" value={data.stats.confirmedUpcoming} accent />
            <StatCard label="Visits today" value={data.stats.todayCount} />
            <StatCard label="Needs consultation" value={data.stats.upcomingCount} />
          </div>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <DoctorPageHeader
              title="Upcoming visits"
              subtitle="Tap Add consultation on each visit — finished visits go to reception for payment"
              action={
                <Link
                  href="/dashboard/doctor/appointments"
                  className="font-sans text-sm font-semibold text-[#ec6d13] hover:underline"
                >
                  My appointments →
                </Link>
              }
            />

            {data.upcomingAppointments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                <p className="font-sans font-medium text-gray-700">All caught up</p>
                <p className="mt-1 font-sans text-sm text-gray-500">
                  No visits need consultation records right now.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.upcomingAppointments.map((a) => (
                  <li key={a.id}>
                    <DoctorVisitCard appointment={a} compact />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {data.profile.availableDays?.length ? (
            <p className="font-sans text-sm text-gray-500">
              Available days: {data.profile.availableDays.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </DoctorShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | undefined;
  accent?: boolean;
}) {
  const display = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return (
    <div
      className={`rounded-xl border px-4 py-4 shadow-sm ${
        accent
          ? 'border-[#ec6d13]/20 bg-gradient-to-br from-orange-50 to-white'
          : 'border-gray-100 bg-white'
      }`}
    >
      <p className="font-sans text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-sans text-3xl font-bold tabular-nums text-gray-900">{display}</p>
    </div>
  );
}
