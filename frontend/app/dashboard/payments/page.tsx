'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState('history');

  const paymentHistory = [
    {
      id: 1,
      date: 'March 10, 2026',
      service: 'General Check-up',
      doctor: 'Dr. Linda Johns',
      amount: 150.00,
      status: 'paid',
      method: 'Credit Card'
    },
    {
      id: 2,
      date: 'February 28, 2026',
      service: 'Vaccination',
      doctor: 'Dr. Sarah Smith',
      amount: 85.00,
      status: 'paid',
      method: 'PayPal'
    },
    {
      id: 3,
      date: 'February 15, 2026',
      service: 'Dental Cleaning',
      doctor: 'Dr. Mike Johnson',
      amount: 200.00,
      status: 'paid',
      method: 'Credit Card'
    },
    {
      id: 4,
      date: 'January 20, 2026',
      service: 'Surgery Consultation',
      doctor: 'Dr. Emily Chen',
      amount: 300.00,
      status: 'pending',
      method: 'Pending'
    },
  ];

  const upcomingPayments = [
    {
      id: 1,
      date: 'March 25, 2026',
      service: 'Follow-up Appointment',
      doctor: 'Dr. Linda Johns',
      amount: 100.00,
      dueIn: '10 days'
    },
    {
      id: 2,
      date: 'April 05, 2026',
      service: 'Annual Check-up',
      doctor: 'Dr. Sarah Smith',
      amount: 180.00,
      dueIn: '21 days'
    },
  ];

  const totalPaid = paymentHistory
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = paymentHistory
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">Manage your payment history and upcoming bills</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-[#ec6d13] hover:text-[#d65e0f] font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Total Paid</p>
            <h3 className="text-3xl font-bold">${totalPaid.toFixed(2)}</h3>
          </div>

          <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Pending</p>
            <h3 className="text-3xl font-bold">${totalPending.toFixed(2)}</h3>
          </div>

          <div className="bg-linear-to-br from-[#ec6d13] to-[#d65e0f] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Upcoming</p>
            <h3 className="text-3xl font-bold">${totalUpcoming.toFixed(2)}</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('history')}
              className={`pb-3 px-4 font-semibold transition-all ${
                selectedTab === 'history'
                  ? 'text-[#ec6d13] border-b-2 border-[#ec6d13]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`pb-3 px-4 font-semibold transition-all ${
                selectedTab === 'upcoming'
                  ? 'text-[#ec6d13] border-b-2 border-[#ec6d13]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Payments
            </button>
          </div>

          {/* Payment History Tab */}
          {selectedTab === 'history' && (
            <div className="space-y-4">
              {paymentHistory.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      payment.status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{payment.service}</h4>
                      <p className="text-sm text-gray-600">{payment.doctor}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{payment.method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Payments Tab */}
          {selectedTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ec6d13]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{payment.service}</h4>
                      <p className="text-sm text-gray-600">{payment.doctor}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-[#ec6d13] font-semibold">Due in {payment.dueIn}</p>
                    <button className="mt-2 px-4 py-1 bg-[#ec6d13] hover:bg-[#d65e0f] text-white text-xs font-semibold rounded-lg transition-all">
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#ec6d13] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Visa ending in 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Default
                </span>
              </div>
            </div>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#ec6d13] transition-all">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold">Add Payment Method</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
