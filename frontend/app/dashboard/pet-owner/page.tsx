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

function PetOwnerDashboardPage() {
  const router = useRouter();
  const { token, user, isAuthenticated, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<OwnerPet | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-gray-50">
        <Header />

        <section className="pt-28 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] p-8 text-white shadow-2xl sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,109,19,0.28),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_32%)]" />
              <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">Pet Owner Portal</p>
                  <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Manage your profile and pets in one place.</h1>
                  <p className="max-w-2xl text-base text-white/80 sm:text-lg">Register pets, edit their details, review the pet list, and keep your contact information current.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/settings" className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition-colors hover:bg-orange-50">Profile Settings</Link>
                  <button onClick={() => setIsAddPetOpen(true)} className="rounded-xl bg-[#ec6d13] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#d65e0f]">Add Pet</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { label: 'Pets', value: pets.length },
              { label: 'Visits', value: dashboardData?.stats.visits ?? 0 },
              { label: 'Account age', value: `${dashboardData?.stats.yearsOfService ?? 0} yrs` },
              { label: 'Vet coins', value: dashboardData?.stats.vetcoins ?? 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-2 text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-14">
          <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="space-y-6 xl:col-span-2">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
                    <p className="mt-1 text-sm text-gray-600">Add, inspect, and update your pets here.</p>
                  </div>
                  <button onClick={() => setIsAddPetOpen(true)} className="rounded-xl bg-[#ec6d13] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]">Add New Pet</button>
                </div>

                {pets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="mb-2 font-semibold text-gray-900">No pets added yet</p>
                    <p className="mb-4 text-sm text-gray-600">Create your first pet profile to start managing records.</p>
                    <button onClick={() => setIsAddPetOpen(true)} className="rounded-xl bg-[#ec6d13] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]">Add Pet</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {pets.map((pet) => (
                      <article key={pet.id} className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{pet.pet_name}</h3>
                            <p className="text-sm text-gray-600">{pet.species || 'Unknown species'}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                          </div>
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-[#a94d07]">{pet.vaccination_status || 'No status'}</span>
                        </div>

                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <dt className="text-gray-500">Gender</dt>
                            <dd className="font-medium text-gray-900">{pet.gender || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Age / DOB</dt>
                            <dd className="font-medium text-gray-900">{pet.age_or_dob || '—'}</dd>
                          </div>
                        </dl>

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

            <aside className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Profile Snapshot</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Full name</p>
                    <p className="font-medium text-gray-900">{dashboardData?.user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="break-all font-medium text-gray-900">{dashboardData?.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mobile</p>
                    <p className="font-medium text-gray-900">{dashboardData?.user.mobileNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{dashboardData?.user.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Emergency contact</p>
                    <p className="font-medium text-gray-900">{dashboardData?.user.emergencyContact || 'Not provided'}</p>
                  </div>
                </div>
                <Link href="/dashboard/settings" className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">Open Profile Settings</Link>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-xl font-bold text-gray-900">Next Steps</h2>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>1. Keep your contact details current in Settings.</li>
                  <li>2. Add one entry per pet so records stay separate.</li>
                  <li>3. Use Edit to update age, breed, or vaccination status.</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

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