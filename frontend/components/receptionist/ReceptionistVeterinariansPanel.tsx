'use client';

import { useEffect, useMemo, useState } from 'react';
import VeterinarianCard from '@/components/receptionist/VeterinarianCard';
import { DoctorProfile, fetchDoctorProfiles, uniqueSpecializations } from '@/lib/doctors';

export default function ReceptionistVeterinariansPanel() {
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
    <div>
      <p className="font-sans text-xl font-semibold text-gray-900">Veterinarians</p>
      <p className="mt-0.5 text-sm text-gray-500">
        View profiles, weekly availability, and appointments for each veterinarian
      </p>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-gray-700">Filter by specialty</p>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpecialty(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
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

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
          No veterinarians match this filter.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doctor) => (
            <VeterinarianCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
