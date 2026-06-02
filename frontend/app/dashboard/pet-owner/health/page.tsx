'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import PetAvatar from '@/components/pet-owner/PetAvatar';
import PetHealthPicker, { type HealthPet } from '@/components/pet-owner/health/PetHealthPicker';
import VaccinationStatusBadge from '@/components/health/VaccinationStatusBadge';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { fetchMedicalRecords, formatVisitDate, MedicalRecord } from '@/lib/medicalRecords';
import {
  fetchVaccinationDashboard,
  fetchVaccinationReminders,
  fetchVaccinations,
  formatDueDate,
  Vaccination,
  VaccinationDashboard,
  VaccinationReminders,
} from '@/lib/vaccinations';
import { fetchPrescriptions, formatIssuedDate, Prescription } from '@/lib/prescriptions';

type HealthTab = 'medical' | 'vaccinations' | 'prescriptions';
type VaccinationTab = 'upcoming' | 'overdue' | 'history';

const TABS: { id: HealthTab; label: string }[] = [
  { id: 'medical', label: 'Medical records' },
  { id: 'vaccinations', label: 'Vaccinations' },
  { id: 'prescriptions', label: 'Prescriptions' },
];

function parseTab(value: string | null): HealthTab {
  if (value === 'vaccinations' || value === 'prescriptions') return value;
  return 'medical';
}

