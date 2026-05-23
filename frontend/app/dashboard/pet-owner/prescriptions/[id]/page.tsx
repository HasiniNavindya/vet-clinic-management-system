'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import {
  fetchPrescription,
  formatIssuedDate,
  prescriptionDocumentUrl,
  Prescription,
  PrescriptionMedicine,
} from '@/lib/prescriptions';

export default function PrescriptionDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const [rx, setRx] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchPrescription(token, params.id as string).then((res) => {
      if (!res.ok) {
        setError((res.data as { error?: string }).error || 'Not found');
      } else {
        setRx(res.data);
      }
      setLoading(false);
    });
  }, [token, params.id]);

  const docUrl = prescriptionDocumentUrl(rx?.documentUrl);

  return (
    <PetOwnerShell>
      <Link href="/dashboard/pet-owner/health?tab=prescriptions" className="text-sm font-medium text-[#ec6d13]">
        ← Pet Health
      </Link>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : rx ? (
        <DetailContent rx={rx} docUrl={docUrl} />
      ) : null}
    </PetOwnerShell>
  );
}

function DetailContent({ rx, docUrl }: { rx: Prescription; docUrl: string | null }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-gray-900">{rx.prescriptionNumber}</h1>
          <p className="mt-1 text-gray-600">
            {rx.petName} · {formatIssuedDate(rx.issuedDate)}
            {rx.doctorName ? ` · Dr. ${rx.doctorName}` : ''}
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-800">
          {rx.status}
        </span>
      </div>

      {rx.diagnosisSummary ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-sm font-bold uppercase text-gray-500">Diagnosis</h2>
          <p className="mt-2 text-gray-800">{rx.diagnosisSummary}</p>
        </section>
      ) : null}

      {rx.generalInstructions ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-sm font-bold uppercase text-gray-500">Instructions</h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-800">{rx.generalInstructions}</p>
        </section>
      ) : null}

      {rx.medicines && rx.medicines.length > 0 ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-4 text-sm font-bold uppercase text-gray-500">Medicines</h2>
          <ul className="space-y-4">
            {rx.medicines.map((m) => (
              <MedicineItem key={m.id} medicine={m} />
            ))}
          </ul>
        </section>
      ) : null}

      {docUrl ? (
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#ec6d13] px-5 py-3 font-semibold text-white hover:bg-[#d65e0f]"
        >
          View / download digital prescription
        </a>
      ) : null}
    </div>
  );
}

function MedicineItem({ medicine: m }: { medicine: PrescriptionMedicine }) {
  return (
    <li className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <p className="font-semibold text-gray-900">{m.medicineName}</p>
      <div className="mt-1 grid gap-1 text-sm text-gray-600 sm:grid-cols-3">
        {m.dosage ? <span>Dosage: {m.dosage}</span> : null}
        {m.frequency ? <span>Frequency: {m.frequency}</span> : null}
        {m.duration ? <span>Duration: {m.duration}</span> : null}
      </div>
      {m.instructions ? <p className="mt-2 text-sm text-gray-700">{m.instructions}</p> : null}
    </li>
  );
}
