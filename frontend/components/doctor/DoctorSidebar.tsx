'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DoctorAvatar from '@/components/doctor/DoctorAvatar';
import { doctorImageUrl } from '@/lib/appointments';

type Props = {
  welcomeName: string;
  specialization?: string;
  imageUrl?: string | null;
  imageCacheKey?: number;
};

function navClass(active: boolean) {
  return active
    ? 'flex w-full items-center gap-3 rounded-lg bg-[#ec6d13] px-4 py-2.5 text-sm font-semibold text-white'
    : 'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50';
}

export default function DoctorSidebar({
  welcomeName,
  specialization,
  imageUrl,
  imageCacheKey,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isHome = pathname === '/dashboard/doctor';
  const isAppointments =
    pathname.startsWith('/dashboard/doctor/appointments') ||
    pathname.startsWith('/dashboard/doctor/calendar');
  const isSettings = pathname.startsWith('/dashboard/doctor/settings');

  const avatarSrc = doctorImageUrl(imageUrl, imageCacheKey);

  const handleLogout = () => {
    logout();
    router.push('/login?role=doctor');
  };

  return (
    <aside className="fixed left-0 top-20 z-20 flex h-[calc(100vh-80px)] w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white p-5">
      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-sm">
            <DoctorAvatar
              name={welcomeName}
              imageUrl={avatarSrc}
              className="h-full w-full"
              textClassName="text-2xl"
            />
          </div>
          <h3 className="mt-3 font-sans text-base font-semibold text-gray-900">{welcomeName}</h3>
          {specialization ? (
            <p className="mt-1 text-xs text-gray-500">{specialization}</p>
          ) : null}
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#ec6d13]">
            Veterinarian
          </p>
        </div>
      </div>

      <nav className="shrink-0 space-y-2">
        <Link href="/dashboard/doctor" className={navClass(isHome)}>
          <HomeIcon />
          Dashboard
        </Link>
        <Link href="/dashboard/doctor/appointments" className={navClass(isAppointments)}>
          <ClipboardIcon />
          My appointments
        </Link>
        <Link href="/dashboard/doctor/settings" className={navClass(isSettings)}>
          <SettingsIcon />
          Profile settings
        </Link>
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Reception desk</p>
          <p className="mt-1 text-xs text-gray-600">
            Pending requests and payment are handled by reception. You only see confirmed visits.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

function HomeIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
