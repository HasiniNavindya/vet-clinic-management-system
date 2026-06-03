'use client';

import { useEffect, useMemo, useState } from 'react';
import DoctorPageHeader from '@/components/doctor/DoctorPageHeader';
import DoctorAppointmentCalendar from '@/components/doctor/DoctorAppointmentCalendar';
import DoctorVisitCard from '@/components/doctor/DoctorVisitCard';
import {
  Appointment,
  canDoctorAddConsultation,
  fetchAppointments,
  isDoctorVisibleAppointment,
} from '@/lib/appointments';
import { useAuth } from '@/context/AuthContext';

export default function DoctorAppointmentsPanel() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'finished'>('pending');

  useEffect(() => {
    if (!token) return;

    const load = () => {
      fetchAppointments(token).then((res) => {
        if (res.ok) {
          setAppointments(res.data.filter((a) => isDoctorVisibleAppointment(a.status)));
        }
        setLoading(false);
      });
    };

    load();

    const refresh = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [token]);

  const pending = useMemo(
    () =>
      appointments.filter((a) => canDoctorAddConsultation(a.status, a.hasMedicalRecord)),
    [appointments]
  );

  const finished = useMemo(
    () =>
      appointments.filter(
        (a) => a.hasMedicalRecord || a.status === 'completed'
      ),
    [appointments]
  );

  const displayed = tab === 'pending' ? pending : finished;

  return (
    <div className="space-y-8">
      <DoctorPageHeader
        title="My appointments"
        subtitle="Add consultation records per visit — finished visits are sent to reception for billing"
      />

      <div className="flex flex-wrap gap-2">
        <TabButton
          active={tab === 'pending'}
          onClick={() => setTab('pending')}
          label={`Needs consultation (${pending.length})`}
        />
        <TabButton
          active={tab === 'finished'}
          onClick={() => setTab('finished')}
          label={`Finished (${finished.length})`}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
          <p className="font-sans font-medium text-gray-700">No confirmed appointments yet</p>
          <p className="mt-1 font-sans text-sm text-gray-500">
            When reception confirms a visit and assigns you, it will appear here.
          </p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-4 font-sans text-base font-semibold text-gray-900">Calendar</h2>
            <DoctorAppointmentCalendar appointments={appointments} />
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-4 font-sans text-lg font-semibold text-gray-900">
              {tab === 'pending' ? 'Visits needing consultation' : 'Finished visits'}
              <span className="ml-2 text-sm font-normal text-gray-500">({displayed.length})</span>
            </h2>

            {displayed.length === 0 ? (
              <p className="font-sans text-sm text-gray-500">
                {tab === 'pending'
                  ? 'No visits waiting for consultation records.'
                  : 'No finished visits yet.'}
              </p>
            ) : (
              <ul className="space-y-3">
                {displayed.map((apt) => (
                  <li key={apt.id}>
                    <DoctorVisitCard appointment={apt} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 font-sans text-sm font-semibold transition ${
        active
          ? 'bg-[#ec6d13] text-white shadow-sm'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
