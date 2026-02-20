'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const appointments = [
    { date: 15, time: '09:00', doctor: 'Dr. Linda Johns', type: 'Cardiologist', status: 'confirmed' },
    { date: 18, time: '14:30', doctor: 'Dr. Sarah Smith', type: 'General Check-up', status: 'pending' },
    { date: 22, time: '11:00', doctor: 'Dr. Mike Johnson', type: 'Vaccination', status: 'confirmed' },
  ];

  const getAppointmentForDate = (day: number) => {
    return appointments.find(apt => apt.date === day);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar & Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your pet's appointments</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-[#ec6d13] hover:text-[#d65e0f] font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const appointment = getAppointmentForDate(day);
                  const isToday = day === 15; // Simulating today as 15th
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                        isToday
                          ? 'bg-[#ec6d13] text-white'
                          : appointment
                          ? 'bg-orange-50 text-[#ec6d13] border-2 border-[#ec6d13]'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{day}</span>
                      {appointment && (
                        <span className="w-1 h-1 rounded-full bg-current mt-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h3>
              <div className="space-y-3">
                {appointments.map((apt, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      index === 0 ? 'bg-[#ec6d13] text-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-semibold ${
                        index === 0 ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {monthNames[currentDate.getMonth()]} {apt.date}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        apt.status === 'confirmed'
                          ? index === 0 ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className={`font-bold mb-1 ${
                      index === 0 ? 'text-white' : 'text-gray-900'
                    }`}>
                      {apt.type}
                    </p>
                    <p className={`text-sm ${
                      index === 0 ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {apt.time} - {apt.doctor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/login" className="block w-full bg-[#ec6d13] hover:bg-[#d65e0f] text-white py-4 rounded-xl font-semibold transition-all duration-300 text-center">
              Book New Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
