'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import AddPetModal from '@/components/dashboard/AddPetModal';
import PetDetailModal, { type OwnerPet } from '@/components/pet-owner/PetDetailModal';
import EditPetModal from '@/components/pet-owner/EditPetModal';
import QuickLinkCard from '@/components/pet-owner/dashboard/QuickLinkCard';
import PetProfilesStrip from '@/components/pet-owner/dashboard/PetProfilesStrip';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { API_BASE_URL, authHeaders, isAuthFailure } from '@/lib/api';
import {
  AppointmentStatus,
  formatAppointmentDate,
  formatTime,
  normalizeAppointmentStatus,
} from '@/lib/appointments';
import { fetchUnreadCount } from '@/lib/notifications';

type DashboardData = {
  user: {
    fullName: string;
    email: string;
  };
  pets: OwnerPet[];
  stats: {
    visits: number;
    yearsOfService: number;
    favouriteDoctors: number;
    vetcoins: number;
  };
  upcomingAppointments: Array<{
    id: number;
    appointment_date: string;
    appointment_time: string;
    doctor_name: string;
    specialization: string;
    pet_name?: string;
    status: 'approved' | 'awaiting_payment' | string;
  }>;
};

export default function PetOwnerDashboard() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<OwnerPet | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const fetchDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashRes, notifRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/dashboard`, { headers: authHeaders(token) }),
        fetchUnreadCount(token),
      ]);

      const dashJson = await dashRes.json();
      if (!dashRes.ok) {
        if (isAuthFailure(dashRes.status)) {
          logout();
          router.push('/login');
          return;
        }
        throw new Error(dashJson.error || 'Failed to load dashboard');
      }
      setData(dashJson);
      if (notifRes.ok) setUnreadCount(notifRes.data.count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token]);

  const welcomeName = user?.fullName || data?.user.fullName || 'Pet Owner';
  const pets = useMemo(() => data?.pets || [], [data]);
  const upcoming = data?.upcomingAppointments || [];
  const confirmedAppointments = useMemo(
    () => upcoming.filter((appt) => normalizeAppointmentStatus(appt.status) === 'approved'),
    [upcoming]
  );
  const awaitingPaymentAppointments = useMemo(
    () => upcoming.filter((appt) => normalizeAppointmentStatus(appt.status) === 'awaiting_payment'),
    [upcoming]
  );
  const selectedDayAppointments = useMemo(
    () => upcoming.filter((appt) => String(appt.appointment_date || '').slice(0, 10) === selectedDateKey),
    [upcoming, selectedDateKey]
  );
  const userAvatar =
    (user as { avatar_url?: string })?.avatar_url ||
    (user as { avatar?: string })?.avatar ||
    null;

  if (loading) {
    return (
      <PetOwnerShell avatarUrl={userAvatar}>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      </PetOwnerShell>
    );
  }

  return (
    <PetOwnerShell avatarUrl={userAvatar}>
      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="mt-1 font-sans text-[2rem] font-semibold tracking-tight text-gray-900 md:text-[2.15rem]">
              Welcome back, {welcomeName.split(' ')[0]}!
            </p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
              Manage pets, appointments, and health records from one clean dashboard.
            </p>
          </div>

          <PetProfilesStrip
            className="w-full shrink-0 lg:w-auto"
            pets={pets}
            onView={(pet) => {
              setSelectedPet(pet);
              setDetailOpen(true);
            }}
            onEdit={(pet) => {
              setSelectedPet(pet);
              setEditOpen(true);
            }}
            onAdd={() => setIsAddPetOpen(true)}
          />
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="My pets" value={pets.length} />
        <StatCard label="Upcoming visits" value={upcoming.length} />
        <StatCard label="Clinic visits" value={data?.stats.visits ?? 0} />
        <StatCard
          label="VetCoins"
          value={data?.stats.vetcoins ?? 0}
          accent
          infoText="Earn 10 VetCoins for each appointment you confirm with payment. Use coins for marketplace discounts."
        />
      </div>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-sans text-[1.95rem] font-semibold tracking-tight text-gray-900">Quick access</p>
          <p className="text-[11px] text-gray-500">Frequently used actions</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <QuickLinkCard
            href="/dashboard/pet-owner/appointments"
            title="My Appointments"
            description="View, reschedule, or cancel visits"
            icon={<CalendarIcon />}
          />
          <QuickLinkCard
            href="/dashboard/pet-owner/appointments/book"
            title="Book Appointment"
            description="Pick a vet, date, and time slot"
            icon={<PlusIcon />}
          />
          <QuickLinkCard
            href="/dashboard/pet-owner/health"
            title="Pet Health"
            description="Medical records, vaccines & prescriptions"
            icon={<HeartIcon />}
          />
          <QuickLinkCard
            href="/dashboard/pet-owner/doctors"
            title="Our Veterinarians"
            description="Doctor profiles and availability"
            icon={<StethoscopeIcon />}
          />
          <QuickLinkCard
            href="/dashboard/pet-owner/notifications"
            title="Notifications"
            description="Reminders and clinic updates"
            icon={<BellIcon />}
            badge={unreadCount}
          />
          <QuickLinkCard
            href="/dashboard/pet-owner/settings"
            title="Settings"
            description="Profile and account preferences"
            icon={<SettingsIcon />}
          />
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-sans text-base font-semibold text-gray-900">Upcoming appointments</p>
            <Link
              href="/dashboard/pet-owner/appointments"
              className="text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
            >
              View all →
            </Link>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
              <p className="text-xs font-medium text-emerald-700">Confirmed appointments</p>
              <p className="mt-1 font-sans text-2xl font-semibold text-emerald-900">
                {confirmedAppointments.length}
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-xs font-medium text-amber-700">Awaiting payment</p>
              <p className="mt-1 font-sans text-2xl font-semibold text-amber-900">
                {awaitingPaymentAppointments.length}
              </p>
            </div>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
              <p className="font-medium text-gray-700">No upcoming appointments</p>
              <p className="mt-1 text-sm text-gray-500">Book a visit with our veterinarians</p>
              <Link
                href="/dashboard/pet-owner/appointments/book"
                className="mt-4 inline-block rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
              >
                Book now
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">Upcoming list</p>
                <ul className="space-y-2.5">
                  {upcoming.map((appt) => (
                    <li key={appt.id}>
                      <Link
                        href={`/dashboard/pet-owner/appointments/${appt.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2.5 transition hover:border-[#ec6d13]/30 hover:bg-orange-50/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{appt.doctor_name}</p>
                          <p className="truncate text-xs text-gray-500">
                            {appt.specialization}
                            {appt.pet_name ? ` · ${appt.pet_name}` : ''}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium text-gray-700">
                            {formatAppointmentDate(appt.appointment_date)}
                          </p>
                          <p className="text-xs text-gray-500">{formatTime(appt.appointment_time)}</p>
                          <AppointmentStatusBadge
                            status={appt.status as AppointmentStatus}
                            className="mt-1"
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <InlineAppointmentCalendar
                appointments={upcoming}
                monthDate={calendarMonth}
                selectedDateKey={selectedDateKey}
                onChangeMonth={setCalendarMonth}
                onSelectDate={setSelectedDateKey}
                selectedDayAppointments={selectedDayAppointments}
              />
            </div>
          )}
        </div>
      </section>

      <AddPetModal
        isOpen={isAddPetOpen}
        onClose={() => setIsAddPetOpen(false)}
        onSuccess={fetchDashboard}
        token={token || ''}
      />
      <PetDetailModal
        isOpen={detailOpen}
        pet={selectedPet}
        onClose={() => {
          setDetailOpen(false);
          setSelectedPet(null);
        }}
      />
      <EditPetModal
        isOpen={editOpen}
        pet={selectedPet}
        onClose={() => {
          setEditOpen(false);
          setSelectedPet(null);
        }}
        onSuccess={fetchDashboard}
      />
    </PetOwnerShell>
  );
}

