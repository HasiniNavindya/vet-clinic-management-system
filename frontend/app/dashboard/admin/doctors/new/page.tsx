'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import { createClinicDoctor } from '@/lib/adminClinicDoctors';

const DAY_OPTS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminNewDoctorPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [daysPick, setDaysPick] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  const toggleDay = (d: string) => {
    setDaysPick((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(
        (a, b) => DAY_OPTS.indexOf(a) - DAY_OPTS.indexOf(b)
      )
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const { doctor } = await createClinicDoctor(token, {
        name: name.trim(),
        specialization: specialization.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        available_days: daysPick.length ? daysPick : undefined,
      });
      router.push(`/dashboard/admin/doctors/${doctor.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin/doctors" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← All doctors
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Add doctor profile</h1>
        <p className="text-sm text-gray-600">
          Creates a public veterinarian card only. For staff who need login, use{' '}
          <Link href="/dashboard/admin/doctor-applications" className="font-semibold text-[#ec6d13] hover:underline">
            doctor applications
          </Link>{' '}
          or promote a user in{' '}
          <Link href="/dashboard/admin/users" className="font-semibold text-[#ec6d13] hover:underline">
            user management
          </Link>
          .
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Display name *</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Specialization *</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500">Public email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500">Phone</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Bio</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Available weekdays</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAY_OPTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    daysPick.includes(d)
                      ? 'bg-[#ec6d13] text-white'
                      : 'border border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#ec6d13] py-3 text-sm font-bold text-white hover:bg-[#d65e0f] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Create profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
