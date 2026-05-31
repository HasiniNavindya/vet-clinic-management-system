'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  fetchReceptionistOverview,
  fetchVaccinationsDue,
  type ReceptionistOverview,
  type VaccinationDueItem,
} from '@/lib/receptionist';
import { fetchAppointments, formatTime } from '@/lib/appointments';

export default function ReceptionistDashboard() {
  const { token, user } = useAuth();
  const [overview, setOverview] = useState<ReceptionistOverview | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationDueItem[]>([]);
  const [todayList, setTodayList] = useState<
    { id: number; petName?: string; ownerName?: string; doctorName?: string; time: string; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [ov, vac, appts] = await Promise.all([
          fetchReceptionistOverview(token),
          fetchVaccinationsDue(token, 30),
          fetchAppointments(token, 'approved'),
        ]);
        setOverview(ov);
        setVaccinations(vac.slice(0, 5));
        const today = new Date().toISOString().slice(0, 10);
        const todayAppts = (appts.ok ? appts.data : []).filter(
          (a) => a.appointmentDate?.slice(0, 10) === today
        );
        setTodayList(
          todayAppts.map((a) => ({
            id: a.id,
            petName: a.petName,
            ownerName: a.ownerName,
            doctorName: a.doctorName,
            time: formatTime(a.appointmentTime),
            status: a.status,
          }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const welcomeName = user?.fullName || 'Receptionist';
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statCards = [
    {
      label: "Today's appointments",
      value: overview?.todayAppointments ?? 0,
      href: '/dashboard/receptionist/appointments/today',
      color: 'bg-orange-50 text-[#ec6d13]',
    },
    {
      label: 'Pending appointments',
      value: overview?.pendingAppointments ?? 0,
      href: '/dashboard/receptionist/appointments/manage',
      color: 'bg-amber-50 text-amber-800',
    },
    {
      label: 'Pending orders',
      value: overview?.pendingOrders ?? 0,
      href: '/dashboard/receptionist/orders',
      color: 'bg-blue-50 text-blue-800',
    },
    {
      label: 'Vaccinations due (30d)',
      value: overview?.vaccinationsDueSoon ?? 0,
      href: '/dashboard/receptionist/pets',
      color: 'bg-green-50 text-green-800',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {welcomeName}</h1>
          <p className="mt-1 text-gray-600">Reception desk overview — {todayLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/receptionist/appointments/manage"
            className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
          >
            Review pending requests
          </Link>
          <Link
            href="/dashboard/receptionist/notifications/send"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
          >
            Send notification
          </Link>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color.split(' ')[1]}`}>{card.value}</p>
          </Link>
        ))}
      </div>

      {overview && overview.unreadNotifications > 0 ? (
        <p className="mt-4 text-sm text-gray-600">
          Staff notification queue: {overview.unreadNotifications} recent items —{' '}
          <Link href="/dashboard/receptionist/notifications/history" className="font-semibold text-[#ec6d13]">
            View history
          </Link>
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Today&apos;s schedule</h2>
            <Link
              href="/dashboard/receptionist/appointments/today"
              className="text-sm font-semibold text-[#ec6d13]"
            >
              View all
            </Link>
          </div>
          {todayList.length === 0 ? (
            <p className="text-sm text-gray-500">No approved appointments scheduled for today.</p>
          ) : (
            <ul className="space-y-3">
              {todayList.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {a.petName || 'Pet'} — {a.ownerName || 'Owner'}
                    </p>
                    <p className="text-sm text-gray-600">Dr. {a.doctorName}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#ec6d13]">{a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Upcoming vaccinations</h2>
            <Link href="/dashboard/receptionist/pets" className="text-sm font-semibold text-[#ec6d13]">
              Pet list
            </Link>
          </div>
          {vaccinations.length === 0 ? (
            <p className="text-sm text-gray-500">No vaccinations due in the next 30 days.</p>
          ) : (
            <ul className="space-y-3">
              {vaccinations.map((v) => (
                <li key={v.id} className="rounded-lg border border-gray-100 px-4 py-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {v.pet_name} — {v.vaccine_name}
                  </p>
                  <p className="text-gray-600">
                    Due {new Date(v.due_date).toLocaleDateString()} · {v.owner_name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Check-in queue', href: '/dashboard/receptionist/appointments' },
          { label: 'Pet owners', href: '/dashboard/receptionist/owners' },
          { label: 'Shop orders', href: '/dashboard/receptionist/orders' },
          { label: 'Doctor schedules', href: '/dashboard/receptionist/doctors' },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-xl border border-dashed border-[#ec6d13]/40 bg-orange-50/50 px-4 py-3 text-center text-sm font-semibold text-[#b6530f] hover:bg-orange-50"
          >
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
