'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import {
  Appointment,
  AppointmentStatus,
  fetchAppointmentMeta,
  fetchAppointments,
  formatAppointmentDate,
  formatTime,
  groupAppointmentsByPet,
  resolvePetImageUrl,
  StatusMeta,
  statusLabel,
} from '@/lib/appointments';

export default function PetOwnerAppointmentsList() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statuses, setStatuses] = useState<StatusMeta[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [petImageById, setPetImageById] = useState<Record<number, string>>({});

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    const [listRes, metaRes, petsRes] = await Promise.all([
      fetchAppointments(token, filter || undefined),
      fetchAppointmentMeta(token),
      fetch(`${API_BASE_URL}/api/pets`, { headers: authHeaders(token) }),
    ]);
    if (!listRes.ok) {
      setError((listRes.data as { error?: string }).error || 'Failed to load appointments');
      setAppointments([]);
    } else {
      setAppointments(listRes.data);
    }
    if (metaRes.ok) setStatuses(metaRes.data.statuses);
    if (petsRes.ok) {
      const pets = (await petsRes.json()) as Array<{ id: number; image_url?: string | null }>;
      const images: Record<number, string> = {};
      for (const pet of pets) {
        const url = resolvePetImageUrl(pet.image_url);
        if (url) images[pet.id] = url;
      }
      setPetImageById(images);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [token, filter]);

  const grouped = useMemo(() => groupAppointmentsByPet(appointments), [appointments]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-xl font-semibold text-gray-900">My appointments</p>
          <p className="mt-0.5 text-sm text-gray-500">Grouped by pet — tap a visit for full details</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/pet-owner/doctors"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Browse veterinarians
          </Link>
          <Link
            href="/dashboard/pet-owner/appointments/book"
            className="inline-flex items-center justify-center rounded-lg bg-[#ec6d13] px-3 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
          >
            New appointment
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip active={filter === ''} onClick={() => setFilter('')} label="All" />
        {statuses.map((s) => (
          <FilterChip
            key={s.id}
            active={filter === s.id}
            onClick={() => setFilter(s.id)}
            label={s.label}
          />
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
          <p className="text-sm font-medium text-gray-700">No appointments found</p>
          <p className="mt-1 text-xs text-gray-500">Book a visit for one of your pets</p>
          <Link
            href="/dashboard/pet-owner/appointments/book"
            className="mt-4 inline-block text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
          >
            Book appointment →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <section
              key={group.petId ?? `unassigned-${group.petName}`}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <header className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <PetGroupAvatar
                  petId={group.petId}
                  petName={group.petName}
                  imageUrl={
                    group.petId != null
                      ? petImageById[group.petId] || resolvePetImageUrl(group.petImage) || null
                      : null
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{group.petName}</p>
                  <p className="text-xs text-gray-500">
                    {group.petId == null
                      ? 'General visits · not tied to one pet'
                      : `${group.petSpecies ? `${group.petSpecies} · ` : ''}${group.appointments.length} appointment${group.appointments.length === 1 ? '' : 's'}`}
                  </p>
                </div>
              </header>

              <ul className="divide-y divide-gray-100">
                {group.appointments.map((apt) => (
                  <li key={apt.id}>
                    <Link
                      href={`/dashboard/pet-owner/appointments/${apt.id}`}
                      className="flex gap-3 px-4 py-3 transition hover:bg-orange-50/40"
                    >
                      <DateBlock dateStr={apt.appointmentDate} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatTime(apt.appointmentTime)}
                            <span className="font-normal text-gray-500">
                              {' '}
                              · Dr. {apt.doctorName || 'TBD'}
                            </span>
                          </p>
                          <AppointmentStatusBadge status={apt.status} />
                        </div>
                        {apt.specialization ? (
                          <p className="mt-0.5 text-xs text-gray-500">{apt.specialization}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-gray-600">
                          {formatAppointmentDate(apt.appointmentDate)}
                        </p>
                        {apt.confirmationMessage ? (
                          <p className="mt-2 line-clamp-2 text-xs leading-4 text-gray-500">
                            {apt.confirmationMessage}
                          </p>
                        ) : apt.staffResponseReason ? (
                          <p className="mt-2 line-clamp-2 text-xs leading-4 text-amber-800">
                            {apt.staffResponseReason}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-gray-400">{statusLabel(apt.status)}</p>
                        )}
                      </div>
                      <span className="shrink-0 self-center text-gray-300" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? 'bg-[#ec6d13] text-white'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function PetGroupAvatar({
  petId,
  petName,
  imageUrl,
}: {
  petId: number | null;
  petName: string;
  imageUrl: string | null;
}) {
  if (petId == null) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ec6d13]/15 text-sm font-bold text-[#c45f10]"
        title="Appointments not linked to a specific pet"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={petName}
        className="h-10 w-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ec6d13]/15 text-sm font-bold text-[#c45f10]">
      {petName.charAt(0).toUpperCase()}
    </div>
  );
}

function DateBlock({ dateStr }: { dateStr: string }) {
  const raw = String(dateStr || '').slice(0, 10);
  const d = new Date(`${raw}T12:00:00`);
  const day = Number.isNaN(d.getTime()) ? '—' : String(d.getDate());
  const month = Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-gray-100 bg-gray-50 py-1.5 text-center">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{month}</span>
      <span className="text-lg font-bold leading-none text-gray-900">{day}</span>
    </div>
  );
}
