'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ReceptionistPageHeader from '@/components/receptionist/ReceptionistPageHeader';
import {
  loadReceptionistDashboard,
  runReceptionistReminders,
  type ReceptionistOverview,
  type VaccinationDueItem,
} from '@/lib/receptionist';
import {
  Appointment,
  formatAppointmentDate,
  formatTime,
} from '@/lib/appointments';

export default function ReceptionistDashboard() {
  const { token, user, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<ReceptionistOverview | null>(null);
  const [recentRequests, setRecentRequests] = useState<Appointment[]>([]);
  const [todayConfirmed, setTodayConfirmed] = useState<Appointment[]>([]);
  const [upcomingConsultations, setUpcomingConsultations] = useState<Appointment[]>([]);
  const [billingQueue, setBillingQueue] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationDueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState('');
  const [reminderBusy, setReminderBusy] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      setLoadWarning('Session not found. Please log in again.');
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadWarning('');
      try {
        const { overview: ov, feed, warning } = await loadReceptionistDashboard(token);
        if (cancelled) return;
        setOverview(ov);
        setRecentRequests(feed.recentRequests);
        setTodayConfirmed(feed.todayConfirmed);
        setUpcomingConsultations(feed.upcomingConsultations);
        setBillingQueue(feed.billingQueue);
        setVaccinations(feed.vaccinationsDue);
        if (warning) setLoadWarning(warning);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
        setLoadWarning(
          msg.includes('log in')
            ? msg
            : `${msg} Ensure the API is running on port 5000, then refresh.`
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, authLoading]);

  async function handleRunReminders() {
    if (!token || reminderBusy) return;
    setReminderBusy(true);
    setReminderMsg('');
    try {
      await runReceptionistReminders(token);
      setReminderMsg('Reminder notifications sent to pet owners and doctors.');
    } catch (e) {
      setReminderMsg(e instanceof Error ? e.message : 'Failed to send reminders');
    } finally {
      setReminderBusy(false);
    }
  }

  const welcomeName = user?.fullName?.split(' ')[0] || 'Receptionist';
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statCards = [
    {
      label: 'Consultation billing',
      value: overview?.pendingBilling ?? billingQueue.length,
      href: '/dashboard/receptionist/billing',
      accent: true,
    },
    {
      label: 'Pending requests',
      value: overview?.pendingAppointments ?? recentRequests.length,
      href: '/dashboard/receptionist/appointments/manage',
    },
    {
      label: "Today's confirmed",
      value: overview?.todayAppointments ?? todayConfirmed.length,
      href: '/dashboard/receptionist/appointments/today',
    },
    {
      label: 'Shop orders',
      value: overview?.pendingOrders ?? 0,
      href: '/dashboard/receptionist/orders',
    },
    {
      label: 'Vaccinations due',
      value: overview?.vaccinationsDueSoon ?? vaccinations.length,
      href: '/dashboard/receptionist/pets',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gray-100 bg-gradient-to-br from-orange-50/80 to-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-sans text-xl font-semibold tracking-tight text-gray-900">
            Welcome, {welcomeName}
          </p>
          <p className="font-sans text-xs text-gray-500">{todayLabel}</p>
        </div>
        <p className="mt-1 font-sans text-sm text-gray-600">
          New requests, today&apos;s confirmed visits, consultation billing, and vaccination &
          consultation reminders.
        </p>
      </section>

      {loadWarning ? (
        <p className="rounded-lg bg-amber-50 px-4 py-2 font-sans text-sm text-amber-900">
          {loadWarning}
        </p>
      ) : null}

      {reminderMsg ? (
        <p className="rounded-lg bg-green-50 px-4 py-2 font-sans text-sm text-green-900">
          {reminderMsg}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-xl border px-3 py-3 shadow-sm transition hover:shadow-md ${
              card.accent
                ? 'border-[#ec6d13]/25 bg-gradient-to-br from-orange-50 to-white'
                : 'border-gray-100 bg-white'
            }`}
          >
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p
              className={`mt-0.5 font-sans text-2xl font-bold tabular-nums ${
                card.accent ? 'text-[#ec6d13]' : 'text-gray-900'
              }`}
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <ReceptionistPageHeader
            title="Recent appointment requests"
            subtitle="Pending and reschedule offers — respond first"
            action={
              <Link
                href="/dashboard/receptionist/appointments/manage"
                className="font-sans text-sm font-semibold text-[#ec6d13] hover:underline"
              >
                Review all →
              </Link>
            }
          />
          {recentRequests.length === 0 ? (
            <p className="font-sans text-sm text-gray-500">No new requests right now.</p>
          ) : (
            <ul className="space-y-3">
              {recentRequests.map((apt) => (
                <li
                  key={apt.id}
                  className="rounded-xl border border-amber-100 bg-amber-50/40 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-sans text-sm font-semibold text-gray-900">
                        {apt.petName || 'Pet'} · {apt.ownerName || 'Owner'}
                      </p>
                      <p className="mt-0.5 font-sans text-xs text-gray-600">
                        Dr. {apt.doctorName || '—'} ·{' '}
                        {formatAppointmentDate(apt.appointmentDate)} ·{' '}
                        {formatTime(apt.appointmentTime)}
                      </p>
                    </div>
                    <RequestStatusPill status={apt.status} />
                  </div>
                  <Link
                    href="/dashboard/receptionist/appointments/manage"
                    className="mt-2 inline-block font-sans text-xs font-semibold text-[#ec6d13] hover:underline"
                  >
                    Approve or offer new time →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <ReceptionistPageHeader
            title="Today's confirmed visits"
            subtitle="Approved and awaiting payment only"
            action={
              <Link
                href="/dashboard/receptionist/appointments/today"
                className="font-sans text-sm font-semibold text-[#ec6d13] hover:underline"
              >
                Check-in queue →
              </Link>
            }
          />
          {todayConfirmed.length === 0 ? (
            <p className="font-sans text-sm text-gray-500">
              No confirmed visits scheduled for today.
            </p>
          ) : (
            <ul className="space-y-3">
              {todayConfirmed.map((apt) => (
                <li
                  key={apt.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold text-gray-900">
                      {apt.petName || 'Pet'} — {apt.ownerName || 'Owner'}
                    </p>
                    <p className="font-sans text-xs text-gray-600">Dr. {apt.doctorName || '—'}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-sans text-sm font-semibold text-[#ec6d13]">
                      {formatTime(apt.appointmentTime)}
                    </span>
                    <VisitStatusPill status={apt.status} billingStatus={apt.billingStatus} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <ReceptionistPageHeader
            title="Consultation billing"
            subtitle="Doctor saved records — add charges and update owner details"
            action={
              <Link
                href="/dashboard/receptionist/billing"
                className="font-sans text-sm font-semibold text-[#ec6d13] hover:underline"
              >
                Open billing →
              </Link>
            }
          />
          {billingQueue.length === 0 ? (
            <p className="font-sans text-sm text-gray-500">
              No visits waiting for billing. When a doctor saves consultation records, they appear
              here.
            </p>
          ) : (
            <ul className="space-y-3">
              {billingQueue.map((apt) => (
                <li
                  key={apt.id}
                  className="rounded-xl border border-amber-100 bg-amber-50/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-sans text-sm font-semibold text-gray-900">
                        {apt.petName || 'Pet'} · {apt.ownerName || 'Owner'}
                      </p>
                      <p className="mt-0.5 font-sans text-xs text-gray-600">
                        Dr. {apt.doctorName || '—'} ·{' '}
                        {formatAppointmentDate(apt.appointmentDate)} ·{' '}
                        {formatTime(apt.appointmentTime)}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-200 px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                      Billing due
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/receptionist/billing?appointmentId=${apt.id}`}
                      className="font-sans text-xs font-semibold text-[#ec6d13] hover:underline"
                    >
                      Add consultation, vaccination & medicine charges →
                    </Link>
                    {apt.userId ? (
                      <Link
                        href={`/dashboard/receptionist/pets?view=owners&highlight=${apt.userId}`}
                        className="font-sans text-xs font-semibold text-gray-700 hover:underline"
                      >
                        Update pet owner profile →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <ReceptionistPageHeader
            title="Upcoming consultation reminders"
            subtitle="Next 14 days — notify pet owners and doctors"
            action={
              <button
                type="button"
                onClick={handleRunReminders}
                disabled={reminderBusy}
                className="font-sans text-sm font-semibold text-[#ec6d13] hover:underline disabled:opacity-50"
              >
                {reminderBusy ? 'Sending…' : 'Run reminders →'}
              </button>
            }
          />
          {upcomingConsultations.length === 0 ? (
            <p className="font-sans text-sm text-gray-500">
              No upcoming confirmed consultations in the next two weeks.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingConsultations.map((apt) => (
                <li
                  key={apt.id}
                  className="rounded-xl border border-blue-100 bg-blue-50/30 px-4 py-3"
                >
                  <p className="font-sans text-sm font-semibold text-gray-900">
                    {apt.petName || 'Pet'} — {apt.ownerName || 'Owner'}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-gray-600">
                    Dr. {apt.doctorName || '—'} · {formatAppointmentDate(apt.appointmentDate)} ·{' '}
                    {formatTime(apt.appointmentTime)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <ReceptionistPageHeader
          title="Vaccinations due"
          subtitle="Next 30 days — latest due dates for pet owners"
          action={
            <Link
              href="/dashboard/receptionist/pets"
              className="font-sans text-sm font-semibold text-[#ec6d13] hover:underline"
            >
              Pet list →
            </Link>
          }
        />
        {vaccinations.length === 0 ? (
          <p className="font-sans text-sm text-gray-500">No vaccinations due in the next 30 days.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {vaccinations.map((v) => (
              <li
                key={v.id}
                className="rounded-xl border border-green-100 bg-green-50/30 px-4 py-3 font-sans text-sm"
              >
                <p className="font-semibold text-gray-900">
                  {v.pet_name} — {v.vaccine_name}
                </p>
                <p className="mt-0.5 text-gray-600">
                  Due {new Date(v.due_date).toLocaleDateString()} · {v.owner_name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-gray-500">
          Quick access
        </p>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[
            {
              label: 'Review requests',
              href: '/dashboard/receptionist/appointments/manage',
              desc: 'Pending & reschedule',
            },
            {
              label: 'Consultation billing',
              href: '/dashboard/receptionist/billing',
              desc: 'After vet visit',
            },
            {
              label: 'Check-in queue',
              href: '/dashboard/receptionist/appointments/queue',
              desc: 'Today confirmed',
            },
            {
              label: 'Pets & owners',
              href: '/dashboard/receptionist/pets',
              desc: 'Directory',
            },
            {
              label: 'Shop orders',
              href: '/dashboard/receptionist/orders',
              desc: 'Fulfillment',
            },
            {
              label: 'Doctor schedules',
              href: '/dashboard/receptionist/doctors',
              desc: 'Availability',
            },
            {
              label: 'Record payment',
              href: '/dashboard/receptionist/payments',
              desc: 'Offline',
            },
            {
              label: 'Send alert',
              href: '/dashboard/receptionist/notifications/send',
              desc: 'Broadcast',
            },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md"
            >
              <p className="font-sans text-sm font-semibold text-gray-900">{q.label}</p>
              <p className="mt-0.5 font-sans text-xs text-gray-500">{q.desc}</p>
            </Link>
          ))}
          <button
            type="button"
            onClick={handleRunReminders}
            disabled={reminderBusy}
            className="rounded-xl border border-gray-100 bg-white px-3 py-3 text-left shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md disabled:opacity-50"
          >
            <p className="font-sans text-sm font-semibold text-gray-900">Run reminders</p>
            <p className="mt-0.5 font-sans text-xs text-gray-500">Vaccination & consultation</p>
          </button>
        </div>
      </section>
    </div>
  );
}

function RequestStatusPill({ status }: { status: string }) {
  const label =
    status === 'reschedule_offered' ? 'Reschedule offered' : status.replace(/_/g, ' ');
  return (
    <span className="rounded-full bg-amber-200 px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-amber-900">
      {label}
    </span>
  );
}

function VisitStatusPill({
  status,
  billingStatus,
}: {
  status: string;
  billingStatus?: string;
}) {
  if (status === 'completed' && billingStatus === 'pending') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-sans text-[10px] font-semibold text-amber-900">
        Billing due
      </span>
    );
  }
  if (status === 'completed' && billingStatus === 'paid') {
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 font-sans text-[10px] font-semibold text-green-800">
        Paid
      </span>
    );
  }
  const styles: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-900',
    awaiting_payment: 'bg-orange-100 text-orange-900',
    completed: 'bg-blue-100 text-blue-800',
  };
  const label =
    status === 'approved'
      ? 'Confirmed'
      : status === 'awaiting_payment'
        ? 'Awaiting pay'
        : status.replace(/_/g, ' ');
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold capitalize ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {label}
    </span>
  );
}
