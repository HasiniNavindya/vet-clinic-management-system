'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BookAppointmentModal from '@/components/dashboard/BookAppointmentModal';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/lib/appointments';

interface Pet {
  id: number;
  pet_name: string;
  species: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>('');

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      fetchAppointments(token);
      fetchPets(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        headers: authHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pets`, {
        headers: authHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setPets(data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleAppointmentBooked = () => {
    if (authToken) {
      fetchAppointments(authToken);
    }
  };

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

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
  };

  const handleDateClick = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    if (dayAppointments.length > 0) {
      setSelectedAppointment(dayAppointments[0]);
      setShowDetailModal(true);
    }
    setSelectedDate(date);
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 5);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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
          <Link href="/dashboard/appointments/manage" className="mr-4 flex items-center gap-2 font-semibold text-[#ec6d13] hover:text-[#d65e0f]">
            Manage queue
          </Link>
          <Link href="/dashboard/health/manage" className="mr-4 flex items-center gap-2 font-semibold text-[#ec6d13] hover:text-[#d65e0f]">
            Health records
          </Link>
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
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dayAppointments = getAppointmentsForDate(date);
                  const hasAppointment = dayAppointments.length > 0;
                  const isTodayDate = isToday(date);
                  const isSelected = selectedDate && 
                    date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear();
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(date)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative group ${
                        isSelected
                          ? 'bg-[#ec6d13] text-white shadow-lg scale-105'
                          : isTodayDate
                          ? 'bg-orange-100 text-[#ec6d13] border-2 border-[#ec6d13] font-bold'
                          : hasAppointment
                          ? 'bg-orange-50 text-[#ec6d13] hover:bg-orange-100 cursor-pointer'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-base">{day}</span>
                      {hasAppointment && (
                        <>
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            isSelected ? 'bg-white' : 'bg-[#ec6d13]'
                          }`}></span>
                          <div className="absolute -top-1 -right-1 bg-[#ec6d13] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                            {dayAppointments.length}
                          </div>
                        </>
                      )}
                      {hasAppointment && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {dayAppointments.length} appointment{dayAppointments.length > 1 ? 's' : ''}
                        </div>
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
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec6d13]"></div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt, index) => {
                    const aptDate = new Date(apt.appointmentDate);
                    return (
                      <button
                        key={apt.id}
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowDetailModal(true);
                        }}
                        className={`w-full text-left p-4 rounded-xl transition-all hover:shadow-md ${
                          index === 0 ? 'bg-gradient-to-br from-[#ec6d13] to-[#d65e0f] text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-semibold ${
                            index === 0 ? 'text-white/90' : 'text-gray-500'
                          }`}>
                            {monthNames[aptDate.getMonth()]} {aptDate.getDate()}, {aptDate.getFullYear()}
                          </span>
                          <AppointmentStatusBadge
                            status={apt.status as AppointmentStatus}
                            className={index === 0 ? '!bg-white/20 !text-white' : ''}
                          />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          {apt.doctorImage && (
                            <img 
                              src={apt.doctorImage} 
                              alt={apt.doctorName}
                              className={`w-10 h-10 rounded-full object-cover ${
                                index === 0 ? 'ring-2 ring-white/50' : 'ring-2 ring-gray-200'
                              }`}
                            />
                          )}
                          <div className="flex-1">
                            <p className={`font-bold ${
                              index === 0 ? 'text-white' : 'text-gray-900'
                            }`}>
                              {apt.doctorName}
                            </p>
                            <p className={`text-sm ${
                              index === 0 ? 'text-white/90' : 'text-gray-600'
                            }`}>
                              {apt.specialization}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-4 text-sm ${
                          index === 0 ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apt.appointmentTime}
                          </span>
                          {apt.petName && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              {apt.petName}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowBookModal(true)}
              className="block w-full bg-[#ec6d13] hover:bg-[#d65e0f] text-white py-4 rounded-xl font-semibold transition-all duration-300 text-center shadow-lg hover:shadow-xl"
            >
              Book New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#ec6d13] to-[#d65e0f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Appointment Details</h2>
                  <p className="text-white/90">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
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
                {selectedAppointment.doctorImage && (
                  <img 
                    src={selectedAppointment.doctorImage} 
                    alt={selectedAppointment.doctorName}
                    className="w-20 h-20 rounded-xl object-cover ring-4 ring-orange-100"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedAppointment.doctorName}
                  </h3>
                  <p className="text-[#ec6d13] font-semibold mb-2">
                    {selectedAppointment.specialization}
                  </p>
                  <div className="flex items-center gap-2">
                    <AppointmentStatusBadge status={selectedAppointment.status as AppointmentStatus} />
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
                  <p className="text-lg font-bold text-gray-900">{selectedAppointment.appointmentTime}</p>
                </div>

                {selectedAppointment.petName && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="text-sm font-medium">Pet</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedAppointment.petName}</p>
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
                      <h4 className="font-bold text-gray-900 mb-1">Your Notes</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor's Notes */}
              {selectedAppointment.doctorNotes && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-[#ec6d13]/20">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#ec6d13] text-white rounded-lg p-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Doctor's Notes</h4>
                      <p className="text-gray-800 leading-relaxed font-medium">{selectedAppointment.doctorNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {!selectedAppointment.doctorNotes && (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">No doctor's notes yet</p>
                  <p className="text-sm">Notes will appear here after your appointment</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Close
              </button>
              <button
                className="flex-1 px-6 py-3 bg-[#ec6d13] hover:bg-[#d65e0f] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        onSuccess={handleAppointmentBooked}
        token={authToken}
        pets={pets}
        selectedDoctorId={null}
      />
    </div>
  );
}
