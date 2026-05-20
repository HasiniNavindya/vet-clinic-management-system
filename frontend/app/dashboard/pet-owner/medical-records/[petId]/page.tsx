'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import MedicalTimeline from '@/components/health/MedicalTimeline';
import { fetchPetTimeline, PetTimeline } from '@/lib/medicalRecords';

export default function PetHistoryTimelinePage() {
  const params = useParams();
  const petId = Number(params.petId);
  const { token } = useAuth();
  const [data, setData] = useState<PetTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !petId) return;
    fetchPetTimeline(token, petId).then((res) => {
      if (!res.ok) {
        setError((res.data as { error?: string }).error || 'Failed to load');
      } else {
        setData(res.data);
      }
      setLoading(false);
    });
  }, [token, petId]);

  return (
    <PetOwnerShell>
      <Link href="/dashboard/pet-owner/health?tab=medical" className="text-sm font-medium text-[#ec6d13]">
        ← Pet Health
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
        {data?.petName || 'Pet'} — History timeline
      </h1>
      <p className="mt-1 text-gray-600">Complete medical history in chronological order</p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : (
        <div className="mt-8">
          <MedicalTimeline records={data?.timeline || []} />
        </div>
      )}
    </PetOwnerShell>
  );
}
