'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';

type SettingsTab = 'profile' | 'notifications' | 'security';

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
];

export default function PetOwnerSettings() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('profile');
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
    if (!user || !token) return;
    setProfileData({
      fullName: user.fullName || '',
      email: user.email || '',
      mobileNumber: user.mobileNumber || '',
      address: user.address || '',
      emergencyContact: user.emergencyContact || '',
    });

    fetch(`${API_BASE_URL}/api/user/dashboard`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => {
        const prefs = data?.preferences;
        if (prefs) {
          setPreferences({
            vaccinationReminders: Boolean(prefs.vaccination_reminders ?? prefs.vaccinationReminders),
            appointmentUpdates: Boolean(prefs.appointment_updates ?? prefs.appointmentUpdates),
            emailNotifications: Boolean(prefs.email_notifications ?? prefs.emailNotifications),
          });
        }
      })
      .catch(() => {});
  }, [user, token]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

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
      showSuccess('Profile updated successfully.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({
          vaccinationReminders: preferences.vaccinationReminders,
          appointmentUpdates: preferences.appointmentUpdates,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update preferences');
      showSuccess('Notification preferences saved.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) return;
    if (security.newPassword !== security.confirmPassword) {
      alert('Passwords do not match.');
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
      showSuccess('Password changed successfully.');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <p className="font-sans text-xl font-semibold text-gray-900">Settings</p>
      <p className="mt-0.5 text-sm text-gray-500">Manage your account and preferences</p>

      {successMessage ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        {tab === 'profile' ? (
          <div className="space-y-5">
            <p className="font-sans text-base font-semibold text-gray-900">Profile information</p>
            <Field label="Full name">
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Email address">
              <input type="email" value={profileData.email} disabled className={`${inputClass} bg-gray-50`} />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed here.</p>
            </Field>
            <Field label="Mobile number">
              <input
                type="tel"
                value={profileData.mobileNumber}
                onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Address">
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </Field>
            <Field label="Emergency contact">
              <input
                type="text"
                value={profileData.emergencyContact}
                onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                className={inputClass}
              />
            </Field>
            <SaveButton onClick={handleProfileUpdate} saving={isSaving} label="Save profile" />
          </div>
        ) : null}

        {tab === 'notifications' ? (
          <div className="space-y-5">
            <p className="font-sans text-base font-semibold text-gray-900">Notification preferences</p>
            <p className="text-sm text-gray-600">
              Choose which updates appear in your notification center.
            </p>
            <ToggleRow
              title="Vaccination reminders"
              description="In-app alerts when vaccinations are due"
              checked={preferences.vaccinationReminders}
              onChange={(v) => setPreferences({ ...preferences, vaccinationReminders: v })}
            />
            <ToggleRow
              title="Appointment updates"
              description="Booking status, approvals, and schedule changes"
              checked={preferences.appointmentUpdates}
              onChange={(v) => setPreferences({ ...preferences, appointmentUpdates: v })}
            />
            <ToggleRow
              title="Email notifications"
              description="Also receive selected updates by email (when enabled)"
              checked={preferences.emailNotifications}
              onChange={(v) => setPreferences({ ...preferences, emailNotifications: v })}
            />
            <SaveButton onClick={handlePreferencesUpdate} saving={isSaving} label="Save preferences" />
          </div>
        ) : null}

        {tab === 'security' ? (
          <div className="space-y-5">
            <p className="font-sans text-base font-semibold text-gray-900">Change password</p>
            <Field label="Current password">
              <input
                type="password"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                className={inputClass}
                autoComplete="current-password"
              />
            </Field>
            <Field label="New password">
              <input
                type="password"
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                className={inputClass}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                className={inputClass}
                autoComplete="new-password"
              />
            </Field>
            <SaveButton onClick={handlePasswordChange} saving={isSaving} label="Update password" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-[#ec6d13] focus:outline-none focus:ring-2 focus:ring-[#ec6d13]/20';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function SaveButton({
  onClick,
  saving,
  label,
}: {
  onClick: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="w-full rounded-lg bg-[#ec6d13] py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50 sm:w-auto sm:px-8"
    >
      {saving ? 'Saving…' : label}
    </button>
  );
}

function ToggleRow({
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
