'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchClinicDoctor,
  fetchDoctorScheduleSample,
  patchClinicDoctor,
  type AdminClinicDoctor,
} from '@/lib/adminClinicDoctors';

const DAY_OPTS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminDoctorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const doctorId =
    typeof rawId === 'string' ? Number(rawId) : Array.isArray(rawId) ? Number(rawId[0]) : NaN;

  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [doctor, setDoctor] = useState<AdminClinicDoctor | null>(null);
  const [slots, setSlots] = useState<
    { id: number; appointment_date: string; appointment_time: string; status: string }[]
  >([]);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [daysPick, setDaysPick] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: string) => {
    setDaysPick((prev) =>
      prev.includes(d)
        ? prev.filter((x) => x !== d)
        : [...prev, d].sort((a, b) => DAY_OPTS.indexOf(a) - DAY_OPTS.indexOf(b))
    );
  };

  const load = useCallback(async () => {
    if (!token || !Number.isFinite(doctorId)) return;
    setLoading(true);
    setError('');
    try {
      const [dRes, sch] = await Promise.all([
        fetchClinicDoctor(token, doctorId),
        fetchDoctorScheduleSample(token, doctorId),
      ]);
      const d = dRes.doctor;
      setDoctor(d);
      setName(d.name);
      setSpecialization(d.specialization);
      setEmail(d.email || '');
      setPhone(d.phone || '');
      setBio(d.bio || '');
      setDaysPick(Array.isArray(d.available_days) ? [...d.available_days] : []);
      setSlots(sch.slots);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [token, doctorId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token && Number.isFinite(doctorId)) load();
  }, [isAuthenticated, hasRole, token, doctorId, load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !doctor) return;
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const r = await patchClinicDoctor(token, doctor.id, {
        name: name.trim(),
        specialization: specialization.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        available_days: daysPick,
      });
      setDoctor(r.doctor);
      setMsg(r.message || 'Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  if (!Number.isFinite(doctorId)) {
    return (
      <div>
        <p className="text-red-600">Invalid doctor id.</p>
        <Link href="/dashboard/admin/users?tab=veterinarians">Back</Link>
      </div>
    );
  }

  return (
    <div>
        <Link href="/dashboard/admin/users?tab=veterinarians" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Veterinarians
        </Link>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : doctor ? (
          <>
            <h1 className="mt-2 text-gray-900">{doctor.name}</h1>
            <p className="text-gray-600">{doctor.specialization}</p>

            {doctor.linkedUser ? (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
                Linked login:{' '}
                <strong>{doctor.linkedUser.email}</strong> — status{' '}
                <strong>{doctor.linkedUser.accountStatus}</strong>. Suspend or reactivate via{' '}
                <Link
                  href={`/dashboard/admin/users/${doctor.linkedUser.id}`}
                  className="font-semibold text-[#ec6d13] hover:underline"
                >
                  user record
                </Link>
                .
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                No account is linked yet. Approved veterinarians from applications receive a linkage automatically when
                you approve them.
              </div>
            )}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            {msg ? <p className="mt-4 text-sm text-green-700">{msg}</p> : null}

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-gray-900">Clinic-visible profile</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Name</label>
                    <input
                      required
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Specialization</label>
                    <input
                      required
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase text-gray-500">Email</label>
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
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 w-full rounded-lg bg-[#ec6d13] py-2.5 text-sm font-bold text-white hover:bg-[#d65e0f] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </form>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-gray-900">Recent schedule snapshot</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upcoming and recent bookings for this veterinarian (past week through next slots).
                </p>
                <ul className="mt-4 max-h-[420px] space-y-2 overflow-auto text-sm">
                  {slots.length === 0 ? (
                    <li className="text-gray-500">No appointments in this window.</li>
                  ) : (
                    slots.map((s) => (
                      <li
                        key={s.id}
                        className="flex justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <span>
                          {s.appointment_date} {s.appointment_time}
                        </span>
                        <span className="font-medium capitalize text-gray-700">{s.status}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-8 text-gray-700">Doctor not found.</p>
        )}
    </div>
  );
}
