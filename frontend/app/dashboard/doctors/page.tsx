'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BookAppointmentModal from '@/components/dashboard/BookAppointmentModal';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  image_url: string;
  bio: string;
  available_days: string[];
}

interface Pet {
  id: number;
  pet_name: string;
  species: string;
}

export default function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>('');

  const specialties = ['All', 'Cardiologist', 'Surgeon', 'Therapist', 'Nutritionist', 'Allergist', 'Dermatologist'];

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      fetchPets(token);
    }
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/pets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleBookAppointment = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    setShowBookModal(true);
  };

  const handleAppointmentBooked = () => {
    // Optionally redirect to calendar or show success message
    setSelectedDoctor(null);
  };

  const filteredDoctors = selectedSpecialty === 'All' 
    ? doctors 
    : doctors.filter(doc => doc.specialization === selectedSpecialty);

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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ec6d13]"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No doctors found in this specialty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
              <div className="relative">
                <img 
                  src={doctor.image_url} 
                  alt={doctor.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                  Available
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                <p className="text-[#ec6d13] font-semibold mb-3">{doctor.specialization}</p>
                
                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {doctor.bio}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Available Days</p>
                  <div className="flex flex-wrap gap-1">
                    {doctor.available_days.map((day, idx) => (
                      <span key={idx} className="text-xs bg-white px-2 py-1 rounded font-medium text-gray-700">
                        {day.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBookAppointment(doctor.id)}
                    className="flex-1 bg-[#ec6d13] hover:bg-[#d65e0f] text-white py-3 rounded-lg font-semibold transition-all text-center"
                  >
                    Book Appointment
                  </button>
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
        )}
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => {
          setShowBookModal(false);
          setSelectedDoctor(null);
        }}
        onSuccess={handleAppointmentBooked}
        token={authToken}
        pets={pets}
        selectedDoctorId={selectedDoctor}
      />
    </div>
  );
}
