'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { API_BASE_URL, authHeaders } from '@/lib/api';

type SettingsTab = 'profile' | 'preferences' | 'security';

export default function LegacySettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const [selectedTab, setSelectedTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    emergencyContact: '',
  });

  const [preferences, setPreferences] = useState({
    vaccinationReminders: true,
    appointmentUpdates: true,
    emailNotifications: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
      });
    }
  }, [isAuthenticated, isLoading, router, user]);

  const handleProfileUpdate = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({
          fullName: profileData.fullName,
          mobileNumber: profileData.mobileNumber,
          address: profileData.address,
          emergencyContact: profileData.emergencyContact,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) return;
    if (security.newPassword !== security.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password');
      setSuccessMessage('Password changed successfully!');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const dashboardBack =
    user?.role === 'receptionist'
      ? '/dashboard/receptionist'
      : user?.role === 'admin'
        ? '/dashboard/admin'
        : user?.role === 'doctor'
          ? '/dashboard/doctor'
          : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-sans text-xl font-semibold text-gray-900">Settings</p>
            <p className="mt-0.5 text-sm text-gray-500">Manage your account and preferences</p>
          </div>
          <Link
            href={dashboardBack}
            className="flex items-center gap-2 text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
          >
            ← Back to dashboard
          </Link>
        </div>

        {successMessage ? (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-1 border-b border-gray-200">
          {(
            [
              { id: 'profile' as const, label: 'Profile' },
              { id: 'preferences' as const, label: 'Notifications' },
              { id: 'security' as const, label: 'Security' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTab(t.id)}
              className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
                selectedTab === t.id
                  ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {selectedTab === 'profile' ? (
            <div className="space-y-5">
              <p className="font-sans text-base font-semibold text-gray-900">Profile information</p>
              <LegacyField label="Full name">
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className={inputClass}
                />
              </LegacyField>
              <LegacyField label="Email address">
                <input type="email" value={profileData.email} disabled className={`${inputClass} bg-gray-50`} />
              </LegacyField>
              <LegacyField label="Mobile number">
                <input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                  className={inputClass}
                />
              </LegacyField>
              <LegacyField label="Address">
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </LegacyField>
              <LegacyField label="Emergency contact">
                <input
                  type="text"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                  className={inputClass}
                />
              </LegacyField>
              <button
                type="button"
                onClick={handleProfileUpdate}
                disabled={isSaving}
                className="rounded-lg bg-[#ec6d13] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          ) : null}

          {selectedTab === 'preferences' ? (
            <div className="space-y-5">
              <p className="font-sans text-base font-semibold text-gray-900">Notification preferences</p>
              <Toggle
                title="Vaccination reminders"
                description="In-app alerts when vaccinations are due"
                checked={preferences.vaccinationReminders}
                onChange={(v) => setPreferences({ ...preferences, vaccinationReminders: v })}
              />
              <Toggle
                title="Appointment updates"
                description="In-app alerts for booking status changes"
                checked={preferences.appointmentUpdates}
                onChange={(v) => setPreferences({ ...preferences, appointmentUpdates: v })}
              />
              <Toggle
                title="Email notifications"
                description="Also receive reminders and updates by email"
                checked={preferences.emailNotifications}
                onChange={(v) => setPreferences({ ...preferences, emailNotifications: v })}
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsSaving(true);
                  setTimeout(() => {
                    setSuccessMessage('Preferences updated successfully!');
                    setIsSaving(false);
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }, 500);
                }}
                className="rounded-lg bg-[#ec6d13] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          ) : null}

          {selectedTab === 'security' ? (
            <div className="space-y-5">
              <p className="font-sans text-base font-semibold text-gray-900">Change password</p>
              <LegacyField label="Current password">
                <input
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  className={inputClass}
                />
              </LegacyField>
              <LegacyField label="New password">
                <input
                  type="password"
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  className={inputClass}
                />
              </LegacyField>
              <LegacyField label="Confirm new password">
                <input
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  className={inputClass}
                />
              </LegacyField>
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="rounded-lg bg-[#ec6d13] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
              >
                {isSaving ? 'Updating…' : 'Update password'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#ec6d13] focus:outline-none focus:ring-2 focus:ring-[#ec6d13]/20';

function LegacyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#ec6d13] peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}
