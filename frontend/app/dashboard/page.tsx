'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, isAuthFailure } from '@/lib/api';
import Header from '@/components/layout/Header';
import SiteLogo from '@/components/layout/SiteLogo';
import AddPetModal from '@/components/dashboard/AddPetModal';
import BookAppointmentModal from '@/components/dashboard/BookAppointmentModal';

interface Pet {
  id: number;
  pet_name: string;
  species: string;
  breed: string;
  age_or_dob: string;
  gender: string;
  vaccination_status: string;
}

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  specialization: string;
  doctor_image: string;
  pet_name?: string;
  status: string;
}

interface DashboardData {
  user: {
    id: number;
    email: string;
    fullName: string;
    mobileNumber?: string;
    address?: string;
    role: string;
    createdAt: string;
  };
  pets: Pet[];
  stats: {
    visits: number;
    yearsOfService: number;
    favouriteDoctors: number;
    vetcoins: number;
  };
  upcomingAppointments: Appointment[];
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token, logout, hasRole } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isBookAppointmentModalOpen, setIsBookAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAppointmentDetailModal, setShowAppointmentDetailModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Protect this route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.role === 'admin') {
      router.replace('/dashboard/admin');
      return;
    }
    if (isAuthenticated && user?.role === 'user') {
      router.replace('/dashboard/pet-owner');
      return;
    }
    if (isAuthenticated && user?.role === 'doctor') {
      router.replace('/dashboard/doctor');
      return;
    }
    if (isAuthenticated && user?.role === 'staff') {
      router.replace('/dashboard/calendar');
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!token || !isAuthenticated) return;

    try {
      setDataLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else if (isAuthFailure(response.status)) {
        logout();
        router.push('/login');
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.role) {
      setDataLoading(false);
      return;
    }
    // This route redirects every role elsewhere; skip pet-owner API (admin/doctor/staff would get 403).
    if (['user', 'admin', 'doctor', 'staff'].includes(user.role)) {
      setDataLoading(false);
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, token, user?.role]);

  const handlePetAdded = () => {
    fetchDashboardData();
  };

  const handleAppointmentBooked = () => {
    fetchDashboardData();
  };

  const handleViewAppointmentDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetailModal(true);
  };

  const handleAppointmentAction = async (appointmentId: number, action: 'confirmed' | 'rejected' | 'rescheduled') => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action })
      });

      if (response.ok) {
        setShowAppointmentDetailModal(false);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

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
    if (!date || !dashboardData?.upcomingAppointments) return false;
    return dashboardData.upcomingAppointments.some(apt => {
      const aptDate = new Date(apt.appointment_date);
      return isSameDay(date, aptDate);
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarDays = getDaysInMonth(currentMonth);

  // Show loading state while checking authentication
  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ec6d13] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const chartData = [65, 45, 70, 55, 85, 60, 75, 50, 65, 80, 90, 75];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-28">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-[calc(100vh-112px)] p-6 border-r border-gray-200 flex flex-col fixed left-0 top-28 overflow-y-auto">
          <div className="mb-6 flex justify-center">
            <SiteLogo href="/" height={88} />
          </div>

          {/* User Profile Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#ec6d13] flex items-center justify-center text-white font-bold text-2xl mb-3">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{user?.fullName}</h3>
              <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
              <Link href="/dashboard/settings" className="mt-3 text-xs text-[#ec6d13] hover:text-[#d65e0f] font-semibold">
                Edit Profile →
              </Link>
            </div>
          </div>

          <nav className="space-y-2 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#ec6d13] text-white rounded-lg font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </Link>
            <Link href="/dashboard/doctors" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Doctors
            </Link>
            <Link href="/dashboard/payments" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payments
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            {hasRole('admin') && (
              <>
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Admin home
                </Link>
                <Link
                  href="/dashboard/admin/users"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  User management
                </Link>
                <Link
                  href="/dashboard/admin/doctor-applications"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Doctor applications
                </Link>
              </>
            )}
          </nav>

          <div className="mt-auto pt-6">
            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Need Help?</p>
              <p className="text-xs text-gray-600">Open our help center</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#ec6d13] text-white rounded-lg font-semibold hover:bg-[#d65e0f] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 ml-64">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-gray-900">Welcome, {user?.fullName}!</h2>
              <p className="text-gray-600 mt-1">Here's your overview</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Today <span className="font-semibold">March, 15</span></span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#ec6d13]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-900 mb-1">{dashboardData?.stats.visits || 0}</h3>
              <p className="text-sm text-gray-500">Visits</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#ec6d13]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-900 mb-1">{dashboardData?.stats.yearsOfService || 0}</h3>
              <p className="text-sm text-gray-500">Years of service</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#ec6d13]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-900 mb-1">{dashboardData?.stats.favouriteDoctors || 0}</h3>
              <p className="text-sm text-gray-500">Favourite doctors</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#ec6d13]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-900 mb-1">{dashboardData?.stats.vetcoins || 0}</h3>
              <p className="text-sm text-gray-500">Vetcoins</p>
            </div>
          </div>

          {/* Chart - Only show if user has pets */}
          {dashboardData?.pets && dashboardData.pets.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-gray-900 mb-6">Statistics of your pet health</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                  const chartData = [65, 45, 70, 55, 85, 60, 75, 50, 65, 80, 90, 75];
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-linear-to-t from-[#ec6d13]/30 to-[#ec6d13]/10 rounded-t-lg transition-all hover:from-[#ec6d13]/40 hover:to-[#ec6d13]/20"
                        style={{ height: `${chartData[i]}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900">Treatment & Appointments</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {dashboardData.upcomingAppointments.slice(0, 4).map((appointment, i) => (
                  <div key={appointment.id} className={`rounded-2xl p-4 ${i === 0 ? 'bg-[#ec6d13] text-white' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-4 ${i === 0 ? 'text-white/90' : 'text-gray-500'}`}>
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {appointment.appointment_time}
                    </p>
                    <img 
                      src={appointment.doctor_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80'} 
                      alt={appointment.doctor_name} 
                      className="w-16 h-16 rounded-full object-cover mb-3" 
                    />
                    <p className={`font-semibold mb-1 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>Doctor:</p>
                    <p className={`text-sm mb-2 ${i === 0 ? 'text-white' : 'text-gray-700'}`}>{appointment.doctor_name}</p>
                    <p className={`font-semibold mb-1 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>Specialization:</p>
                    <p className={`text-sm mb-4 ${i === 0 ? 'text-white' : 'text-gray-700'}`}>{appointment.specialization}</p>
                    {appointment.pet_name && (
                      <>
                        <p className={`font-semibold mb-1 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>Pet:</p>
                        <p className={`text-sm mb-4 ${i === 0 ? 'text-white' : 'text-gray-700'}`}>{appointment.pet_name}</p>
                      </>
                    )}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewAppointmentDetails(appointment)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold ${i === 0 ? 'bg-white/20 text-white' : 'bg-[#ec6d13] text-white'}`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <button 
                  onClick={() => setIsBookAppointmentModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#ec6d13] text-white rounded-lg hover:bg-[#d65e0f] transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white min-h-screen p-6 border-l border-gray-200">
          {/* Pet Profile */}
          {dashboardData?.pets && dashboardData.pets.length > 0 ? (
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80" alt="Pet" className="w-20 h-20 rounded-full object-cover mb-4" />
              <h3 className="text-gray-900 mb-1">{dashboardData.pets[0].pet_name}</h3>
              <p className="text-sm text-gray-500 mb-4">Pet ID: {dashboardData.pets[0].id}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {dashboardData.pets[0].species && (
                  <div>
                    <p className="text-gray-500 mb-1">Type:</p>
                    <p className="font-semibold text-gray-900">{dashboardData.pets[0].species}</p>
                  </div>
                )}
                {dashboardData.pets[0].gender && (
                  <div>
                    <p className="text-gray-500 mb-1">Sex:</p>
                    <p className="font-semibold text-gray-900">{dashboardData.pets[0].gender}</p>
                  </div>
                )}
                {dashboardData.pets[0].age_or_dob && (
                  <div>
                    <p className="text-gray-500 mb-1">Age:</p>
                    <p className="font-semibold text-gray-900">{dashboardData.pets[0].age_or_dob}</p>
                  </div>
                )}
                {dashboardData.pets[0].breed && (
                  <div>
                    <p className="text-gray-500 mb-1">Breed:</p>
                    <p className="font-semibold text-gray-900">{dashboardData.pets[0].breed}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-gray-900 mb-2">No Pet Added</h3>
              <p className="text-sm text-gray-500 mb-4">Add your pet information to get personalized care</p>
              <button 
                onClick={() => setIsAddPetModalOpen(true)}
                className="inline-block bg-[#ec6d13] hover:bg-[#d65e0f] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Add Pet
              </button>
            </div>
          )}

          {/* Calendar */}
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">{getMonthName(currentMonth)}</h4>
              <div className="flex gap-1">
                <button 
                  onClick={goToPreviousMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={goToNextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const isCurrentDay = isToday(date);
                const isSelected = isSameDay(date, selectedDate);
                const hasApt = hasAppointment(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all relative
                      ${isSelected ? 'bg-[#ec6d13] text-white shadow-md' : ''}
                      ${!isSelected && isCurrentDay ? 'bg-[#ec6d13]/10 text-[#ec6d13] font-bold' : ''}
                      ${!isSelected && !isCurrentDay ? 'text-gray-700 hover:bg-gray-100' : ''}
                    `}
                  >
                    {date.getDate()}
                    {hasApt && (
                      <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-[#ec6d13]'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ec6d13]"></div>
                <span className="text-gray-600">Has appointment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ec6d13]/20"></div>
                <span className="text-gray-600">Today</span>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-3 mb-6">
            {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
              dashboardData.upcomingAppointments.slice(0, 3).map((appointment, i) => (
                <div key={appointment.id} className={`rounded-xl p-4 ${i === 0 ? 'bg-[#ec6d13] text-white' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-white/20' : 'bg-[#ec6d13]/10'}`}>
                      <svg className={`w-5 h-5 ${i === 0 ? 'text-white' : 'text-[#ec6d13]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${i === 0 ? 'text-white' : 'text-gray-900'}`}>{appointment.specialization}</p>
                      <p className={`text-sm ${i === 0 ? 'text-white/90' : 'text-gray-500'}`}>{appointment.appointment_time}</p>
                      <p className={`text-xs ${i === 0 ? 'text-white/80' : 'text-gray-400'}`}>{appointment.doctor_name}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm">No upcoming appointments</p>
              </div>
            )}
          </div>

          {/* Book Appointment Button */}
          <button 
            onClick={() => setIsBookAppointmentModalOpen(true)}
            className="block w-full bg-[#ec6d13] hover:bg-[#d65e0f] text-white py-4 rounded-xl font-semibold transition-all duration-300 text-center"
          >
            Book appointment
          </button>
        </aside>
      </div>

      {/* Modals */}
      <AddPetModal 
        isOpen={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        onSuccess={handlePetAdded}
        token={token || ''}
      />

      <BookAppointmentModal 
        isOpen={isBookAppointmentModalOpen}
        onClose={() => setIsBookAppointmentModalOpen(false)}
        onSuccess={handleAppointmentBooked}
        token={token || ''}
        pets={dashboardData?.pets || []}
        selectedDoctorId={null}
      />

      {/* Appointment Detail Modal */}
      {showAppointmentDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAppointmentDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#ec6d13] to-[#d65e0f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="mb-1">Appointment Request</h2>
                  <p className="text-white/90">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowAppointmentDetailModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Doctor Info */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                {selectedAppointment.doctor_image && (
                  <img 
                    src={selectedAppointment.doctor_image} 
                    alt={selectedAppointment.doctor_name}
                    className="w-20 h-20 rounded-xl object-cover ring-4 ring-orange-100"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">
                    {selectedAppointment.doctor_name}
                  </h3>
                  <p className="text-[#ec6d13] font-semibold mb-2">
                    {selectedAppointment.specialization}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      selectedAppointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : selectedAppointment.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : selectedAppointment.status === 'rescheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedAppointment.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <p className="text-gray-900">{selectedAppointment.appointment_time}</p>
                </div>

                {selectedAppointment.pet_name && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="text-sm font-medium">Pet</span>
                    </div>
                    <p className="text-gray-900">{selectedAppointment.pet_name}</p>
                  </div>
                )}
              </div>

              {/* Patient Notes */}
              {selectedAppointment.notes && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">Patient Notes</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {selectedAppointment.status === 'scheduled' || !selectedAppointment.status ? (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Awaiting Response</h4>
                      <p className="text-sm text-gray-700">This appointment request is pending doctor's approval</p>
                    </div>
                  </div>
                </div>
              ) : selectedAppointment.status === 'confirmed' ? (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Confirmed</h4>
                      <p className="text-sm text-gray-700">Your appointment has been confirmed by the doctor</p>
                    </div>
                  </div>
                </div>
              ) : selectedAppointment.status === 'rejected' ? (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Rejected</h4>
                      <p className="text-sm text-gray-700">Unfortunately, this appointment couldn't be accommodated</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer - Doctor Actions */}
            {(selectedAppointment.status === 'scheduled' || !selectedAppointment.status) && (
              <div className="p-6 bg-gray-50 rounded-b-2xl">
                <p className="text-sm text-gray-600 mb-4 text-center">Doctor Actions</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleAppointmentAction(selectedAppointment.id, 'confirmed')}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept
                  </button>
                  <button
                    onClick={() => handleAppointmentAction(selectedAppointment.id, 'rescheduled')}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleAppointmentAction(selectedAppointment.id, 'rejected')}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
