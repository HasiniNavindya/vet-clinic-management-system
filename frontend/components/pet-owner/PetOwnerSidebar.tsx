'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  welcomeName: string;
  email?: string;
  avatarUrl?: string | null;
  onAddPet?: () => void;
};

function navClass(active: boolean) {
  return active
    ? 'flex items-center gap-3 rounded-lg bg-[#ec6d13] px-4 py-3 font-semibold text-white'
    : 'flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-600 hover:bg-gray-50';
}

export default function PetOwnerSidebar({ welcomeName, email, avatarUrl, onAddPet }: Props) {
  const pathname = usePathname();
  const isHome = pathname === '/dashboard/pet-owner';
  const isBook = pathname.endsWith('/appointments/book');
  const isAppointments =
    pathname.startsWith('/dashboard/pet-owner/appointments') && !isBook;

  return (
    <aside className="fixed left-0 top-28 z-10 hidden h-[calc(100vh-112px)] w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white p-6 md:flex">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ec6d13]">
          <span className="text-xl font-bold text-white">PO</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CARLISLE</h1>
          <p className="text-xs text-gray-500">Pet Care</p>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="flex flex-col items-center text-center">
          {avatarUrl ? (
            <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-sm">
              <img src={avatarUrl} alt={welcomeName} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#ec6d13] text-2xl font-bold text-white">
              {welcomeName.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-900">{welcomeName}</h3>
          {email ? <p className="mt-1 text-xs text-gray-500">{email}</p> : null}
          <Link href="/dashboard/settings" className="mt-3 text-xs font-semibold text-[#ec6d13] hover:text-[#d65e0f]">
            Edit Profile →
          </Link>
        </div>
      </div>

      <nav className="shrink-0 space-y-2">
        <Link href="/dashboard/pet-owner" className={navClass(isHome)}>
          Home
        </Link>
        <Link href="/dashboard/pet-owner/appointments/book" className={navClass(isBook)}>
          Book Appointment
        </Link>
        <Link href="/dashboard/pet-owner/appointments" className={navClass(isAppointments)}>
          My Appointments
        </Link>
        {onAddPet ? (
          <button type="button" onClick={onAddPet} className={`${navClass(false)} w-full`}>
            Add Pet
          </button>
        ) : null}
        <Link href="/dashboard/settings" className={navClass(pathname === '/dashboard/settings')}>
          Settings
        </Link>
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-900">Need Help?</p>
          <p className="text-xs text-gray-600">Book or manage appointments anytime</p>
        </div>
      </div>
    </aside>
  );
}
