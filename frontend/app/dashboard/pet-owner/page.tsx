'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AddPetModal from '@/components/dashboard/AddPetModal';
import PetDetailModal, { type OwnerPet } from '@/components/pet-owner/PetDetailModal';
import EditPetModal from '@/components/pet-owner/EditPetModal';
import { API_BASE_URL, authHeaders } from '@/lib/api';

type DashboardData = {
  user: {
    id: number;
    email: string;
    fullName: string;
    mobileNumber?: string;
    address?: string;
    emergencyContact?: string;
    role: string;
    createdAt: string;
  };
  pets: OwnerPet[];
  preferences: {
    vaccination_reminders?: boolean;
    appointment_updates?: boolean;
  } | null;
  stats: {
    visits: number;
    yearsOfService: number;
    favouriteDoctors: number;
    vetcoins: number;
  };
  upcomingAppointments: Array<{
    id: number;
    appointment_date: string;
    appointment_time: string;
    doctor_name: string;
    specialization: string;
    pet_name?: string;
  }>;
};

// Helper function to construct proper image URL from backend
function getImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return `${API_BASE_URL}${imagePath}`;
  return imagePath;
}

function PetOwnerDashboardPage() {
  const router = useRouter();
  const { token, user, isAuthenticated, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<OwnerPet | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchDashboard = async () => {
    if (!token) return;

    setDataLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
        headers: authHeaders(token),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard');
      }

      setDashboardData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboard();
    }
  }, [isAuthenticated, token]);

  const pets = useMemo(() => dashboardData?.pets || [], [dashboardData]);
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const hasAppointment = (date: Date | null) => {
    if (!date || upcomingAppointments.length === 0) return false;
    return upcomingAppointments.some((appointment) => isSameDay(date, new Date(appointment.appointment_date)));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleOpenDetails = (pet: OwnerPet) => {
    setSelectedPet(pet);
    setDetailOpen(true);
  };

  const handleOpenEdit = (pet: OwnerPet) => {
    setSelectedPet(pet);
    setEditOpen(true);
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading pet owner portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const welcomeName = user?.fullName || dashboardData?.user.fullName || 'Pet Owner';
  const petCount = pets.length;
  const firstPet = pets && pets.length > 0 ? pets[0] : null;
  const firstPetImage = firstPet
    ? ((firstPet as any).image || (firstPet as any).photoUrl || (firstPet as any).avatar || (firstPet as any).image_url || null)
    : null;
  const userAvatar = (user as any)?.avatar || (dashboardData?.user as any)?.avatar || (user as any)?.avatar_url || (dashboardData?.user as any)?.avatar_url || null;

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex pt-28">
          <aside className="fixed left-0 top-28 h-[calc(100vh-112px)] w-64 flex flex-col overflow-y-auto border-r border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ec6d13]">
                <span className="text-xl font-bold text-white">PO</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CARLISLE</h1>
                <p className="text-xs text-gray-500">Pet Care</p>
              </div>
            </div>

              <div className="mb-6 border-b border-gray-200 pb-6">
              <div className="flex flex-col items-center text-center">
                {firstPetImage ? (
                  <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-sm">
                    <img src={firstPetImage} alt={firstPet?.pet_name || 'Pet image'} className="h-full w-full object-cover" />
                  </div>
                ) : userAvatar ? (
                  <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-sm">
                    <img src={userAvatar} alt={welcomeName} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#ec6d13] text-2xl font-bold text-white">
                    {welcomeName.charAt(0).toUpperCase()}
                  </div>
                )}

                <h3 className="text-sm font-bold text-gray-900">{welcomeName}</h3>
                <p className="mt-1 text-xs text-gray-500">{dashboardData?.user.email || user?.email}</p>
                <Link href="/dashboard/settings" className="mt-3 text-xs font-semibold text-[#ec6d13] hover:text-[#d65e0f]">
                  Edit Profile →
                </Link>
              </div>
            </div>

            <nav className="space-y-2 shrink-0">
              <Link href="/dashboard/pet-owner" className="flex items-center gap-3 rounded-lg bg-[#ec6d13] px-4 py-3 font-semibold text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <button onClick={() => setIsAddPetOpen(true)} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-600 hover:bg-gray-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Add Pet
              </button>
              <Link href="/dashboard/pet-owner/appointments/book" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-600 hover:bg-gray-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Appointment
              </Link>
              <Link href="/dashboard/pet-owner/appointments" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-600 hover:bg-gray-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Appointments
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-600 hover:bg-gray-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                Settings
              </Link>
            </nav>

            <div className="mt-auto pt-6">
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-900">Need Help?</p>
                <p className="text-xs text-gray-600">Open our help center</p>
              </div>
            </div>
          </aside>

          <main className="ml-64 flex-1 p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome, {welcomeName}!</h2>
                <p className="mt-1 text-gray-600">Here&apos;s your overview</p>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <span>Today <span className="font-semibold text-gray-700">{todayLabel}</span></span>
                <button className="rounded-lg p-2 hover:bg-gray-100">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-8 flex justify-center">
              <div className="w-full max-w-4xl grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ec6d13]/10">
                      <svg className="h-5 w-5 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">{dashboardData?.stats.visits || 0}</h3>
                  <p className="text-sm text-gray-500">Visits</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ec6d13]/10">
                      <svg className="h-5 w-5 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">{dashboardData?.stats.yearsOfService || 0}</h3>
                  <p className="text-sm text-gray-500">Years of service</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ec6d13]/10">
                      <svg className="h-5 w-5 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">{dashboardData?.stats.favouriteDoctors || 0}</h3>
                  <p className="text-sm text-gray-500">Favourite doctors</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ec6d13]/10">
                      <svg className="h-5 w-5 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">{dashboardData?.stats.vetcoins || 0}</h3>
                  <p className="text-sm text-gray-500">Vetcoins</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Treatment & Appointments</h3>
                    <div className="flex gap-2 text-gray-500">
                      <button onClick={goToPreviousMonth} className="rounded-lg p-2 hover:bg-gray-100">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button onClick={goToNextMonth} className="rounded-lg p-2 hover:bg-gray-100">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
                    {upcomingAppointments.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-600">No upcoming appointments</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingAppointments.slice(0, 4).map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                            <div>
                              <p className="font-semibold text-gray-900">{appointment.doctor_name}</p>
                              <p className="text-sm text-gray-500">{appointment.specialization}{appointment.pet_name ? ` · ${appointment.pet_name}` : ''}</p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>{new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                              <p>{appointment.appointment_time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900">My Pets</h4>
                    <button onClick={() => setIsAddPetOpen(true)} className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]">
                      + Add Pet
                    </button>
                  </div>

                  {pets.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                      <p className="font-semibold text-gray-900">No Pet Added</p>
                      <p className="mt-2 text-sm text-gray-500">Add your pet information to get personalized care</p>
                      <button onClick={() => setIsAddPetOpen(true)} className="mt-4 rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]">
                        Add Pet
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {pets.map((pet) => (
                        <article key={pet.id} className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
                          <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-4">
                                  {pet.image_url ? (
                                    <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-100 bg-white">
                                        <img src={getImageUrl(pet.image_url) || ''} alt={pet.pet_name} className="h-full w-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#ec6d13] text-white font-bold">{pet.pet_name?.charAt(0)}</div>
                                  )}
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">{pet.pet_name}</h3>
                                    <p className="text-sm text-gray-600">{pet.species || 'Unknown species'}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                                  </div>
                                </div>
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-[#a94d07]">{pet.vaccination_status || 'No status'}</span>
                              </div>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Gender</p>
                              <p className="font-medium text-gray-900">{pet.gender || '—'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Age / DOB</p>
                              <p className="font-medium text-gray-900">{pet.age_or_dob || '—'}</p>
                            </div>
                          </div>
                          <div className="mt-5 flex gap-2">
                            <button onClick={() => handleOpenDetails(pet)} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">View</button>
                            <button onClick={() => handleOpenEdit(pet)} className="flex-1 rounded-xl bg-[#ec6d13] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]">Edit</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex h-28 items-center justify-center rounded-2xl bg-gray-100 text-center">
                    {petCount === 0 ? (
                      <div>
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                          </svg>
                        </div>
                        <p className="text-lg font-bold text-gray-900">No Pet Added</p>
                        <p className="mt-1 text-sm text-gray-500">Add your pet information to get personalized care</p>
                        <button onClick={() => setIsAddPetOpen(true)} className="mt-4 rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]">Add Pet</button>
                      </div>
                      ) : (
                      <div className="flex items-center gap-4">
                        {firstPetImage && (
                          <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-100 bg-white">
                            <img src={firstPetImage} alt={firstPet?.pet_name || 'Pet'} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pets Added</p>
                          <p className="mt-2 text-4xl font-bold text-gray-900">{petCount}</p>
                          <p className="mt-1 text-sm text-gray-500">Managed pet profiles</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{monthLabel}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={goToPreviousMonth} className="rounded-lg p-2 hover:bg-gray-100">
                        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button onClick={goToNextMonth} className="rounded-lg p-2 hover:bg-gray-100">
                        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                      <div key={day} className="py-1">{day}</div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return <div key={`empty-${index}`} className="h-10 rounded-lg" />;
                      }

                      const isSelected = selectedDate && isSameDay(selectedDate, day);
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#ec6d13] text-white'
                              : isToday(day)
                                ? 'bg-orange-100 text-[#a94d07]'
                                : hasAppointment(day)
                                  ? 'bg-gray-900 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <AddPetModal
          isOpen={isAddPetOpen}
          onClose={() => setIsAddPetOpen(false)}
          onSuccess={fetchDashboard}
          token={token || ''}
        />

        <PetDetailModal
          isOpen={detailOpen}
          pet={selectedPet}
          onClose={() => {
            setDetailOpen(false);
            setSelectedPet(null);
          }}
        />

        <EditPetModal
          isOpen={editOpen}
          pet={selectedPet}
          onClose={() => {
            setEditOpen(false);
            setSelectedPet(null);
          }}
          onSuccess={fetchDashboard}
        />
      </div>
    </ProtectedRoute>
  );
}

export default PetOwnerDashboardPage;
