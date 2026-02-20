'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialties = ['All', 'Cardiologist', 'Surgeon', 'Therapist', 'Nutritionist', 'Allergist', 'Dermatologist'];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Linda Johns',
      specialty: 'Cardiologist',
      experience: '15 years',
      rating: 4.9,
      reviews: 284,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      available: true,
      nextAvailable: 'Today, 09:00 AM'
    },
    {
      id: 2,
      name: 'Dr. Sarah Smith',
      specialty: 'Surgeon',
      experience: '12 years',
      rating: 4.8,
      reviews: 198,
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
      available: true,
      nextAvailable: 'Tomorrow, 02:00 PM'
    },
    {
      id: 3,
      name: 'Dr. Jim Lucada',
      specialty: 'Therapist',
      experience: '10 years',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
      available: false,
      nextAvailable: 'March 20, 10:00 AM'
    },
    {
      id: 4,
      name: 'Dr. Maria Petrova',
      specialty: 'Allergist',
      experience: '8 years',
      rating: 4.9,
      reviews: 223,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      available: true,
      nextAvailable: 'Today, 03:00 PM'
    },
    {
      id: 5,
      name: 'Dr. Mike Johnson',
      specialty: 'Nutritionist',
      experience: '7 years',
      rating: 4.6,
      reviews: 134,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
      available: true,
      nextAvailable: 'Tomorrow, 11:00 AM'
    },
    {
      id: 6,
      name: 'Dr. Emily Chen',
      specialty: 'Dermatologist',
      experience: '9 years',
      rating: 4.8,
      reviews: 176,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      available: true,
      nextAvailable: 'Today, 01:00 PM'
    },
  ];

  const filteredDoctors = selectedSpecialty === 'All' 
    ? doctors 
    : doctors.filter(doc => doc.specialty === selectedSpecialty);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Our Veterinarians</h1>
            <p className="text-gray-600 mt-1">Find the perfect specialist for your pet</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-[#ec6d13] hover:text-[#d65e0f] font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Specialty Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Specialty</h3>
          <div className="flex flex-wrap gap-3">
            {specialties.map(specialty => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  selectedSpecialty === specialty
                    ? 'bg-[#ec6d13] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
              <div className="relative">
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="w-full h-64 object-cover"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  doctor.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {doctor.available ? 'Available' : 'Busy'}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                <p className="text-[#ec6d13] font-semibold mb-3">{doctor.specialty}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{doctor.rating}</span>
                    <span>({doctor.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{doctor.experience}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Next Available</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.nextAvailable}</p>
                </div>

                <div className="flex gap-2">
                  <Link href="/login" className="flex-1 bg-[#ec6d13] hover:bg-[#d65e0f] text-white py-3 rounded-lg font-semibold transition-all text-center">
                    Book Appointment
                  </Link>
                  <button className="p-3 border-2 border-gray-200 hover:border-[#ec6d13] rounded-lg transition-all">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
