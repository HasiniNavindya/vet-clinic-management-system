'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import VaccinationStatusBadge from '@/components/health/VaccinationStatusBadge';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { fetchMedicalRecords, MedicalRecord } from '@/lib/medicalRecords';
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

type Pet = { id: number; pet_name: string };
type HealthTab = 'medical' | 'vaccinations' | 'prescriptions';
type VaccinationTab = 'upcoming' | 'overdue' | 'history';

const TABS: { id: HealthTab; label: string }[] = [
  { id: 'medical', label: 'Medical Records' },
  { id: 'vaccinations', label: 'Vaccinations' },
  { id: 'prescriptions', label: 'Prescriptions' },
];

function parseTab(value: string | null): HealthTab {
  if (value === 'vaccinations' || value === 'prescriptions') return value;
  return 'medical';
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
      <div className="mb-6">
        <h1 className="text-gray-900">Pet Health</h1>
        <p className="mt-1 text-gray-600">Medical records, vaccinations, and prescriptions</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-1">
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
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | ''>('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/pets`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setPets(list);
        if (list.length > 0) setSelectedPetId(list[0].id);
      });
  }, [token]);

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
      <PetSelect pets={pets} value={selectedPetId} onChange={setSelectedPetId} label="Select pet" />

      {selectedPetId ? (
        <Link
          href={`/dashboard/pet-owner/medical-records/${selectedPetId}`}
          className="mb-6 inline-flex text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
        >
          View full timeline →
        </Link>
      ) : null}

      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-600">
          No medical records yet. Your veterinarian will add visit history after consultations.
        </p>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {r.petName} · {new Date(r.visitDate).toLocaleDateString()}
                  </p>
                  {r.doctorName ? <p className="text-sm text-gray-600">Dr. {r.doctorName}</p> : null}
                </div>
                <Link
                  href={`/dashboard/pet-owner/medical-records/${r.petId}`}
                  className="text-sm font-medium text-[#ec6d13]"
                >
                  Timeline
                </Link>
              </div>
              {r.diagnosis ? (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold">Diagnosis:</span> {r.diagnosis}
                </p>
              ) : null}
              {r.treatment ? (
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Treatment:</span> {r.treatment}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function VaccinationsPanel() {
  const { token } = useAuth();
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
        <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-gray-900">Vaccination reminders</h3>
          <p className="mt-1 text-sm text-gray-600">
            Automated alerts when vaccines are due within {reminders.reminderDaysBefore} days
          </p>
          <ul className="mt-4 space-y-2">
            {reminders.active.map((r) => (
              <li
                key={`${r.vaccinationId}-${r.reminderType}`}
                className="rounded-lg bg-white p-3 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{r.petName}</span>
                  <VaccinationStatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-gray-700">{r.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
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
        <p className="rounded-xl bg-white p-8 text-center text-gray-600">
          No vaccinations in this category.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((v) => (
            <div
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {v.petName} — {v.vaccineName}
                </p>
                <p className="text-sm text-gray-600">
                  Due {formatDueDate(v.dueDate)}
                  {v.administeredDate ? ` · Given ${formatDueDate(v.administeredDate)}` : ''}
                </p>
              </div>
              <VaccinationStatusBadge status={v.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PrescriptionsPanel() {
  const { token } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState<number | ''>('');
  const [list, setList] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/pets`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => setPets(Array.isArray(data) ? data : []));
  }, [token]);

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
      <PetSelect pets={pets} value={petId} onChange={setPetId} label="Filter by pet" />

      {loading ? (
        <LoadingSpinner />
      ) : list.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-600">
          No prescriptions on file yet.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((rx) => (
            <Link
              key={rx.id}
              href={`/dashboard/pet-owner/prescriptions/${rx.id}`}
              className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{rx.prescriptionNumber}</p>
                  <p className="text-sm text-gray-600">
                    {rx.petName} · {formatIssuedDate(rx.issuedDate)}
                    {rx.doctorName ? ` · Dr. ${rx.doctorName}` : ''}
                  </p>
                  {rx.diagnosisSummary ? (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-700">{rx.diagnosisSummary}</p>
                  ) : null}
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-green-800">
                  {rx.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function PetSelect({
  pets,
  value,
  onChange,
  label,
}: {
  pets: Pet[];
  value: number | '';
  onChange: (v: number | '') => void;
  label: string;
}) {
  return (
    <div className="mb-6 max-w-xs">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
      >
        <option value="">All pets</option>
        {pets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.pet_name}
          </option>
        ))}
      </select>
    </div>
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
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}