function useOwnerPets(token: string | null) {
  const [pets, setPets] = useState<HealthPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/pets`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [token]);

  const petById = useMemo(
    () => Object.fromEntries(pets.map((p) => [p.id, p])) as Record<number, HealthPet>,
    [pets]
  );

  return { pets, petById, loading };
}

export default function PetHealthPage() {
  return (
    <Suspense
      fallback={
        <PetOwnerShell>
          <LoadingSpinner />
        </PetOwnerShell>
      }
    >
      <PetHealthContent />
    </Suspense>
  );
}

function PetHealthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));

  const setTab = useCallback(
    (next: HealthTab) => {
      router.replace(`/dashboard/pet-owner/health?tab=${next}`, { scroll: false });
    },
    [router]
  );

  return (
    <PetOwnerShell>
      <div className="mb-5">
        <p className="font-sans text-xl font-semibold text-gray-900">Pet health</p>
        <p className="mt-0.5 text-sm text-gray-500">
          Medical records, vaccinations, and prescriptions for your pets
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'medical' ? <MedicalPanel /> : null}
      {tab === 'vaccinations' ? <VaccinationsPanel /> : null}
      {tab === 'prescriptions' ? <PrescriptionsPanel /> : null}
    </PetOwnerShell>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
    </div>
  );
}

function MedicalPanel() {
  const { token } = useAuth();
  const { pets, petById, loading: petsLoading } = useOwnerPets(token);
  const [selectedPetId, setSelectedPetId] = useState<number | ''>('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pets.length > 0 && selectedPetId === '') {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchMedicalRecords(token, selectedPetId ? Number(selectedPetId) : undefined).then((res) => {
      if (res.ok) setRecords(res.data);
      setLoading(false);
    });
  }, [token, selectedPetId]);

  return (
    <section>
      {petsLoading ? <LoadingSpinner /> : <PetHealthPicker pets={pets} value={selectedPetId} onChange={setSelectedPetId} showAll={false} />}

      {selectedPetId ? (
        <Link
          href={`/dashboard/pet-owner/medical-records/${selectedPetId}`}
          className="mb-5 inline-flex text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
        >
          View full timeline →
        </Link>
      ) : null}

      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <EmptyState message="No medical records yet. Your veterinarian will add visit history after consultations." />
      ) : (
        <div className="space-y-4">
          {records.map((r) => {
            const pet = petById[r.petId];
            return (
              <article
                key={r.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-4 border-b border-gray-50 bg-gray-50/60 p-4 sm:p-5">
                  <PetAvatar
                    name={r.petName || pet?.pet_name || 'Pet'}
                    imageUrl={pet?.image_url}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-base font-semibold text-gray-900">
                      {r.petName || pet?.pet_name}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">{formatVisitDate(r.visitDate)}</p>
                    {r.doctorName ? (
                      <p className="mt-1 text-sm text-gray-500">Dr. {r.doctorName}</p>
                    ) : null}
                  </div>
                  <Link
                    href={`/dashboard/pet-owner/medical-records/${r.petId}`}
                    className="text-sm font-medium text-[#ec6d13] hover:text-[#d65e0f]"
                  >
                    Timeline
                  </Link>
                </div>
                <dl className="space-y-4 p-4 sm:p-5">
                  {r.diagnosis ? (
                    <DetailBlock label="Diagnosis" value={r.diagnosis} />
                  ) : null}
                  {r.treatment ? (
                    <DetailBlock label="Treatment" value={r.treatment} />
                  ) : null}
                  {r.consultationNotes ? (
                    <DetailBlock label="Consultation notes" value={r.consultationNotes} />
                  ) : null}
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function VaccinationsPanel() {
  const { token } = useAuth();
  const { pets, petById } = useOwnerPets(token);
  const [vaxTab, setVaxTab] = useState<VaccinationTab>('upcoming');
  const [dashboard, setDashboard] = useState<VaccinationDashboard | null>(null);
  const [reminders, setReminders] = useState<VaccinationReminders | null>(null);
  const [list, setList] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      const [dashRes, remRes, listRes] = await Promise.all([
        fetchVaccinationDashboard(token),
        fetchVaccinationReminders(token),
        fetchVaccinations(token, { filter: vaxTab }),
      ]);
      if (dashRes.ok) setDashboard(dashRes.data);
      if (remRes.ok) setReminders(remRes.data);
      if (listRes.ok) setList(listRes.data);
      setLoading(false);
    };
    load();
  }, [token, vaxTab]);

  return (
    <section>
      {dashboard ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={dashboard.total} />
          <StatCard label="Completed" value={dashboard.completed} />
          <StatCard label="Overdue" value={dashboard.overdue.length} highlight="red" />
          <StatCard label="Due today" value={dashboard.dueToday.length} highlight="orange" />
        </div>
      ) : null}

      {reminders && reminders.active.length > 0 ? (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <p className="font-sans text-base font-semibold text-gray-900">Vaccination reminders</p>
          <p className="mt-0.5 text-sm text-gray-600">
            Alerts when vaccines are due within {reminders.reminderDaysBefore} days
          </p>
          <ul className="mt-4 space-y-3">
            {reminders.active.map((r) => {
              const pet = petById[r.petId];
              return (
                <li key={`${r.vaccinationId}-${r.reminderType}`} className="rounded-xl bg-white p-3 shadow-sm">
                  <div className="flex gap-3">
                    <PetAvatar name={r.petName} imageUrl={pet?.image_url} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">{r.petName}</span>
                        <VaccinationStatusBadge status={r.status} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-800">{r.vaccineName}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{r.message}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {(['upcoming', 'overdue', 'history'] as VaccinationTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setVaxTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              vaxTab === t ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : list.length === 0 ? (
        <EmptyState message="No vaccinations in this category." />
      ) : (
        <div className="space-y-3">
          {list.map((v) => {
            const pet = petById[v.petId];
            return (
              <div
                key={v.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <PetAvatar name={v.petName || pet?.pet_name || 'Pet'} imageUrl={pet?.image_url} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-semibold text-gray-900">
                    {v.petName} — {v.vaccineName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Due {formatDueDate(v.dueDate)}
                    {v.administeredDate ? ` · Given ${formatDueDate(v.administeredDate)}` : ''}
                  </p>
                  {v.notes ? <p className="mt-2 text-sm leading-relaxed text-gray-700">{v.notes}</p> : null}
                  {v.doctorName ? (
                    <p className="mt-1 text-xs text-gray-500">Recorded by Dr. {v.doctorName}</p>
                  ) : null}
                </div>
                <VaccinationStatusBadge status={v.status} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PrescriptionsPanel() {
  const { token } = useAuth();
  const { pets, petById } = useOwnerPets(token);
  const [petId, setPetId] = useState<number | ''>('');
  const [list, setList] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchPrescriptions(token, petId ? Number(petId) : undefined).then((res) => {
      if (res.ok) setList(res.data);
      setLoading(false);
    });
  }, [token, petId]);

  return (
    <section>
      <PetHealthPicker pets={pets} value={petId} onChange={setPetId} />

      {loading ? (
        <LoadingSpinner />
      ) : list.length === 0 ? (
        <EmptyState message="No prescriptions on file yet." />
      ) : (
        <div className="space-y-3">
          {list.map((rx) => {
            const pet = petById[rx.petId];
            return (
              <Link
                key={rx.id}
                href={`/dashboard/pet-owner/prescriptions/${rx.id}`}
                className="block rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-orange-100 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start gap-4 p-4 sm:p-5">
                  <PetAvatar name={rx.petName || pet?.pet_name || 'Pet'} imageUrl={pet?.image_url} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-sans text-sm font-semibold text-gray-900">{rx.prescriptionNumber}</p>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-green-800">
                        {rx.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {rx.petName || pet?.pet_name} · {formatIssuedDate(rx.issuedDate)}
                      {rx.doctorName ? ` · Dr. ${rx.doctorName}` : ''}
                    </p>
                    {rx.diagnosisSummary ? (
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        <span className="font-medium text-gray-900">Summary: </span>
                        {rx.diagnosisSummary}
                      </p>
                    ) : null}
                    {rx.generalInstructions ? (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{rx.generalInstructions}</p>
                    ) : null}
                  </div>
                  <span className="text-sm font-medium text-[#ec6d13]">View details →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-gray-800">{value}</dd>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
      {message}
    </p>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: 'red' | 'orange';
}) {
  const ring =
    highlight === 'red'
      ? 'ring-red-200 bg-red-50'
      : highlight === 'orange'
        ? 'ring-orange-200 bg-orange-50'
        : 'ring-gray-100 bg-white';
  return (
    <div className={`rounded-xl p-4 shadow-sm ring-1 ${ring}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-sans text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
