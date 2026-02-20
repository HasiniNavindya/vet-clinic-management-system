'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';

interface Pet {
  id: number;
  pet_name: string;
  species: string;
  breed: string;
  age_or_dob: string;
  gender: string;
  vaccination_status: string;
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
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(15);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Protect this route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || !isAuthenticated) return;

      try {
        const response = await fetch('http://localhost:5000/api/user/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token]);

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
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#ec6d13] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🐾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CARLISLE</h1>
                <p className="text-xs text-gray-500">Pet Care</p>
              </div>
            </div>
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
              <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName}!</h2>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboardData?.stats.visits || 0}</h3>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboardData?.stats.yearsOfService || 0}</h3>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboardData?.stats.favouriteDoctors || 0}</h3>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboardData?.stats.vetcoins || 0}</h3>
              <p className="text-sm text-gray-500">Vetcoins</p>
            </div>
          </div>

          {/* Chart - Only show if user has pets */}
          {dashboardData?.pets && dashboardData.pets.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Statistics of your pet health</h3>
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
              <h3 className="text-xl font-bold text-gray-900">Treatment & Appointments</h3>
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

            <div className="grid grid-cols-4 gap-4">
              {[
                { date: 'July 10, 15:30', doctor: 'Maria Petrova', specialization: 'Allergist', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80' },
                { date: 'July 05, 12:00', doctor: 'Jim Lucada', specialization: 'Therapist', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' },
                { date: 'July 10, 15:30', doctor: 'Damon Last', specialization: 'Surgeon', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80' },
                { date: 'June 12, 18:30', doctor: 'Olga Niko', specialization: 'Nutritionist', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80' },
              ].map((appointment, i) => (
                <div key={i} className={`rounded-2xl p-4 ${i === 0 ? 'bg-[#ec6d13] text-white' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-4 ${i === 0 ? 'text-white/90' : 'text-gray-500'}`}>{appointment.date}</p>
                  <img src={appointment.image} alt={appointment.doctor} className="w-16 h-16 rounded-full object-cover mb-3" />
                  <p className={`font-semibold mb-1 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>Doctor:</p>
                  <p className={`text-sm mb-2 ${i === 0 ? 'text-white' : 'text-gray-700'}`}>{appointment.doctor}</p>
                  <p className={`font-semibold mb-1 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>Specialization:</p>
                  <p className={`text-sm mb-4 ${i === 0 ? 'text-white' : 'text-gray-700'}`}>{appointment.specialization}</p>
                  <div className="flex gap-2">
                    <button className={`flex-1 py-2 rounded-lg text-xs font-semibold ${i === 0 ? 'bg-white/20 text-white' : 'bg-[#ec6d13] text-white'}`}>
                      Inference
                    </button>
                    <button className={`p-2 rounded-lg ${i === 0 ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white min-h-screen p-6 border-l border-gray-200">
          {/* Pet Profile */}
          {dashboardData?.pets && dashboardData.pets.length > 0 ? (
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80" alt="Pet" className="w-20 h-20 rounded-full object-cover mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">{dashboardData.pets[0].pet_name}</h3>
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Pet Added</h3>
              <p className="text-sm text-gray-500 mb-4">Add your pet information to get personalized care</p>
              <Link href="/register" className="inline-block bg-[#ec6d13] hover:bg-[#d65e0f] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                Add Pet
              </Link>
            </div>
          )}

          {/* Calendar */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-4">March</h4>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-xs text-gray-500 font-medium">{day}</div>
              ))}
              {[14, 15, 16, 17, 18, 19, 20].map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`p-2 rounded-lg text-sm font-medium ${
                    date === selectedDate ? 'bg-[#ec6d13] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-xl p-4 ${i === 1 ? 'bg-[#ec6d13] text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 1 ? 'bg-white/20' : 'bg-[#ec6d13]/10'}`}>
                    <svg className={`w-5 h-5 ${i === 1 ? 'text-white' : 'text-[#ec6d13]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${i === 1 ? 'text-white' : 'text-gray-900'}`}>Cardiologist</p>
                    <p className={`text-sm ${i === 1 ? 'text-white/90' : 'text-gray-500'}`}>09:00</p>
                    <p className={`text-xs ${i === 1 ? 'text-white/80' : 'text-gray-400'}`}>Dr. Linda Johns (Lab 205)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Book Appointment Button */}
          <Link href="/login" className="block w-full bg-[#ec6d13] hover:bg-[#d65e0f] text-white py-4 rounded-xl font-semibold transition-all duration-300 text-center">
            Book appointment
          </Link>
        </aside>
      </div>
    </div>
  );
}
