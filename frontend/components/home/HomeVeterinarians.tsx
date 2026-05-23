'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchDoctorProfiles, type DoctorProfile } from '@/lib/doctors';
import SectionHeader from '@/components/home/SectionHeader';

const FALLBACK_VETS: DoctorProfile[] = [
  {
    id: 1,
    name: 'Dr. Emily Chen',
    specialization: 'Dermatologist',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
    bio: '10+ years in skin and coat health for dogs and cats.',
    availableDays: [],
  },
  {
    id: 2,
    name: 'Dr. Sarah Smith',
    specialization: 'Surgeon',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
    bio: 'Soft-tissue and routine surgical care with a focus on recovery.',
    availableDays: [],
  },
  {
    id: 3,
    name: 'Dr. Linda Johns',
    specialization: 'Cardiologist',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    bio: 'Heart health assessments and long-term cardiac monitoring.',
    availableDays: [],
  },
];

export default function HomeVeterinarians() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>(FALLBACK_VETS);

  useEffect(() => {
    fetchDoctorProfiles().then((res) => {
      if (res.ok && res.data.length > 0) {
        setDoctors(res.data.slice(0, 4));
      }
    });
  }, []);

  return (
    <section className="bg-gray-50 py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Meet Our Veterinarians"
          subtitle="Licensed specialists dedicated to your pet’s health and comfort."
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doc) => (
            <article
              key={doc.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={
                    doc.imageUrl ||
                    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80'
                  }
                  alt={doc.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900">{doc.name}</h3>
                <p className="mt-1 text-sm font-semibold text-[#ec6d13]">{doc.specialization}</p>
                {doc.bio ? <p className="mt-2 line-clamp-2 text-sm text-gray-600">{doc.bio}</p> : null}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/login?role=user"
            className="inline-flex rounded-lg bg-[#ec6d13] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#d65e0f]"
          >
            Book with a veterinarian
          </Link>
        </div>
      </div>
    </section>
  );
}