function StatCard({
  label,
  value,
  accent,
  infoText,
}: {
  label: string;
  value: number;
  accent?: boolean;
  infoText?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className={`rounded-xl border px-4 py-3 shadow-sm ${
        accent
          ? 'border-[#ec6d13]/20 bg-linear-to-br from-orange-50 to-white'
          : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-sans text-xl font-bold text-gray-900">{value}</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
        </div>
        {infoText ? (
          <button
            type="button"
            onClick={() => setShowInfo((prev) => !prev)}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#ec6d13]/40 bg-white text-[11px] font-bold text-[#ec6d13] hover:bg-orange-50"
            aria-label={`About ${label}`}
            title={`About ${label}`}
          >
            ?
          </button>
        ) : null}
      </div>
      {infoText && showInfo ? (
        <p className="mt-2 rounded-md bg-orange-50 px-2 py-1.5 text-[11px] leading-4 text-[#a94d07]">
          {infoText}
        </p>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function StethoscopeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function InlineAppointmentCalendar({
  appointments,
  monthDate,
  selectedDateKey,
  onChangeMonth,
  onSelectDate,
  selectedDayAppointments,
}: {
  appointments: DashboardData['upcomingAppointments'];
  monthDate: Date;
  selectedDateKey: string;
  onChangeMonth: (date: Date) => void;
  onSelectDate: (dateKey: string) => void;
  selectedDayAppointments: DashboardData['upcomingAppointments'];
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const dayKeys = new Set(
    appointments.map((appt) => String(appt.appointment_date || '').slice(0, 10))
  );

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{monthName}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onChangeMonth(new Date(year, month - 1, 1))}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onChangeMonth(new Date(year, month + 1, 1))}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasAppointment = dayKeys.has(dateKey);
          const isSelected = selectedDateKey === dateKey;
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`relative rounded py-1.5 text-xs transition ${
                isSelected ? 'bg-[#ec6d13] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day}
              {hasAppointment ? (
                <span
                  className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-[#ec6d13]'
                  }`}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-700">
          {new Date(`${selectedDateKey}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        {selectedDayAppointments.length === 0 ? (
          <p className="mt-1 text-xs text-gray-500">No appointments on this day.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {selectedDayAppointments.map((appt) => (
              <li key={appt.id} className="rounded bg-gray-50 px-2 py-1.5 text-xs">
                <div className="font-medium text-gray-800">
                  {formatTime(appt.appointment_time)} · {appt.pet_name || 'Pet'}
                </div>
                <div className="text-gray-500">
                  <AppointmentStatusBadge status={appt.status as AppointmentStatus} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
