'use client';

import { useEffect, useMemo, useState } from 'react';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import DoctorCard from '@/components/pet-owner/DoctorCard';
import {
  DoctorProfile,
  fetchDoctorProfiles,
  uniqueSpecializations,
} from '@/lib/doctors';

export default function PetOwnerDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [specialty, setSpecialty] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorProfiles().then((res) => {
      if (res.ok) setDoctors(res.data);
      else setError('Failed to load veterinarians');
      setLoading(false);
    });
  }, []);

  const specialties = useMemo(() => uniqueSpecializations(doctors), [doctors]);

  const filtered = useMemo(() => {
    if (specialty === 'All') return doctors;
    return doctors.filter((d) => d.specialization === specialty);
  }, [doctors, specialty]);

  return (
    <PetOwnerShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Our Veterinarians</h1>
        <p className="mt-1 max-w-2xl text-gray-600">
          Browse doctor profiles, see availability, and book an appointment with the specialist that
          fits your pet&apos;s needs.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-gray-700">Filter by specialty</p>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpecialty(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                specialty === s
                  ? 'bg-[#ec6d13] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl bg-white p-10 text-center text-gray-600">
          No veterinarians match this filter.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </PetOwnerShell>
  );
}
