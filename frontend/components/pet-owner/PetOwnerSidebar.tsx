'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  welcomeName: string;
  email?: string;
  avatarUrl?: string | null;
};

function navClass(active: boolean) {
  return active
    ? 'flex w-full items-center gap-3 rounded-lg bg-[#ec6d13] px-4 py-3 font-semibold text-white'
    : 'flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-600 hover:bg-gray-50';
}

export default function PetOwnerSidebar({ welcomeName, email, avatarUrl }: Props) {
  const pathname = usePathname();

  const isHome = pathname === '/dashboard/pet-owner';
  const isAppointments = pathname.startsWith('/dashboard/pet-owner/appointments');
  const isHealth =
    pathname.startsWith('/dashboard/pet-owner/health') ||
    pathname.startsWith('/dashboard/pet-owner/medical-records') ||
    pathname.startsWith('/dashboard/pet-owner/vaccinations') ||
    pathname.startsWith('/dashboard/pet-owner/prescriptions');
  const isSettings = pathname === '/dashboard/settings';

  return (
    <aside className="fixed left-0 top-28 z-20 flex h-[calc(100vh-112px)] w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white p-6">
      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="flex flex-col items-center text-center">
          {avatarUrl ? (
            <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-sm">
              <img src={avatarUrl} alt={welcomeName} className="h-full w-full object-cover" />
            </div>
          ) : (
            <AvatarInitial name={welcomeName} />
          )}
          <h3 className="text-sm font-bold text-gray-900">{welcomeName}</h3>
          {email ? <p className="mt-1 text-xs text-gray-500">{email}</p> : null}
          <Link
            href="/dashboard/settings"
            className="mt-3 text-xs font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
          >
            Edit Profile →
          </Link>
        </div>
      </div>

      <nav className="shrink-0 space-y-2">
        <Link href="/dashboard/pet-owner" className={navClass(isHome)}>
          <HomeIcon />
          Home
        </Link>

        <Link href="/dashboard/pet-owner/appointments" className={navClass(isAppointments)}>
          <ClipboardIcon />
          My Appointments
        </Link>

        <Link href="/dashboard/pet-owner/health" className={navClass(isHealth)}>
          <HealthIcon />
          Pet Health
        </Link>

        <Link href="/dashboard/settings" className={navClass(isSettings)}>
          <SettingsIcon />
          Settings
        </Link>
      </nav>

      <div className="mt-auto pt-6">
        <HelpBox />
      </div>
    </aside>
  );
}

function AvatarInitial({ name }: { name: string }) {
  return (
    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#ec6d13] text-2xl font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function HelpBox() {
  return (
    <div className="rounded-lg bg-orange-50 p-4">
      <p className="mb-1 text-sm font-semibold text-gray-900">Need Help?</p>
      <p className="text-xs text-gray-600">Open our help center</p>
    </div>
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

function HealthIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
