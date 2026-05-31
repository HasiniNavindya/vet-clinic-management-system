'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

type Doctor = {
  id: number;
  name: string;
  specialization: string;
  image_url?: string;
  available_days?: string[];
  bio?: string;
};

export default function ReceptionistDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/doctors`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setDoctors)
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-gray-900">Doctor schedules & availability</h1>
      <p className="mt-1 text-sm text-gray-600">
        View veterinarian profiles and weekly availability for scheduling assistance
      </p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {doctors.map((d) => (
            <article
              key={d.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-bold text-gray-900">{d.name}</h2>
              <p className="text-sm text-[#ec6d13]">{d.specialization}</p>
              {d.available_days && d.available_days.length > 0 ? (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold">Available: </span>
                  {d.available_days.join(', ')}
                </p>
              ) : (
                <p className="mt-3 text-sm text-gray-500">Availability not listed</p>
              )}
              {d.bio ? <p className="mt-2 text-sm text-gray-600 line-clamp-3">{d.bio}</p> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
