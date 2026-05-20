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
import { API_BASE_URL, authHeaders, isAuthFailure } from '@/lib/api';
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
  }>;
};

function formatApptDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

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
      <section className="mb-8 flex flex-col gap-8 border-b border-gray-100 pb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Welcome back, {welcomeName.split(' ')[0]}!
          </h1>
          <p className="mt-2 max-w-lg text-gray-600">
            Manage pets, appointments, and health records — all in one place.
          </p>
          <Link
            href="/dashboard/pet-owner/appointments/book"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#ec6d13] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]"
          >
            Book appointment
          </Link>
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
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="My pets" value={pets.length} />
        <StatCard label="Upcoming visits" value={upcoming.length} />
        <StatCard label="Clinic visits" value={data?.stats.visits ?? 0} />
        <StatCard label="VetCoins" value={data?.stats.vetcoins ?? 0} accent />
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-bold text-gray-900">Quick access</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
            href="/dashboard/settings"
            title="Settings"
            description="Profile and account preferences"
            icon={<SettingsIcon />}
          />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Pet health</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Medical records', href: '/dashboard/pet-owner/health?tab=medical' },
            { label: 'Vaccinations', href: '/dashboard/pet-owner/health?tab=vaccinations' },
            { label: 'Prescriptions', href: '/dashboard/pet-owner/health?tab=prescriptions' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-[#ec6d13]/10 hover:text-[#a94d07]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Upcoming appointments</h2>
            <Link
              href="/dashboard/pet-owner/appointments"
              className="text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
            >
              View all →
            </Link>
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
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map((appt) => (
                <li key={appt.id}>
                  <Link
                    href={`/dashboard/pet-owner/appointments/${appt.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-[#ec6d13]/30 hover:bg-orange-50/50"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{appt.doctor_name}</p>
                      <p className="truncate text-sm text-gray-500">
                        {appt.specialization}
                        {appt.pet_name ? ` · ${appt.pet_name}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="font-medium text-gray-800">{formatApptDate(appt.appointment_date)}</p>
                      <p className="text-gray-500">{appt.appointment_time}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 shadow-sm ${
        accent
          ? 'border-[#ec6d13]/20 bg-gradient-to-br from-orange-50 to-white'
          : 'border-gray-100 bg-white'
      }`}
    >
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
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
